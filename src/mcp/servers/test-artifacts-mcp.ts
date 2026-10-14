import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import { TraceParser } from '../../ai/rca/trace-parser.js';

/**
 * Model Context Protocol (MCP) Server: Test Artifacts & Observability Inspector
 * Exposes standardized tools for AI agents to query test results, telemetry, and locators.
 */
export class TestArtifactsMCPServer {
  private server: Server;
  private parser: TraceParser;

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-test-artifacts',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.parser = new TraceParser();
    this.setupHandlers();
  }

  private setupHandlers() {
    // List available MCP tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_failed_tests_summary',
          description: 'Retrieve a list of all failed and timed-out tests from the latest Playwright test execution',
          inputSchema: {
            type: 'object',
            properties: {
              resultsPath: {
                type: 'string',
                description: 'Optional path to the results.json file',
              },
            },
          },
        },
        {
          name: 'get_test_telemetry',
          description: 'Extract console logs, network errors, and stack traces for a specific test',
          inputSchema: {
            type: 'object',
            properties: {
              testTitle: {
                type: 'string',
                description: 'The title of the test to inspect',
              },
            },
            required: ['testTitle'],
          },
        },
        {
          name: 'recommend_resilient_locator',
          description: 'Given a fragile selector (XPath or CSS) and element description, recommend an accessible role-based Playwright locator',
          inputSchema: {
            type: 'object',
            properties: {
              fragileSelector: {
                type: 'string',
                description: 'The fragile XPath or CSS selector (e.g. //div[3]/button)',
              },
              elementRole: {
                type: 'string',
                description: 'Accessible role (button, checkbox, textbox, link, etc.)',
              },
              accessibleName: {
                type: 'string',
                description: 'The visible text or accessible label of the element',
              },
            },
            required: ['fragileSelector', 'elementRole', 'accessibleName'],
          },
        },
      ],
    }));

    // Handle tool invocations
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'get_failed_tests_summary': {
          const failures = await this.parser.extractFailedTests();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  failures.map((f) => ({
                    title: f.title,
                    file: f.file,
                    durationMs: f.durationMs,
                    errorMessage: f.errorMessage.split('\n')[0],
                    failedLocator: f.failedLocator,
                    hasTrace: Boolean(f.tracePath),
                    telemetryEventsCount: f.telemetryLogs.length,
                  })),
                  null,
                  2
                ),
              },
            ],
          };
        }

        case 'get_test_telemetry': {
          const failures = await this.parser.extractFailedTests();
          const target = failures.find(
            (f) => f.title.toLowerCase().includes((args?.testTitle as string || '').toLowerCase())
          );

          if (!target) {
            return {
              content: [
                {
                  type: 'text',
                  text: `No failed test found matching title: "${args?.testTitle}"`,
                },
              ],
            };
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    title: target.title,
                    file: `${target.file}:${target.line}`,
                    errorMessage: target.errorMessage,
                    failedLocator: target.failedLocator,
                    telemetryLogs: target.telemetryLogs,
                    errorStack: target.errorStack,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case 'recommend_resilient_locator': {
          const role = args?.elementRole as string;
          const name = args?.accessibleName as string;
          const fragile = args?.fragileSelector as string;

          const recommended = `await page.getByRole('${role}', { name: '${name}' })`;

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    fragileSelector: fragile,
                    recommendedLocator: recommended,
                    explanation:
                      'Replaced brittle positional/CSS selector with semantic accessible role. Adheres to W3C ARIA standards and Playwright best practices.',
                    exampleUsage: `${recommended}.click();`,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown MCP tool: ${name}`);
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[MCP] TestArtifactsMCPServer running on stdio');
  }
}
