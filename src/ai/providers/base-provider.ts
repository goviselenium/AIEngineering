export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  jsonMode?: boolean;
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: string;
  raw?: any;
}

export interface LLMProvider {
  name: string;
  generate(prompt: string, options?: LLMOptions): Promise<LLMResponse>;
  chat(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse>;
  isAvailable(): Promise<boolean>;
}

import { config } from '../../core/config.js';
import { OllamaProvider } from './ollama-provider.js';
import { OpenAIProvider } from './openai-provider.js';
import { GeminiProvider } from './gemini-provider.js';

let defaultInstance: LLMProvider | null = null;

export function getLLMProvider(providerName?: string): LLMProvider {
  const chosen = providerName || config.llm.provider;

  switch (chosen.toLowerCase()) {
    case 'ollama':
      return new OllamaProvider({
        baseUrl: config.llm.ollama.baseUrl,
        model: config.llm.ollama.model,
      });

    case 'openai':
      return new OpenAIProvider({
        apiKey: config.llm.openai.apiKey,
        baseUrl: config.llm.openai.baseUrl,
        model: config.llm.openai.model,
      });

    case 'gemini':
      return new GeminiProvider({
        apiKey: config.llm.gemini.apiKey,
        model: config.llm.gemini.model,
      });

    default:
      console.warn(`[LLMProvider] Unknown provider "${chosen}". Falling back to default Ollama.`);
      return new OllamaProvider({
        baseUrl: config.llm.ollama.baseUrl,
        model: config.llm.ollama.model,
      });
  }
}
