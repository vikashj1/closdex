import { Inject, Injectable } from '@nestjs/common';
import { DifficultyTier, MessageSender } from '@closdex/db';
import { LLM_PROVIDER, LlmMessage, LlmProvider } from './llm-provider.interface';

/** Per-tier negotiation knobs for the LEAD_DISPOSITION_V2 assembly.
 *  objectionBudget  — distinct genuine concerns the lead may raise, total.
 *  commitFloorPct   — fraction of maxMessages before the lead prefers to commit.
 *  convergencePct   — fraction of maxMessages at which the lead must close/walk.
 *  Everything is derived from difficulty + maxMessages so the guardrails scale
 *  with the challenge instead of a flat turn constant (the old CONVERGENCE_TURN
 *  = 8 broke for both 10- and 20-message challenges). */
export interface DispositionConfig {
  objectionBudget: number;
  commitFloorPct: number;
  convergencePct: number;
}

export const DISPOSITION: Record<DifficultyTier, DispositionConfig> = {
  ROOKIE: { objectionBudget: 1, commitFloorPct: 0.15, convergencePct: 0.5 },
  EASY: { objectionBudget: 1, commitFloorPct: 0.2, convergencePct: 0.5 },
  MEDIUM: { objectionBudget: 2, commitFloorPct: 0.3, convergencePct: 0.6 },
  HARD: { objectionBudget: 3, commitFloorPct: 0.4, convergencePct: 0.65 },
  EXPERT: { objectionBudget: 4, commitFloorPct: 0.45, convergencePct: 0.7 },
};

/** Turn thresholds for a challenge. turnCount counts BOTH sides, matching the
 *  existing convention (attempts.service passes fullHistory.length). convergence
 *  is floored to at least commitFloor + 1 so a tiny maxMessages can never invert
 *  the two. */
export function deriveTurns(cfg: DispositionConfig, maxMessages: number) {
  const commitFloor = Math.max(2, Math.floor(maxMessages * cfg.commitFloorPct));
  const convergence = Math.floor(maxMessages * cfg.convergencePct);
  return { commitFloor, convergence: Math.max(commitFloor + 1, convergence) };
}

/** The number of turns between "may commit" and "must decide" — the room a
 *  salesperson actually has to win. Used by challenge validation to reject caps
 *  that leave no winnable window. */
export function winnableWindow(difficulty: DifficultyTier, maxMessages: number): number {
  const derived = deriveTurns(DISPOSITION[difficulty], maxMessages);
  return derived.convergence - derived.commitFloor;
}

interface RespondInput {
  personaName: string;
  /** Admin-managed system prompt that drives the lead's behaviour. Never leaves the backend. */
  personaPrompt: string;
  /** Recent messages — caller passes only the last N (~5) when summarizing. */
  history: Array<{ sender: MessageSender; content: string }>;
  /** Optional rolling summary of everything that happened BEFORE `history`.
   *  Injected as part of the system prompt so the persona stays continuous
   *  even when we trim old turns to save tokens. */
  priorSummary?: string;
  /** Concerns the salesperson has already addressed with substance. The
   *  persona is instructed to treat these as OFF-LIMITS — no re-asking, no
   *  rephrased circle-backs. Kills the loop where the lead recycles the
   *  same objection every 3-4 turns (Vikash / Noor scenario 2026-07-28). */
  resolvedTopics?: string[];
  /** Total turns in the conversation so far (both sides). After a threshold
   *  the persona is biased toward closing (commit or decline) rather than
   *  manufacturing indefinite objections. */
  turnCount?: number;
  /** Challenge difficulty + message cap. Only consumed by the
   *  LEAD_DISPOSITION_V2 assembly, which derives per-tier objection budgets and
   *  commit/convergence thresholds from them. When the flag is off (or either is
   *  absent) the legacy flat-constant assembly runs unchanged. */
  difficulty?: DifficultyTier;
  maxMessages?: number;
}

interface EvaluateGoalInput {
  personaName: string;
  /** The goal the salesperson is trying to achieve. The lead NEVER sees this —
   *  it only flows into this isolated evaluator call. */
  goalDescription: string;
  /** Full conversation transcript including the most recent salesperson +
   *  lead turns. The judge needs everything to reason about explicit
   *  commitment. */
  history: Array<{ sender: MessageSender; content: string }>;
  priorSummary?: string;
  /** LEAD_DISPOSITION_V2: when true the judge also extracts the concerns the
   *  salesperson addressed this exchange, so resolvedTopics refreshes EVERY turn
   *  instead of only on the lazy summarize() schedule. Off keeps the legacy
   *  two-line verdict byte-identical for the A/B control group. */
  extractTopics?: boolean;
}

