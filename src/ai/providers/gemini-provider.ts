import { LLMProvider, LLMMessage, LLMOptions, LLMResponse } from './base-provider.js';

export interface GeminiConfig {
  apiKey?: string;
  model?: string;
}

export class GeminiProvider implements LLMProvider {
  public name = 'gemini';
  private apiKey: string;
  private defaultModel: string;

  constructor(config: GeminiConfig) {
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY || '';
    this.defaultModel = config.model || 'gemini-2.0-flash';
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  async generate(prompt: string, options?: LLMOptions): Promise<LLMResponse> {
    return this.chat([{ role: 'user', content: prompt }], options);
  }

  async chat(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error('[GeminiProvider] GEMINI_API_KEY is not configured.');
    }

    const model = options?.model || this.defaultModel;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

    // Format messages for Gemini API
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const generationConfig: Record<string, any> = {
      temperature: options?.temperature ?? 0.2,
    };

    if (options?.jsonMode) {
      generationConfig.responseMimeType = 'application/json';
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini request failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      return {
        content,
        model,
        provider: this.name,
        raw: data,
      };
    } catch (error: any) {
      throw new Error(`[GeminiProvider] Error: ${error.message}`);
    }
  }
}
