import { LLMProvider, LLMMessage, LLMOptions, LLMResponse } from './base-provider.js';

export interface OpenAIConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export class OpenAIProvider implements LLMProvider {
  public name = 'openai';
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor(config: OpenAIConfig) {
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || '';
    this.baseUrl = (config.baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
    this.defaultModel = config.model || 'gpt-4o';
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  async generate(prompt: string, options?: LLMOptions): Promise<LLMResponse> {
    return this.chat([{ role: 'user', content: prompt }], options);
  }

  async chat(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error('[OpenAIProvider] OPENAI_API_KEY is not configured.');
    }

    const model = options?.model || this.defaultModel;
    const body: Record<string, any> = {
      model,
      messages,
      temperature: options?.temperature ?? 0.2,
    };

    if (options?.jsonMode) {
      body.response_format = { type: 'json_object' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI request failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return {
        content: data.choices?.[0]?.message?.content ?? '',
        model,
        provider: this.name,
        raw: data,
      };
    } catch (error: any) {
      throw new Error(`[OpenAIProvider] Error: ${error.message}`);
    }
  }
}