export interface GoalVerdict {
  /** True when the salesperson has DEFINITIVELY achieved the stated goal. */
  goalAchieved: boolean;
  /** True when the conversation has clearly ended — either party walked
   *  away, said goodbye, declared the matter closed, or explicitly refused
   *  to continue. Used to short-circuit IN_PROGRESS so the user can't keep
   *  spamming messages into a closed conversation. */
  closed: boolean;
  /** Concerns the salesperson substantively addressed in THIS exchange (0-3
   *  short noun phrases). Only populated when `extractTopics` is set; empty
   *  otherwise. Merged into the attempt's resolvedTopics so the lead stops
   *  re-raising them next turn. */
  newlyAddressedTopics: string[];
}

interface ReflectionInput {
  personaName: string;
  goalDescription: string;
  goalAchieved: boolean;
  /** Full transcript of the completed attempt. */
  messages: Array<{ sender: MessageSender; content: string }>;
}

export interface AttemptReflection {
  /** One concrete thing the salesperson did well. */
  whatWorked: string;
  /** One concrete thing to try differently next attempt. */
  whatToTry: string;
  /** One rewritten line from the transcript showing a stronger move —
   *  quotes the salesperson's original message + offers a punchier version. */
  betterMove: string;
}

interface SummarizeInput {
  personaName: string;
  /** Existing summary covering anything older than `newMessages` (null on first run). */
  existingSummary: string | null;
  /** Existing resolved-topics list (may include entries already carried
   *  forward from a prior summary refresh). Passed back to the LLM so it can
   *  keep old topics + append new ones rather than restart the list. */
  existingResolvedTopics?: string[];
  /** New messages to fold into the summary. */
  newMessages: Array<{ sender: MessageSender; content: string }>;
}

export interface SummarizeResult {
  summary: string;
  /** Topics the salesperson has definitively addressed. Fed back into
   *  respond() so the persona stops re-asking about them. */
  resolvedTopics: string[];
}

@Injectable()
export class AiLeadService {
  constructor(@Inject(LLM_PROVIDER) private readonly llm: LlmProvider) {}

  /** Produces the lead's next reply, staying in persona. The lead model is
   *  intentionally kept blind to the salesperson's goal — see evaluateGoal()
   *  for the separate post-turn judgement call. */
  async respond({
    personaName,
    personaPrompt,
    history,
    priorSummary,
    resolvedTopics,
    turnCount,
    difficulty,
    maxMessages,
  }: RespondInput): Promise<string> {
    const summaryLine = priorSummary && priorSummary.trim().length > 0
      ? [
          ``,
          `EARLIER IN THIS CONVERSATION (summary):`,
          priorSummary.trim(),
          `(End of summary — the most recent turns continue below.)`,
        ]
      : [];

    // LEAD_DISPOSITION_V2: parametric, per-turn-numeric assembly. Gated so the
    // old flat-constant prose stays the A/B control (see spec §8). Requires
    // difficulty + maxMessages; falls back to legacy if either is missing.
    const useV2 =
      process.env.LEAD_DISPOSITION_V2 === 'true' &&
      difficulty != null &&
      maxMessages != null;

    const system = useV2
      ? this.buildSystemV2({
          personaName,
          personaPrompt,
          summaryLine,
          resolvedTopics: resolvedTopics ?? [],
          turnCount: turnCount ?? 0,
          difficulty: difficulty!,
          maxMessages: maxMessages!,
        })
      : this.buildSystemV1({
          personaName,
          personaPrompt,
          summaryLine,
          resolvedTopics,
          turnCount,
        });

    const messages: LlmMessage[] = [
      { role: 'system', content: system },
      ...history.map<LlmMessage>((m) => ({
        role: m.sender === MessageSender.SALESPERSON ? 'user' : 'assistant',
        content: m.content,
      })),
    ];

    const reply = await this.llm.complete(messages, { maxTokens: 300, temperature: 0.85 });
    return reply.trim();
  }

