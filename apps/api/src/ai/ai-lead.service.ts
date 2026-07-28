import { Inject, Injectable } from '@nestjs/common';
import { MessageSender } from '@closdex/db';
import { LLM_PROVIDER, LlmMessage, LlmProvider } from './llm-provider.interface';

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
}

export interface GoalVerdict {
  /** True when the salesperson has DEFINITIVELY achieved the stated goal. */
  goalAchieved: boolean;
  /** True when the conversation has clearly ended — either party walked
   *  away, said goodbye, declared the matter closed, or explicitly refused
   *  to continue. Used to short-circuit IN_PROGRESS so the user can't keep
   *  spamming messages into a closed conversation. */
  closed: boolean;
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
  }: RespondInput): Promise<string> {
    const summaryLine = priorSummary && priorSummary.trim().length > 0
      ? [
          ``,
          `EARLIER IN THIS CONVERSATION (summary):`,
          priorSummary.trim(),
          `(End of summary — the most recent turns continue below.)`,
        ]
      : [];

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

    const system = [
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
  }: EvaluateGoalInput): Promise<GoalVerdict> {
    if (history.length === 0) return { goalAchieved: false, closed: false };

    const transcript = history
      .map((m) => `${m.sender === MessageSender.SALESPERSON ? 'Salesperson' : personaName}: ${m.content}`)
      .join('\n');

    const summaryBlock = priorSummary && priorSummary.trim().length > 0
      ? `Earlier-conversation summary (treat as fact):\n${priorSummary.trim()}\n\n`
      : '';

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
    return { goalAchieved, closed };
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
