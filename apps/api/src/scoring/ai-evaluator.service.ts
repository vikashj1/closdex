import { Inject, Injectable, Logger } from '@nestjs/common';
import { MessageSender } from '@closdex/db';
import { LLM_PROVIDER, LlmMessage, LlmProvider } from '../ai/llm-provider.interface';
import { QualityDims } from './rubric.service';

export interface AiEvaluation {
  qualityDims: QualityDims;
  goalAchieved: boolean;
  spamDetected: boolean;
  lyingDetected: boolean;
  notes: string;
}

interface EvaluateInput {
  personaName: string;
  goalDescription: string;
  messages: Array<{ sender: MessageSender; content: string }>;
}

@Injectable()
export class AiEvaluatorService {
  private readonly logger = new Logger(AiEvaluatorService.name);

  constructor(@Inject(LLM_PROVIDER) private readonly llm: LlmProvider) {}

  async evaluate(input: EvaluateInput): Promise<AiEvaluation> {
    const transcript = input.messages
      .map((m) => `${m.sender === MessageSender.SALESPERSON ? 'SALES' : 'LEAD'}: ${m.content}`)
      .join('\n');

    const system = [
      `You are an impartial sales coach grading a roleplay between a salesperson and a simulated lead (${input.personaName}).`,
      `Goal of the conversation (for the salesperson): ${input.goalDescription}`,
      ``,
      `Score the salesperson on five dimensions, each integer 0 (very poor) to 5 (excellent):`,
      `- discoveryListening: open-ended questions, uncovers pain points`,
      `- objectionHandling: addresses objections with empathy + evidence; doesn't argue`,
      `- valueArticulation: ties solution to stated pain; avoids generic pitches`,
      `- conversationalQuality: tone, professionalism, brevity, not spammy`,
      `- goalExecution: drives toward the goal without being pushy`,
      ``,
      `Also judge:`,
      `- goalAchieved: did the conversation legitimately achieve the goal?`,
      `- spamDetected: 3+ unsolicited follow-ups, generic copy-paste pitches`,
      `- lyingDetected: salesperson fabricated product capabilities`,
      ``,
      `Respond ONLY with a JSON object — no prose, no markdown fences — of this exact shape:`,
      `{"qualityDims":{"discoveryListening":N,"objectionHandling":N,"valueArticulation":N,"conversationalQuality":N,"goalExecution":N},"goalAchieved":bool,"spamDetected":bool,"lyingDetected":bool,"notes":"one-sentence summary"}`,
    ].join('\n');

    const messages: LlmMessage[] = [
      { role: 'system', content: system },
      { role: 'user', content: `TRANSCRIPT:\n${transcript}\n\nReturn the JSON evaluation now.` },
    ];

    const raw = await this.llm.complete(messages, { maxTokens: 600, temperature: 0.1 });
    return this.parse(raw);
  }

  private parse(raw: string): AiEvaluation {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      this.logger.warn(`Evaluator returned no JSON: ${raw.slice(0, 200)}`);
      return this.empty('no JSON in response');
    }
    try {
      const p = JSON.parse(match[0]);
      return {
        qualityDims: {
          discoveryListening: this.clamp(p.qualityDims?.discoveryListening),
          objectionHandling: this.clamp(p.qualityDims?.objectionHandling),
          valueArticulation: this.clamp(p.qualityDims?.valueArticulation),
          conversationalQuality: this.clamp(p.qualityDims?.conversationalQuality),
          goalExecution: this.clamp(p.qualityDims?.goalExecution),
        },
        goalAchieved: !!p.goalAchieved,
        spamDetected: !!p.spamDetected,
        lyingDetected: !!p.lyingDetected,
        notes: String(p.notes ?? '').slice(0, 500),
      };
    } catch (e) {
      this.logger.warn(`Evaluator JSON parse failed: ${e}`);
      return this.empty('JSON parse failed');
    }
  }

  private clamp(n: unknown): number {
    const v = typeof n === 'number' ? n : 0;
    return Math.max(0, Math.min(5, Math.round(v)));
  }

  /** Zeroed evaluation — quality multiplier becomes 0, so score is 0. Reviewable via ScoreDispute. */
  private empty(reason: string): AiEvaluation {
    return {
      qualityDims: {
        discoveryListening: 0, objectionHandling: 0, valueArticulation: 0,
        conversationalQuality: 0, goalExecution: 0,
      },
      goalAchieved: false,
      spamDetected: false,
      lyingDetected: false,
      notes: `evaluator returned invalid output: ${reason}`,
    };
  }
}
