import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LLM_PROVIDER, LlmProvider } from './llm-provider.interface';
import { OpenAiProvider } from './openai.provider';
import { AnthropicProvider } from './anthropic.provider';
import { AiLeadService } from './ai-lead.service';
import { LlmUsageService } from './llm-usage.service';

@Module({
  imports: [ConfigModule],
  providers: [
    LlmUsageService,
    OpenAiProvider,
    AnthropicProvider,
    {
      provide: LLM_PROVIDER,
      inject: [ConfigService, OpenAiProvider, AnthropicProvider],
      useFactory: (
        config: ConfigService,
        openai: OpenAiProvider,
        anthropic: AnthropicProvider,
      ): LlmProvider => {
        const provider = (config.get<string>('AI_PROVIDER') ?? 'openai').toLowerCase();
        return provider === 'anthropic' ? anthropic : openai;
      },
    },
    AiLeadService,
  ],
  exports: [AiLeadService, LLM_PROVIDER, LlmUsageService],
})
export class AiModule {}
