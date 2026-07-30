import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { LlmCompleteOpts, LlmMessage, LlmProvider } from './llm-provider.interface';
import { LlmUsageService } from './llm-usage.service';

@Injectable()
export class AnthropicProvider implements LlmProvider {
  private readonly logger = new Logger(AnthropicProvider.name);
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(
    config: ConfigService,
    @Optional() private readonly usage?: LlmUsageService,
  ) {
    const apiKey = config.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      this.logger.warn('ANTHROPIC_API_KEY not set — provider will fail at call time.');
    }
    this.client = new Anthropic({ apiKey: apiKey ?? 'missing' });
    // SOW T2 names Claude Haiku as the fallback LLM. Use the alias (no date suffix).
    this.model = config.get<string>('ANTHROPIC_MODEL') ?? 'claude-haiku-4-5';
  }

  async complete(messages: LlmMessage[], opts: LlmCompleteOpts = {}): Promise<string> {
    const t0 = Date.now();
    // Anthropic takes `system` as a separate field; the conversation must alternate user/assistant.
    const systemText = messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content)
      .join('\n\n');

    const convo = messages.filter((m) => m.role !== 'system');
    const lastIdx = convo.length - 1;

    const res = await this.client.messages.create({
      model: this.model,
      max_tokens: opts.maxTokens ?? 400,
      temperature: opts.temperature ?? 0.8,
      // Cache breakpoint #1: persona + frame is constant per attempt.
      // Haiku 4.5 min cacheable prefix is 4096 tokens; shorter prompts no-op silently — harmless.
      system: systemText
        ? [{ type: 'text', text: systemText, cache_control: { type: 'ephemeral' } }]
        : undefined,
      // Cache breakpoint #2: last message in history. As the conversation grows, each turn's
      // request prefix matches the prior turn's cached tail.
      messages: convo.map((m, i) => ({
        role: m.role as 'user' | 'assistant',
        content:
          i === lastIdx
            ? [{ type: 'text' as const, text: m.content, cache_control: { type: 'ephemeral' as const } }]
            : m.content,
      })),
    });

    this.usage?.log({
      provider: 'anthropic',
      model: this.model,
      inputTokens: (res.usage?.input_tokens ?? 0) + (res.usage?.cache_read_input_tokens ?? 0),
      outputTokens: res.usage?.output_tokens ?? 0,
      latencyMs: Date.now() - t0,
    });

    const block = res.content[0];
    return block && block.type === 'text' ? block.text : '';
  }
}
