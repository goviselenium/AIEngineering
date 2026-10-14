import fs from 'fs';
import path from 'path';

export interface FailedTestEvidence {
  testId: string;
  title: string;
  file: string;
  line: number;
  durationMs: number;
  errorMessage: string;
  errorStack?: string;
  failedLocator?: string;
  telemetryLogs: Array<{
    timestamp: string;
    type: string;
    message: string;
    metadata?: any;
  }>;
  tracePath?: string;
  screenshotPath?: string;
  videoPath?: string;
}

export class TraceParser {
  private resultsFile: string;

  constructor(resultsFile = 'test-results/results.json') {
    this.resultsFile = path.resolve(resultsFile);
  }

  /**
   * Parse Playwright test results JSON and extract all failed tests and associated evidence
   */
  async extractFailedTests(): Promise<FailedTestEvidence[]> {
    if (!fs.existsSync(this.resultsFile)) {
      console.warn(`[TraceParser] Results file not found at: ${this.resultsFile}`);
      return [];
    }

    try {
      const rawData = fs.readFileSync(this.resultsFile, 'utf-8');
      const results = JSON.parse(rawData);
      const failures: FailedTestEvidence[] = [];

      const traverseSuites = (suites: any[]) => {
        for (const suite of suites) {
          if (suite.specs) {
            for (const spec of suite.specs) {
              for (const test of spec.tests || []) {
                for (const result of test.results || []) {
                  if (result.status === 'failed' || result.status === 'timedOut') {
                    const evidence = this.extractResultEvidence(spec, test, result);
                    failures.push(evidence);
                  }
                }
              }
            }
          }
          if (suite.suites) {
            traverseSuites(suite.suites);
          }
        }
      };

      if (results.suites) {
        traverseSuites(results.suites);
      }

      return failures;
    } catch (error: any) {
      console.error(`[TraceParser] Error parsing results file: ${error.message}`);
      return [];
    }
  }

  private extractResultEvidence(spec: any, test: any, result: any): FailedTestEvidence {
    const error = result.error || {};
    const errorMessage = error.message || 'Unknown test failure';
    const errorStack = error.stack || '';

    // Extract failed locator pattern if present in error message
    const locatorMatch = errorMessage.match(/locator\(['"]([^'"]+)['"]\)/) ||
                         errorMessage.match(/getByRole\(['"]([^'"]+)['"](?:,\s*\{([^}]+)\})?\)/) ||
                         errorMessage.match(/waiting for locator\((.*?)\)/);

    const failedLocator = locatorMatch ? locatorMatch[0] : undefined;

    // Search attachments for telemetry-log, trace, screenshot, video
    let tracePath: string | undefined;
    let screenshotPath: string | undefined;
    let videoPath: string | undefined;
    let telemetryLogs: any[] = [];

    for (const attachment of result.attachments || []) {
      if (attachment.name === 'trace' && attachment.path && fs.existsSync(attachment.path)) {
        tracePath = attachment.path;
      } else if (attachment.name === 'screenshot' && attachment.path && fs.existsSync(attachment.path)) {
        screenshotPath = attachment.path;
      } else if (attachment.name === 'video' && attachment.path && fs.existsSync(attachment.path)) {
        videoPath = attachment.path;
      } else if (attachment.name === 'telemetry-log' && attachment.path && fs.existsSync(attachment.path)) {
        try {
          telemetryLogs = JSON.parse(fs.readFileSync(attachment.path, 'utf-8'));
        } catch {
          // ignore parsing error
        }
      }
    }

    return {
      testId: `${spec.file}#${spec.title}`,
      title: spec.title,
      file: spec.file,
      line: spec.line,
      durationMs: result.duration || 0,
      errorMessage,
      errorStack,
      failedLocator,
      telemetryLogs,
      tracePath,
      screenshotPath,
      videoPath,
    };
  }
}
