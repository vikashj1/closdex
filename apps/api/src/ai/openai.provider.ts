import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { LlmCompleteOpts, LlmMessage, LlmProvider } from './llm-provider.interface';

@Injectable()
export class OpenAiProvider implements LlmProvider {
  private readonly logger = new Logger(OpenAiProvider.name);
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not set — provider will fail at call time.');
    }
    // OPENAI_BASE_URL lets us point at any OpenAI-compatible endpoint
    // (NVIDIA NIM, OpenRouter, vLLM, etc.). Omit to use api.openai.com.
    const baseURL = config.get<string>('OPENAI_BASE_URL');
    this.client = new OpenAI({ apiKey: apiKey ?? 'missing', ...(baseURL ? { baseURL } : {}) });
    // SOW T2 names GPT-4o-mini as the primary LLM.
    this.model = config.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini';
  }

  async complete(messages: LlmMessage[], opts: LlmCompleteOpts = {}): Promise<string> {
    const res = await this.client.chat.completions.create({
      model: this.model,
      messages,
      max_tokens: opts.maxTokens ?? 400,
      temperature: opts.temperature ?? 0.8,
    });
    return res.choices[0]?.message?.content ?? '';
  }
}