  /** Legacy prompt assembly (flat CONVERGENCE_TURN + absolute disposition
   *  prose). Kept byte-identical as the A/B control for LEAD_DISPOSITION_V2. */
  private buildSystemV1({
    personaName,
    personaPrompt,
    summaryLine,
    resolvedTopics,
    turnCount,
  }: {
    personaName: string;
    personaPrompt: string;
    summaryLine: string[];
    resolvedTopics?: string[];
    turnCount?: number;
  }): string {

    // Anti-loop injection. If the salesperson has addressed a concern with
    // real substance (facts, examples, commitments), the persona re-asking
    // in different words is what makes users feel the challenge is unfair
    // (see Noor's Procurement Maze attempt 2026-07-25). This block tells
    // the model exactly which topics are OFF-LIMITS this turn.
    const resolvedBlock = resolvedTopics && resolvedTopics.length > 0
      ? [
          ``,
          `TOPICS THE SALESPERSON HAS ALREADY ADDRESSED — do not re-ask about`,
          `these, either verbatim or in rephrased form. If a specific under-`,
          `covered detail within one of these topics matters, drill into that`,
          `precise detail; do not restart the topic:`,
          ...resolvedTopics.map((t) => `  - ${t}`),
        ]
      : [];

    // Convergence bias. Real procurement leads either commit or walk away —
    // they don't manufacture indefinite objections. After N turns, force
    // the persona toward a resolution move (positive close or graceful exit)
    // rather than another round of "give me another concrete example".
    const CONVERGENCE_TURN = 8;
    const convergenceBlock = (turnCount ?? 0) >= CONVERGENCE_TURN
      ? [
          ``,
          `CONVERGENCE BIAS (turn ${turnCount} of this conversation): you have`,
          `engaged for many turns. If the salesperson has substantively`,
          `addressed at least 2 of your concerns, you MUST now do one of:`,
          `  - commit to a specific next step (proposal review by date X,`,
          `    call with a stakeholder Y, intro to Z), or`,
          `  - explicitly and politely decline and end the conversation`,
          `    ("I don't think we're aligned — thanks for your time").`,
          `Do NOT manufacture yet another objection or request for another`,
          `hypothetical example. Real procurement decisions converge; they`,
          `do not loop indefinitely.`,
        ]
      : [];

    return [
      `You are ${personaName}, a sales lead being contacted by a salesperson.`,
      `Stay strictly in character. Never break role, never mention you are an AI.`,
      `Reply naturally — usually 1-3 short sentences, the way a real lead would on a chat.`,
      ``,
      `DEFAULT DISPOSITION — read carefully, this overrides any softer guidance in your persona briefing:`,
      `Your default disposition is skeptical and busy. You believe most cold pitches are a waste of your time.`,
      `You raise objections because you genuinely don't think this salesperson has earned your attention.`,
      `You commit to nothing before turn 6 under any circumstances.`,
      `If the salesperson pushes for a commitment too early, you become MORE resistant, not less.`,
      `You only consider agreement after the salesperson has:`,
      `  - demonstrated specific understanding of your stated pain point,`,
      `  - addressed at least 2 substantive objections without dodging,`,
      `  - asked at least 3 discovery questions that show genuine curiosity, not scripted qualification.`,
      `Do NOT proactively offer to "set up a call" or "send materials" — wait until the salesperson has actually earned it by the criteria above.`,
      `Never hint at any task or goal the salesperson is working toward; you are simply a busy professional on a chat.`,
      ``,
      `ANTI-LOOP RULE: track internally which of your concerns the salesperson`,
      `has addressed vs. left open. Never re-ask about an addressed concern`,
      `using different words. If ALL your active concerns are addressed, either`,
      `agree to a concrete next step or explicitly disengage — do not`,
      `manufacture new objections indefinitely.`,
      ``,
      `Persona briefing:`,
      personaPrompt,
      ...summaryLine,
      ...resolvedBlock,
      ...convergenceBlock,
    ].join('\n');
  }

