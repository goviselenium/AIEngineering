import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config();

export interface AppConfig {
  llm: {
    provider: 'ollama' | 'openai' | 'gemini' | 'anthropic';
    ollama: {
      baseUrl: string;
      model: string;
    };
    openai: {
      apiKey?: string;
      baseUrl: string;
      model: string;
    };
    gemini: {
      apiKey?: string;
      model: string;
    };
  };
  mcp: {
    port: number;
    logLevel: string;
  };
  paths: {
    root: string;
    testResults: string;
    reports: string;
  };
}

const rootDir = process.cwd();

export const config: AppConfig = {
  llm: {
    provider: (process.env.LLM_PROVIDER as any) || 'ollama',
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
      model: process.env.OLLAMA_MODEL || 'qwen2.5:latest',
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      model: process.env.OPENAI_MODEL || 'gpt-4o',
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    },
  },
  mcp: {
    port: parseInt(process.env.MCP_SERVER_PORT || '8080', 10),
    logLevel: process.env.MCP_LOG_LEVEL || 'info',
  },
  paths: {
    root: rootDir,
    testResults: path.join(rootDir, 'test-results'),
    reports: path.join(rootDir, 'playwright-report'),
  },
};
