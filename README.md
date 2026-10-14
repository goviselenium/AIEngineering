# Agentic Quality Engineering & MCP-Driven Automation Platform

An enterprise-grade Quality Engineering framework implementing **Phase 5: Agentic Quality Engineering**, connecting **Playwright**, **Model Context Protocol (MCP)**, and **Pluggable AI LLM Providers (Ollama default)** for continuous test execution and automated failure triage.

Inspired by the blueprint: *Beyond Selenium and Playwright: How AI, MCP, and Agentic Testing Are Redefining Quality Engineering* by Chanchal T.

---

## 🌟 Key Architecture & Capabilities

1. **Deterministic Core Automation**:
   - Built on **Playwright + TypeScript**.
   - Accessible, semantic role-based locators (`getByRole`, `getByLabel`, `getByTestId`).
   - Page Object Model (POM) and custom fixtures.
   - Comprehensive telemetry capture: Playwright traces, network HAR, screenshots, console logs, and videos on failure.

2. **Automated AI Failure Root-Cause Analysis (RCA)**:
   - Evaluates failed tests by correlating error messages, call logs, network activity, and DOM snapshots.
   - Categorizes failures into **Application Defect**, **Locator Drift**, **API Delay / Environment**, **Data Mismatch**, or **Synchronization Flake**.
   - Produces structured evidence-based markdown summaries for GitHub Actions and JSON manifests for reporting.

3. **Pluggable LLM Provider Abstraction**:
   - **Ollama** (`http://127.0.0.1:11434`) as the default local, zero-cost, privacy-first provider (supports `qwen2.5`, `llama3.2`, `deepseek-r1`).
   - Standardized provider interface supporting **OpenAI** (`gpt-4o`), **Google Gemini** (`gemini-2.0-flash`), and **Anthropic** (`claude-3-5-sonnet`).
   - Switchable dynamically via environment variables (`LLM_PROVIDER=ollama`).

4. **Model Context Protocol (MCP) Integration**:
   - `mcp-test-artifacts`: Custom MCP server exposing tools (`get_failed_tests_summary`, `get_test_telemetry`, `recommend_resilient_locator`) via standard JSON-RPC over stdio.
   - Ready for integration with `mcp-github`, `mcp-playwright`, and `mcp-jira`.

5. **CI/CD Automation via GitHub Actions**:
   - Complete workflow in `.github/workflows/test-and-triage.yml`.
   - Runs Playwright tests, executes AI RCA triage, uploads trace artifacts, and posts markdown triage comments to PRs.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: v20 or v22+
- **Ollama**: Running locally with a model pulled (e.g. `ollama run qwen2.5:latest`)
- **Git**

### 2. Installation
```bash
# Clone the repository and navigate to root
cd e:/AI_PORTABLE/PROJECTS/AIEngineering

# Install dependencies
npm install

# Install Playwright browser binaries
npx playwright install chromium
```

### 3. Environment Configuration
Inspect or modify `.env`:
```env
# Provider: 'ollama' (default) | 'openai' | 'gemini' | 'anthropic'
LLM_PROVIDER=ollama

# Ollama local settings
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:latest
```

### 4. Running Tests
```bash
# Run all Playwright tests
npm test

# Run UI tests with headed browser
npm run test:headed

# Run tests and automatically execute AI RCA triage on any failures
npm run test:triage
```

### 5. Running Standalone AI Failure RCA
```bash
# Ingests test-results/results.json and outputs triage report
npm run rca
```

### 6. Starting the MCP Server
```bash
# Starts the Test Artifacts MCP Server on stdio
npm run mcp:server
```

---

## 📂 Project Structure

```
.
├── .github/
│   └── workflows/
│       └── test-and-triage.yml       # GitHub Actions test & AI triage workflow
├── src/
│   ├── ai/
│   │   ├── providers/
│   │   │   ├── base-provider.ts      # Pluggable LLMProvider interface & factory
│   │   │   ├── ollama-provider.ts    # Ollama implementation (default)
│   │   │   ├── openai-provider.ts    # OpenAI / OpenAI-compatible provider
│   │   │   └── gemini-provider.ts    # Google Gemini provider
│   │   └── rca/
│   │       ├── trace-parser.ts       # Ingests results.json, traces, and HAR telemetry
│   │       ├── failure-analyzer.ts   # AI analysis & root-cause categorization
│   │       └── rca-reporter.ts       # Generates Markdown and JSON reports
│   ├── core/
│   │   ├── base-page.ts              # Base Page Object with accessible locators
│   │   ├── fixtures.ts               # Custom fixtures capturing network & console logs
│   │   └── config.ts                 # Central configuration loader
│   ├── mcp/
│   │   ├── mcp-config.json           # MCP server configuration registry
│   │   └── servers/
│   │       └── test-artifacts-mcp.ts # Custom MCP server for test artifact inspection
│   └── pages/
│       ├── contract-page.ts          # Contract Management Page Object
│       └── member-portal-page.ts     # Healthcare Member Search Page Object
├── tests/
│   ├── ui/
│   │   ├── contract-management.spec.ts  # Passing contract creation suite
│   │   └── failure-triage-demo.spec.ts  # Controlled edge-case failure for RCA triage
│   └── api/
│       └── contract-api.spec.ts         # Service-level API tests
├── scripts/
│   ├── run-rca.ts                    # CLI runner for AI Failure Triage
│   └── start-mcp-server.ts           # MCP server CLI launcher
├── playwright.config.ts              # Playwright configuration with telemetry
├── IMPLEMENTATION_PLAN.md            # Enterprise roadmap & architecture specification
└── package.json
```

---

## 📊 Failure Categories & Root Cause Diagnostics

The AI RCA engine automatically classifies failures into five standardized categories:

| Category | Description | Typical Cause |
| :--- | :--- | :--- |
| 🚨 **Application Defect** | The UI/API broke business logic expectations | Unhandled 500 error, wrong calculation, crash |
| ⚠️ **Locator Drift** | UI DOM changed or accessibility attribute updated | Button renamed, structure refactored |
| 🌐 **API / Environment Delay**| Backend response took longer than client timeout | 504 Gateway timeout, high latency microservice |
| 🗄️ **Data Mismatch** | Test data state inconsistent | Member ID missing, expired credentials |
| ⏱️ **Sync Flake** | Race condition between client rendering and test | Animation delay, premature assertion |

---

## 🔒 Governance & Safety
- **Advisory Diffs Only**: Self-healing never silently mutates test code during live execution.
- **Human-in-the-Loop**: Quality Architects review and approve all AI-recommended locator updates via Pull Requests.
- **Privacy-First**: Defaults to local Ollama inference, keeping sensitive enterprise telemetry within the firewall.