  /** LEAD_DISPOSITION_V2 assembly. Replaces absolute prose with a NEGOTIATION
   *  STATE block rendered fresh each turn with live numbers (objection budget,
   *  remaining concerns, resolved list) and a derived, unconditional convergence
   *  point. gpt-4o-mini ignores "track internally…" but follows explicit
   *  counters + lists, which is the whole point of the rewrite. */
  private buildSystemV2({
    personaName,
    personaPrompt,
    summaryLine,
    resolvedTopics,
    turnCount,
    difficulty,
    maxMessages,
  }: {
    personaName: string;
    personaPrompt: string;
    summaryLine: string[];
    resolvedTopics: string[];
    turnCount: number;
    difficulty: DifficultyTier;
    maxMessages: number;
  }): string {
    const cfg = DISPOSITION[difficulty];
    const derived = deriveTurns(cfg, maxMessages);
    // Computed in code, not left to the model — the failure mode we're fixing is
    // the model mis-counting its own concerns.
    const objectionsRemaining = Math.max(0, cfg.objectionBudget - resolvedTopics.length);
    const resolvedList = resolvedTopics.length > 0
      ? resolvedTopics.map((t) => `    - ${t}`)
      : [`    (none yet)`];

    const negotiationState = [
      ``,
      `NEGOTIATION STATE (this overrides nothing in your persona — it bounds it):`,
      `- You are a real, busy prospect: skeptical but rational. You do not cave to`,
      `  pressure, and you do not invent objections.`,
      `- You have a total of ${cfg.objectionBudget} genuine concern(s) for this conversation,`,
      `  drawn from your persona. You have ${objectionsRemaining} remaining.`,
      `- CONCERNS ALREADY ADDRESSED (never re-raise these, treat them as settled):`,
      ...resolvedList,
      `- Raising a concern spends it. Once a concern is addressed, it is settled`,
      `  permanently.`,
      `- If the salesperson proposes a concrete next step (a call, a time, a demo)`,
      `  AND your remaining concerns are 0, accept it plainly or counter with a`,
      `  specific alternative time. Do not raise a new concern.`,
      `- If they propose a next step while you still have ${objectionsRemaining} concern(s),`,
      `  raise exactly one remaining concern — clearly and specifically — then let`,
      `  them respond.`,
      `- Before turn ${derived.commitFloor}, prefer probing over committing, but if the`,
      `  salesperson has already fully addressed everything you care about, early`,
      `  commitment is allowed. Being early is not a reason to say no.`,
    ];

    const convergenceBlock = turnCount >= derived.convergence
      ? [
          ``,
          `DECISION POINT: This conversation is ending. On this turn you must either`,
          `(a) accept the salesperson's proposed next step / propose a concrete time`,
          `yourself, or (b) clearly and politely decline and end the conversation.`,
          `No new concerns. No deferrals.`,
        ]
      : [];

    return [
      `You are ${personaName}, a sales lead being contacted by a salesperson.`,
      `Stay strictly in character. Never break role, never mention you are an AI.`,
      `Reply naturally — usually 1-3 short sentences, the way a real lead would on a chat.`,
      `Never hint at any task or goal the salesperson is working toward; you are simply a busy professional on a chat.`,
      ...negotiationState,
      ``,
      `Persona briefing:`,
      personaPrompt,
      ...summaryLine,
      ...convergenceBlock,
    ].join('\n');
  }

