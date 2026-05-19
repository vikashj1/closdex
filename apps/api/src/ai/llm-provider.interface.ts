export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmCompleteOpts {
  maxTokens?: number;
  temperature?: number;
}

export interface LlmProvider {
  complete(messages: LlmMessage[], opts?: LlmCompleteOpts): Promise<string>;
}

export const LLM_PROVIDER = Symbol('LLM_PROVIDER');
