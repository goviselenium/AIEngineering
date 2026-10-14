import { LLMProvider, LLMMessage, LLMOptions, LLMResponse } from './base-provider.js';

export interface OllamaConfig {
  baseUrl: string;
  model: string;
}

export class OllamaProvider implements LLMProvider {
  public name = 'ollama';
  private baseUrl: string;
  private defaultModel: string;

  constructor(config: OllamaConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.defaultModel = config.model;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async generate(prompt: string, options?: LLMOptions): Promise<LLMResponse> {
    const model = options?.model || this.defaultModel;
    const body: Record<string, any> = {
      model,
      prompt,
      stream: false,
      options: {
        temperature: options?.temperature ?? 0.2,
      },
    };

    if (options?.jsonMode) {
      body.format = 'json';
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000), // 2 min timeout for local LLM inference
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama generate failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return {
        content: data.response ?? '',
        model,
        provider: this.name,
        raw: data,
      };
    } catch (error: any) {
      throw new Error(`[OllamaProvider] Error in generate(): ${error.message}`);
    }
  }

  async chat(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> {
    const model = options?.model || this.defaultModel;
    const body: Record<string, any> = {
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
      options: {
        temperature: options?.temperature ?? 0.2,
      },
    };

    if (options?.jsonMode) {
      body.format = 'json';
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama chat failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return {
        content: data.message?.content ?? '',
        model,
        provider: this.name,
        raw: data,
      };
    } catch (error: any) {
      throw new Error(`[OllamaProvider] Error in chat(): ${error.message}`);
    }
  }
}
