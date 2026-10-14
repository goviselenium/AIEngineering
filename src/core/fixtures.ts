import { test as base, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export interface TelemetryEvent {
  timestamp: string;
  type: 'console' | 'network_request' | 'network_error';
  message: string;
  metadata?: any;
}

export type CustomFixtures = {
  telemetryLogs: TelemetryEvent[];
};

export const test = base.extend<CustomFixtures>({
  telemetryLogs: async ({ page }, use, testInfo) => {
    const logs: TelemetryEvent[] = [];

    // Capture browser console logs
    page.on('console', (msg) => {
      logs.push({
        timestamp: new Date().toISOString(),
        type: 'console',
        message: `[${msg.type().toUpperCase()}] ${msg.text()}`,
      });
    });

    // Capture failed network requests (4xx / 5xx or aborted)
    page.on('response', (response) => {
      if (response.status() >= 400) {
        logs.push({
          timestamp: new Date().toISOString(),
          type: 'network_error',
          message: `HTTP ${response.status()} ${response.url()}`,
          metadata: {
            status: response.status(),
            url: response.url(),
          },
        });
      }
    });

    // Capture request failures (DNS, timeout, abort)
    page.on('requestfailed', (request) => {
      logs.push({
        timestamp: new Date().toISOString(),
        type: 'network_error',
        message: `FAILED ${request.method()} ${request.url()} - ${request.failure()?.errorText}`,
        metadata: {
          url: request.url(),
          failure: request.failure()?.errorText,
        },
      });
    });

    await use(logs);

    // If test failed, write out telemetry snapshot to test output directory
    if (testInfo.status !== testInfo.expectedStatus) {
      const outputDir = testInfo.outputDir;
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      const telemetryFile = path.join(outputDir, 'telemetry-log.json');
      fs.writeFileSync(telemetryFile, JSON.stringify(logs, null, 2));

      await testInfo.attach('telemetry-log', {
        path: telemetryFile,
        contentType: 'application/json',
      });
    }
  },
});

export { expect };
