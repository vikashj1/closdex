import { Inject, Injectable } from '@nestjs/common';
import { MessageSender } from '@closdex/db';
import { LLM_PROVIDER, LlmMessage, LlmProvider } from './llm-provider.interface';

export const GOAL_ACHIEVED_TOKEN = '[GOAL:ACHIEVED]';

interface RespondInput {
  personaName: string;
  /** Admin-managed system prompt that drives the lead's behaviour. Never leaves the backend. */
  personaPrompt: string;
  history: Array<{ sender: MessageSender; content: string }>;
  /** When provided the lead appends GOAL_ACHIEVED_TOKEN if the goal is definitively met. */
  goalDescription?: string;
}

@Injectable()
export class AiLeadService {
  constructor(@Inject(LLM_PROVIDER) private readonly llm: LlmProvider) {}

  /** Produces the lead's next reply, staying in persona. */
  async respond({ personaName, personaPrompt, history, goalDescription }: RespondInput): Promise<string> {
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

    const system = [
      `You are ${personaName}, a sales lead being contacted by a salesperson.`,
      `Stay strictly in character. Never break role, never mention you are an AI.`,
      `Reply naturally — usually 1-3 short sentences, the way a real lead would on a chat.`,
      ``,
      `Persona briefing:`,
      personaPrompt,
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
}
