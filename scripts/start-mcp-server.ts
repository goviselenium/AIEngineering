import { TestArtifactsMCPServer } from '../src/mcp/servers/test-artifacts-mcp.js';

async function main() {
  const server = new TestArtifactsMCPServer();
  await server.start();
}

main().catch((err) => {
  console.error('[MCP Server Error]', err);
  process.exit(1);
});
