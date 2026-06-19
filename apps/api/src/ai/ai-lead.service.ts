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
  /** New messages to fold into the summary. */
  newMessages: Array<{ sender: MessageSender; content: string }>;
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
  }: RespondInput): Promise<string> {
    const summaryLine = priorSummary && priorSummary.trim().length > 0
      ? [
          ``,
          `EARLIER IN THIS CONVERSATION (summary):`,
          priorSummary.trim(),
          `(End of summary — the most recent turns continue below.)`,
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
      `Persona briefing:`,
      personaPrompt,
      ...summaryLine,
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
      `Output EXACTLY two lines, no extra text:`,
      `GOAL: YES`,
      `CLOSED: NO`,
      `(replace YES/NO with your verdict per line)`,
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

  /** Compresses the conversation history into a one-paragraph rolling summary.
   *  Called from AttemptsService once the message count crosses a threshold;
   *  the result is persisted on Conversation.summary so we don't re-summarize
   *  every turn. */
  async summarize({ personaName, existingSummary, newMessages }: SummarizeInput): Promise<string> {
    if (newMessages.length === 0) return existingSummary ?? '';

    const transcript = newMessages
      .map((m) => `${m.sender === MessageSender.SALESPERSON ? 'Salesperson' : 'Lead'}: ${m.content}`)
      .join('\n');

    const system = [
      `You are summarizing a sales-conversation chat between a salesperson and ${personaName}.`,
      `Produce a tight 4-6 sentence summary that preserves ONLY the details the lead`,
      `needs to stay continuous in character on the next turn:`,
      `- what the salesperson has revealed about their offering (price, product, integrations)`,
      `- what objections / concerns ${personaName} has raised and how they were addressed`,
      `- what the lead has committed to or refused (next steps, materials requested, no-gos)`,
      `- emotional tone of the lead (engaged, skeptical, irritated, etc.)`,
      `Do NOT include sales coaching, do NOT score the salesperson, do NOT mention you are an AI.`,
      `Write in third person, present tense, no headers.`,
    ].join('\n');

    const user = existingSummary && existingSummary.trim().length > 0
      ? `Existing summary (rolled up earlier turns):\n${existingSummary.trim()}\n\nNew turns to fold in:\n${transcript}\n\nReturn the updated summary.`
      : `Conversation so far:\n${transcript}\n\nReturn the summary.`;

    const reply = await this.llm.complete(
      [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      { maxTokens: 350, temperature: 0.3 },
    );
    return reply.trim();
  }
}
