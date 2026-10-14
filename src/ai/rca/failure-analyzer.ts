import { LLMProvider, getLLMProvider } from '../providers/base-provider.js';
import { FailedTestEvidence } from './trace-parser.js';

export type FailureClassification =
  | 'APPLICATION_DEFECT'
  | 'LOCATOR_DRIFT'
  | 'API_DELAY_OR_ENVIRONMENT'
  | 'TEST_DATA_MISMATCH'
  | 'SYNCHRONIZATION_FLAKE';

export interface RCADiagnosis {
  testTitle: string;
  testFile: string;
  classification: FailureClassification;
  summary: string;
  possibleCause: string;
  evidence: string[];
  recommendedInvestigation: string;
  suggestedFix?: string;
  confidenceScore: number;
  providerUsed: string;
}

export class FailureAnalyzer {
  private llm: LLMProvider;

  constructor(llmProvider?: LLMProvider) {
    this.llm = llmProvider || getLLMProvider();
  }

  /**
   * Analyze a failed test evidence package using the LLM
   */
  async analyzeFailure(evidence: FailedTestEvidence): Promise<RCADiagnosis> {
    const isAvailable = await this.llm.isAvailable();
    if (!isAvailable) {
      console.warn(`[FailureAnalyzer] LLM provider "${this.llm.name}" is not reachable. Using heuristic fallback analysis.`);
      return this.heuristicFallback(evidence);
    }

    const systemPrompt = `You are an expert Principal SDET and Quality Architect.
Analyze the provided Playwright test execution failure, network logs, and error stack trace.
You must categorize the failure and produce actionable, evidence-based root-cause analysis.

You MUST respond strictly with a valid JSON object matching this schema:
{
  "classification": "APPLICATION_DEFECT" | "LOCATOR_DRIFT" | "API_DELAY_OR_ENVIRONMENT" | "TEST_DATA_MISMATCH" | "SYNCHRONIZATION_FLAKE",
  "summary": "Brief 1-line summary of failure",
  "possibleCause": "Detailed explanation of why it failed",
  "evidence": ["Bullet point 1 referencing specific log/error", "Bullet point 2 referencing network/timing"],
  "recommendedInvestigation": "Concrete next steps for the SDET to verify",
  "suggestedFix": "Code snippet or architectural recommendation",
  "confidenceScore": 0.85
}
Do not wrap in markdown or backticks if possible, return raw JSON.`;

function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');
}

    const cleanError = stripAnsi(evidence.errorMessage).slice(0, 500);
    const cleanStack = stripAnsi(evidence.errorStack || '').slice(0, 400);

    const userPrompt = `
TEST DETAILS:
- Title: ${evidence.title}
- File: ${evidence.file}:${evidence.line}

ERROR MESSAGE:
${cleanError}

FAILED LOCATOR:
${evidence.failedLocator || 'N/A'}

TELEMETRY & LOGS:
${evidence.telemetryLogs.length > 0 ? JSON.stringify(evidence.telemetryLogs).slice(0, 500) : 'None'}

ERROR STACK:
${cleanStack}
`;

    try {
      const response = await this.llm.generate(`${systemPrompt}\n\n${userPrompt}`, {
        temperature: 0.1,
        jsonMode: true,
      });

      // Parse JSON response cleanly
      let parsed: any;
      try {
        const cleaned = response.content
          .replace(/^```json\s*/, '')
          .replace(/^```\s*/, '')
          .replace(/\s*```$/, '')
          .trim();
        parsed = JSON.parse(cleaned);
      } catch (err) {
        // Fallback regex extraction if model returned surrounding text
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Failed to parse LLM JSON response');
        }
      }

      return {
        testTitle: evidence.title,
        testFile: evidence.file,
        classification: parsed.classification || 'SYNCHRONIZATION_FLAKE',
        summary: parsed.summary || 'Test execution failure',
        possibleCause: parsed.possibleCause || 'Unknown cause',
        evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [parsed.evidence || 'Stack trace mismatch'],
        recommendedInvestigation: parsed.recommendedInvestigation || 'Inspect Playwright trace',
        suggestedFix: parsed.suggestedFix,
        confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0.8,
        providerUsed: this.llm.name,
      };
    } catch (error: any) {
      console.warn(`[FailureAnalyzer] LLM analysis error: ${error.message}. Using rule-based fallback.`);
      return this.heuristicFallback(evidence);
    }
  }

  /**
   * Deterministic heuristic fallback when LLM is offline or timed out
   */
  private heuristicFallback(evidence: FailedTestEvidence): RCADiagnosis {
    const error = evidence.errorMessage.toLowerCase();
    const logs = evidence.telemetryLogs;

    // Check for network errors in telemetry
    const networkErrors = logs.filter((l) => l.type === 'network_error');
    if (networkErrors.length > 0) {
      return {
        testTitle: evidence.title,
        testFile: evidence.file,
        classification: 'API_DELAY_OR_ENVIRONMENT',
        summary: `Network request failure encountered during test execution`,
        possibleCause: `One or more HTTP requests returned 4xx/5xx error status or failed during execution.`,
        evidence: networkErrors.map((n) => n.message),
        recommendedInvestigation: `Verify backend service health and API endpoints captured in network logs.`,
        suggestedFix: `Ensure backend mocks or staging endpoints are operational before executing UI tests.`,
        confidenceScore: 0.9,
        providerUsed: 'heuristic-rules',
      };
    }

    // Check for locator timeout
    if (error.includes('timeout') && (error.includes('waiting for locator') || error.includes('getby'))) {
      return {
        testTitle: evidence.title,
        testFile: evidence.file,
        classification: 'LOCATOR_DRIFT',
        summary: `Timeout waiting for element locator: ${evidence.failedLocator || 'UI Element'}`,
        possibleCause: `Element was either not rendered in time, or its accessibility attributes/selectors have changed.`,
        evidence: [evidence.errorMessage.split('\n')[0]],
        recommendedInvestigation: `Inspect the Playwright trace and current DOM accessibility tree to check for selector drift.`,
        suggestedFix: `Refactor locator to accessible role: page.getByRole('button', { name: '...' }) with auto-waiting.`,
        confidenceScore: 0.85,
        providerUsed: 'heuristic-rules',
      };
    }

    return {
      testTitle: evidence.title,
      testFile: evidence.file,
      classification: 'SYNCHRONIZATION_FLAKE',
      summary: `Test assertion failed or timed out`,
      possibleCause: `Unexpected application state or synchronization delay between client and server.`,
      evidence: [evidence.errorMessage.slice(0, 200)],
      recommendedInvestigation: `Review the Playwright trace snapshot at the moment of failure.`,
      confidenceScore: 0.7,
      providerUsed: 'heuristic-rules',
    };
  }
}