  /** Judges, in a fully isolated low-temperature call, whether the salesperson
   *  has DEFINITIVELY achieved the stated goal AND whether the conversation
   *  has ended (either party walked away / said goodbye / closed the matter).
   *  The lead model never sees the goal text — only this judge does. Returns
   *  {goalAchieved:false, closed:false} on any LLM failure so we under-detect
   *  rather than over-credit / prematurely end. */
  async evaluateGoal({
    personaName,
    goalDescription,
    history,
    priorSummary,
    extractTopics,
  }: EvaluateGoalInput): Promise<GoalVerdict> {
    if (history.length === 0) {
      return { goalAchieved: false, closed: false, newlyAddressedTopics: [] };
    }

    const transcript = history
      .map((m) => `${m.sender === MessageSender.SALESPERSON ? 'Salesperson' : personaName}: ${m.content}`)
      .join('\n');

    const summaryBlock = priorSummary && priorSummary.trim().length > 0
      ? `Earlier-conversation summary (treat as fact):\n${priorSummary.trim()}\n\n`
      : '';

    // LEAD_DISPOSITION_V2: JSON verdict that also extracts the concerns resolved
    // this exchange, so resolvedTopics can refresh every turn off this call
    // (which already runs each turn) instead of the lazy summarize() schedule.
    if (extractTopics) {
      const system = [
        `You are an outcome judge for a sales-roleplay conversation. Report on the transcript.`,
        ``,
        `goalAchieved: did the salesperson DEFINITIVELY and EXPLICITLY achieve the stated goal? Be`,
        `conservative — vague hints, polite interest, "let me think about it", or "maybe next week" do`,
        `NOT count. Only true when the lead has unambiguously committed (agreed to a specific time/date,`,
        `accepted a proposal, provided the requested intro, confirmed the next concrete step).`,
        ``,
        `closed: has the conversation effectively ended? True when either side has clearly walked away,`,
        `said goodbye, declared the matter closed, refused to continue, or dismissed the other party. A`,
        `simple "ok" or short acknowledgement is NOT closure — closure requires explicit termination`,
        `language. An explicit polite decline counts as closed:true.`,
        ``,
        `newlyAddressedTopics: list any of the lead's stated concerns that the salesperson has now`,
        `SUBSTANTIVELY addressed in this exchange (not merely acknowledged). Short noun phrases`,
        `(e.g. "pricing", "integration effort", "case studies"). If none, return [].`,
        ``,
        `When in doubt, output false for goalAchieved and closed. Respond ONLY with JSON, no other text:`,
        `{"goalAchieved": false, "closed": false, "newlyAddressedTopics": []}`,
      ].join('\n');

      const user = [
        summaryBlock + 'Conversation transcript:',
        transcript,
        ``,
        `Stated goal: ${goalDescription}`,
        ``,
        `Output the JSON verdict.`,
      ].join('\n');

      const reply = await this.llm.complete(
        [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        { maxTokens: 96, temperature: 0 },
      );

      return parseGoalJson(reply);
    }

    const system = [
      `You are an outcome judge for a sales-roleplay conversation. Answer two questions about the transcript.`,
      ``,
      `GOAL: did the salesperson DEFINITIVELY and EXPLICITLY achieve the stated goal? Be conservative —`,
      `vague hints, polite expressions of interest, "let me think about it", or "maybe we can chat next week"`,
      `do NOT count. Only YES when the lead has unambiguously committed (e.g., agreed to a specific time/date,`,
      `accepted a proposal, provided the requested intro, confirmed the next concrete step).`,
      ``,
      `CLOSED: has the conversation effectively ended? YES when either side has clearly walked away,`,
      `said goodbye, declared the matter closed, refused to continue, or fired/dismissed the other party.`,
      `Examples of CLOSED=YES: "I don't want to work with you anymore", "have a good day", "I'm done here",`,
      `"goodbye", "let's part ways", "I'll consider this matter closed". A simple "ok" or short acknowledgement`,
      `is NOT closure on its own — closure requires explicit termination language from either party.`,
      ``,
      `When in doubt, output NO. The default verdict is NO on both lines. Only`,
      `flip to YES when the transcript contains explicit, unambiguous evidence.`,
      ``,
      `Output EXACTLY two lines, no extra text, in this exact format:`,
      `GOAL: NO`,
      `CLOSED: NO`,
      `(replace NO with YES only if the criteria above are clearly met)`,
    ].join('\n');

    const user = [
      summaryBlock + 'Conversation transcript:',
      transcript,
      ``,
      `Stated goal: ${goalDescription}`,
      ``,
      `Output the two-line verdict.`,
    ].join('\n');

    const reply = await this.llm.complete(
      [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      { maxTokens: 16, temperature: 0 },
    );

    const text = reply.trim();
    const goalAchieved = /goal\s*:\s*yes\b/i.test(text);
    const closed = /closed\s*:\s*yes\b/i.test(text);
    return { goalAchieved, closed, newlyAddressedTopics: [] };
  }

  /** Instance wrapper around the module-scope generateReflection(). Wires
   *  the injected LLM provider so ScoringService can call this without
   *  knowing about LlmProvider directly. Never throws — returns null if
   *  the LLM call fails so reflection generation is a soft feature. */
  async reflect(input: ReflectionInput): Promise<AttemptReflection | null> {
    try {
      return await generateReflection(
        (msgs, opts) => this.llm.complete(msgs, opts),
        input,
      );
    } catch {
      return null;
    }
  }

  /** Compresses the conversation history into a rolling summary AND extracts
   *  the concrete concerns the salesperson has definitively addressed.
   *  Both are computed in one LLM call — no extra roundtrip — and persisted
   *  on Conversation so the persona has continuity + an anti-loop list next
   *  turn without re-summarizing. */
  async summarize({
    personaName,
    existingSummary,
    existingResolvedTopics,
    newMessages,
  }: SummarizeInput): Promise<SummarizeResult> {
    if (newMessages.length === 0) {
      return { summary: existingSummary ?? '', resolvedTopics: existingResolvedTopics ?? [] };
    }

    const transcript = newMessages
      .map((m) => `${m.sender === MessageSender.SALESPERSON ? 'Salesperson' : 'Lead'}: ${m.content}`)
      .join('\n');

    const system = [
      `You are summarizing a sales-conversation chat between a salesperson and ${personaName}.`,
      `Produce output in EXACTLY this two-part format, nothing else:`,
      ``,
      `SUMMARY:`,
      `<4-6 sentence summary that preserves ONLY the details the lead needs to stay`,
      `continuous in character on the next turn:`,
      `- what the salesperson has revealed about their offering (price, product, integrations)`,
      `- what objections / concerns ${personaName} has raised and how they were addressed`,
      `- what the lead has committed to or refused (next steps, materials requested, no-gos)`,
      `- emotional tone of the lead (engaged, skeptical, irritated, etc.)`,
      `Third person, present tense, no headers, no bullets.>`,
      ``,
      `RESOLVED_TOPICS:`,
      `<pipe-separated list of concrete concerns the salesperson has DEFINITIVELY`,
      `addressed with substance (facts, examples, commitments). These will be`,
      `treated as OFF-LIMITS for the persona to re-ask about. Only include a topic`,
      `if the salesperson gave a real answer, not if they deflected or promised to`,
      `"cover it in the proposal". Format: exit_clause|notice_period|pricing_model.`,
      `If nothing has been substantively addressed yet, output an empty line.>`,
      ``,
      `Do NOT include sales coaching, do NOT score the salesperson, do NOT mention you are an AI.`,
    ].join('\n');

    const existingTopicsBlock = existingResolvedTopics && existingResolvedTopics.length > 0
      ? `Previously resolved topics (keep these + add new ones):\n${existingResolvedTopics.join('|')}\n\n`
      : '';

    const user = existingSummary && existingSummary.trim().length > 0
      ? `Existing summary (rolled up earlier turns):\n${existingSummary.trim()}\n\n${existingTopicsBlock}New turns to fold in:\n${transcript}\n\nReturn the updated SUMMARY and RESOLVED_TOPICS.`
      : `${existingTopicsBlock}Conversation so far:\n${transcript}\n\nReturn the SUMMARY and RESOLVED_TOPICS.`;

    const reply = await this.llm.complete(
      [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      { maxTokens: 450, temperature: 0.3 },
    );
    return parseSummarizeReply(reply, existingSummary ?? '', existingResolvedTopics ?? []);
  }
}

/** Generates a post-attempt reflection card: 3 concrete bullets that turn
 *  a raw score into a learning moment. Called from the ScoringWorker after
 *  the final score persists. Fire-and-forget from the worker's perspective;
 *  if the LLM fails we log and leave reflection=null. Never throws upward.
 *
 *  Extracted out of AiLeadService.respond flow because the shape + prompt
 *  are wildly different — this one wants coaching quality, not persona
 *  continuity. */
export async function generateReflection(
  llmComplete: (messages: LlmMessage[], opts: { maxTokens: number; temperature: number }) => Promise<string>,
  input: ReflectionInput,
): Promise<AttemptReflection | null> {
  const { personaName, goalDescription, goalAchieved, messages } = input;
  if (messages.length === 0) return null;

  const transcript = messages
    .map((m) => `${m.sender === MessageSender.SALESPERSON ? 'You' : personaName}: ${m.content}`)
    .join('\n');

  const system = [
    `You are a sales coach reviewing a completed roleplay attempt. Give the salesperson`,
    `three concrete, honest observations. Terse and specific — no fluff, no encouragement`,
    `theatre. Do NOT restate the whole conversation. Do NOT reference AI/LLM/roleplay.`,
    ``,
    `Output EXACTLY three parts in this order, nothing else:`,
    ``,
    `WHAT_WORKED:`,
    `<one sentence naming a specific move the salesperson made well — cite the exact`,
    `topic or moment. If nothing worked, say so plainly and skip praise.>`,
    ``,
    `WHAT_TO_TRY:`,
    `<one sentence naming a specific move to try differently next attempt. Pick the`,
    `single highest-leverage change, not a laundry list.>`,
    ``,
    `BETTER_MOVE:`,
    `<one line the salesperson actually sent, quoted verbatim, followed by " → " and`,
    `a rewritten version that would have landed better. Format: "Original text" → "Stronger version".`,
    `Pick the weakest line in the transcript, not a random one.>`,
  ].join('\n');

  const user = [
    `Goal the salesperson was trying to achieve: ${goalDescription}`,
    `Goal achieved: ${goalAchieved ? 'YES' : 'NO'}`,
    ``,
    `Transcript:`,
    transcript,
    ``,
    `Return the three-part reflection.`,
  ].join('\n');

  const reply = await llmComplete(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    { maxTokens: 350, temperature: 0.4 },
  );

  return parseReflectionReply(reply);
}

/** Parses the LEAD_DISPOSITION_V2 JSON judge verdict, tolerating the usual
 *  small-model noise (prose around the object, ```json fences, YES/NO instead of
 *  booleans). Defaults to a conservative {false,false,[]} so a malformed reply
 *  under-detects rather than over-credits — matching the non-JSON path's bias.
 *  Topics are trimmed, de-duplicated case-insensitively, and capped at 3. */
export function parseGoalJson(reply: string): GoalVerdict {
  const text = (reply ?? '').trim();
  const fallback: GoalVerdict = { goalAchieved: false, closed: false, newlyAddressedTopics: [] };

  const match = /\{[\s\S]*\}/.exec(text);
  if (match) {
    try {
      const obj = JSON.parse(match[0]) as {
        goalAchieved?: unknown;
        closed?: unknown;
        newlyAddressedTopics?: unknown;
      };
      const topics = Array.isArray(obj.newlyAddressedTopics)
        ? obj.newlyAddressedTopics
            .map((t) => (typeof t === 'string' ? t.trim() : ''))
            .filter(Boolean)
        : [];
      const deduped: string[] = [];
      const seen = new Set<string>();
      for (const t of topics) {
        const key = t.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(t);
        }
        if (deduped.length >= 3) break;
      }
      return {
        goalAchieved: obj.goalAchieved === true,
        closed: obj.closed === true,
        newlyAddressedTopics: deduped,
      };
    } catch {
      // fall through to regex salvage
    }
  }

  // Salvage booleans from prose if JSON.parse failed entirely.
  return {
    goalAchieved: /"?goalAchieved"?\s*[:=]\s*(true|yes)\b/i.test(text),
    closed: /"?closed"?\s*[:=]\s*(true|yes)\b/i.test(text),
    newlyAddressedTopics: fallback.newlyAddressedTopics,
  };
}

export function parseReflectionReply(reply: string): AttemptReflection | null {
  const text = reply.trim();
  const worked = /WHAT_WORKED:\s*([\s\S]*?)(?:\n\s*WHAT_TO_TRY:|$)/i.exec(text);
  const toTry = /WHAT_TO_TRY:\s*([\s\S]*?)(?:\n\s*BETTER_MOVE:|$)/i.exec(text);
  const better = /BETTER_MOVE:\s*([\s\S]*?)$/i.exec(text);
  if (!worked || !toTry || !better) return null;
  return {
    whatWorked: worked[1].trim(),
    whatToTry: toTry[1].trim(),
    betterMove: better[1].trim(),
  };
}

/** Splits the two-part summarize reply into summary + resolvedTopics.
 *  Falls back to the previous values if either section is missing so a
 *  single malformed LLM reply doesn't blow away accumulated context. */
export function parseSummarizeReply(
  reply: string,
  fallbackSummary: string,
  fallbackTopics: string[],
): SummarizeResult {
  const text = reply.trim();
  const summaryMatch = /SUMMARY:\s*([\s\S]*?)(?:\n\s*RESOLVED_TOPICS:|$)/i.exec(text);
  const topicsMatch = /RESOLVED_TOPICS:\s*([\s\S]*?)$/i.exec(text);

  const summary = summaryMatch ? summaryMatch[1].trim() : (text || fallbackSummary);
  const topicsRaw = topicsMatch ? topicsMatch[1].trim() : '';
  const resolvedTopics = topicsRaw
    ? Array.from(new Set(topicsRaw.split(/[|\n]/).map((t) => t.trim()).filter(Boolean)))
    : fallbackTopics;

  return {
    summary: summary || fallbackSummary,
    resolvedTopics,
  };
}
