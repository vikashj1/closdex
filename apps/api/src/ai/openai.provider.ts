import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { LlmCompleteOpts, LlmMessage, LlmProvider } from './llm-provider.interface';
import { LlmUsageService } from './llm-usage.service';

@Injectable()
export class OpenAiProvider implements LlmProvider {
  private readonly logger = new Logger(OpenAiProvider.name);
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(
    config: ConfigService,
    // @Optional so a caller that only wires OpenAiProvider without the
    // AiModule (e.g. isolated unit tests) doesn't have to also wire prisma.
    @Optional() private readonly usage?: LlmUsageService,
  ) {
    const apiKey = config.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not set — provider will fail at call time.');
    }
    const baseURL = config.get<string>('OPENAI_BASE_URL');
    this.client = new OpenAI({ apiKey: apiKey ?? 'missing', ...(baseURL ? { baseURL } : {}) });
    this.model = config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini';
  }

  async complete(messages: LlmMessage[], opts: LlmCompleteOpts = {}): Promise<string> {
    const t0 = Date.now();
    const res = await this.client.chat.completions.create({
      model: this.model,
      messages,
      max_tokens: opts.maxTokens ?? 400,
      temperature: opts.temperature ?? 0.8,
    });
    // Fire-and-forget usage log. Silent on failures — see LlmUsageService.
    this.usage?.log({
      provider: 'openai',
      model: this.model,
      inputTokens: res.usage?.prompt_tokens ?? 0,
      outputTokens: res.usage?.completion_tokens ?? 0,
      latencyMs: Date.now() - t0,
    });
    return res.choices[0]?.message?.content ?? '';
  }
}
