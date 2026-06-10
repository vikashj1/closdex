import { Inject, Injectable } from '@nestjs/common';
import { MessageSender } from '@closdex/db';
import { LLM_PROVIDER, LlmMessage, LlmProvider } from './llm-provider.interface';

export const GOAL_ACHIEVED_TOKEN = '[GOAL:ACHIEVED]';

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
  /** When provided the lead appends GOAL_ACHIEVED_TOKEN if the goal is definitively met. */
  goalDescription?: string;
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

  /** Produces the lead's next reply, staying in persona. */
  async respond({
    personaName,
    personaPrompt,
    history,
    priorSummary,
    goalDescription,
  }: RespondInput): Promise<string> {
    const goalLine = goalDescription
      ? [
          ``,
          `GOAL DETECTION (hidden from the salesperson):`,
          `The salesperson is trying to: ${goalDescription}`,
          `If the salesperson has DEFINITIVELY and UNAMBIGUOUSLY achieved this goal in the conversation`,
          `(e.g., you explicitly agreed to a specific time, sent a proposal, etc.),`,
          `append the exact token ${GOAL_ACHIEVED_TOKEN} on a new line at the very end of your reply.`,
          `Do NOT add it for vague or partial progress — only for clear, explicit achievement.`,
        ]
      : [];

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
      `Persona briefing:`,
      personaPrompt,
      ...summaryLine,
      ...goalLine,
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
