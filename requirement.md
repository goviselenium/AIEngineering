
Beyond Selenium and Playwright: How AI, MCP, and Agentic Testing Are Redefining Quality Engineering
Chanchal T.
Chanchal T.
Senior SDET | Quality Engineering Lead | Playwright & TypeScript · Selenium & Java · API Automation · CI/CD | Healthcare, BFSI & Gaming | Open to Relocation


October 13, 2026
The evolution from traditional test automation to intelligent, adaptive, and AI-powered quality engineering.

Introduction: Automation Is Evolving Beyond Test Scripts
For more than a decade, software testing has undergone continuous transformation.

We moved from manual testing to Selenium automation, from UI-focused validation to API automation, and from standalone execution to continuous testing integrated into CI/CD pipelines.

Modern frameworks like Playwright have further improved browser automation through better synchronization, tracing, network interception, and cross-browser capabilities.

Yet, despite these advancements, one fundamental challenge remains:

Traditional automation executes what we program it to execute. It does not independently understand what we forgot to test.

As software systems become more distributed, interconnected, and increasingly AI-driven, writing and maintaining automation scripts is no longer the only challenge.

The bigger challenge is building quality engineering systems that can intelligently assist with test design, investigate failures, identify risks, and accelerate feedback.

This is where Artificial Intelligence, Model Context Protocol (MCP), and Agentic AI are beginning to reshape the testing landscape.

1. The Evolution of Software Test Automation
Software testing has progressed through several stages.

Phase 1: Manual Testing

Human-driven test design, exploratory testing, requirement validation, and defect identification.

Phase 2: Script-Based Automation

Frameworks built using Selenium, TestNG, JUnit, Rest Assured, and other tools enabled repeatable UI and API testing.

Phase 3: Continuous Testing

Automation became integrated into CI/CD pipelines using Jenkins, GitHub Actions, and Azure DevOps, enabling faster release feedback.

Phase 4: AI-Assisted Automation

AI coding assistants began supporting test generation, script optimization, debugging, and failure analysis.

Phase 5: Agentic Quality Engineering

AI agents are emerging that can interact with testing tools, investigate application behavior, and coordinate multi-step workflows with human oversight.

The evolution is not simply:

Manual Testing → Automation Testing → AI Testing

It is a broader transformation:

Script Execution → Continuous Quality Validation → AI-Assisted Decision-Making → Intelligent Quality Engineering

The focus is shifting from automating repetitive actions to improving how quality decisions are made.

2. Why Traditional Test Automation Needs Modernization
Even mature automation frameworks face persistent engineering challenges.

Fragile locators that break after UI changes.
High maintenance costs for large regression suites.
Flaky tests caused by synchronization and environment issues.
Repetitive test data management.
Long-running regression pipelines.
Limited visibility into test coverage gaps.
Manual effort in identifying root causes of failures.

Consider an enterprise application with thousands of automated regression tests.

A minor UI change causes multiple Selenium tests to fail.

Engineers spend hours analyzing logs, screenshots, DOM changes, and execution traces.

The application itself may be functioning correctly, but the automation requires maintenance.

An AI-assisted system could analyze the failures, inspect available evidence, identify likely causes, and recommend corrective actions.

The critical distinction is that AI should help engineers understand and resolve failures, not automatically hide them.

Modernization should improve test reliability, maintainability, and engineering productivity—not merely increase the number of generated scripts.

3. How AI Is Transforming Automation Testing
A. AI-Assisted Test Scenario Generation
Traditional test design relies heavily on understanding business requirements, acceptance criteria, integration dependencies, and user behavior.

AI can assist by analyzing requirement documents, user stories, API specifications, and historical defects to suggest additional scenarios.

For example, consider a healthcare application that manages member eligibility and insurance information.

A conventional test suite may validate successful member searches, invalid inputs, and missing records.

AI-assisted scenario analysis might additionally suggest:

Authorization checks across different user roles.
Inconsistent member information between services.
Partial API failures.
Boundary conditions and unusual input combinations.
Sensitive-data exposure risks.
Concurrent updates to member records.

However, AI-generated scenarios must be reviewed against actual business rules.

AI can suggest test coverage. An experienced SDET determines whether that coverage is meaningful.

B. Intelligent Locator Maintenance
One of the biggest maintenance challenges in UI automation is handling frequently changing application elements.

Traditional automation relies on XPath, CSS selectors, IDs, and other locator strategies.

AI-assisted locator maintenance can inspect page structure and recommend alternatives when a selector becomes invalid.

For example, instead of relying on a fragile positional XPath, a Playwright test can use an accessible role-based locator:

await page
  .getByRole('button', { name: 'Apply Filters' })
  .click();
AI may help identify such improvements, but stable selectors, accessibility attributes, and sound framework design remain essential.

Self-healing must never silently change the intended test behavior.

C. AI-Powered Failure Analysis
A failing automated test does not always indicate an application defect.

Failures may result from:

Application defects.
Environment instability.
API response delays.
Incorrect test data.
Synchronization problems.
Changed UI components.
Invalid assertions.

AI-assisted analysis can correlate execution logs, screenshots, Playwright traces, network requests, and historical failure patterns.

Instead of reporting only a timeout exception, an AI system might provide:

Failure: Checkbox selection timed out.

Possible cause: The filter options were not fully rendered before interaction.

Evidence: A delayed API response and an incomplete loading state.

Recommended investigation: Verify API completion and UI readiness before selecting the checkbox.

Such recommendations can accelerate investigation, but they remain hypotheses until supported by evidence.

D. Intelligent Regression Test Selection
Executing an entire regression suite after every minor change can be expensive.

AI-assisted regression selection can combine code changes, historical defects, test dependencies, and execution data to prioritize relevant tests.

For example, a change in a contract-management service may trigger targeted validation of contract creation, filtering, export functionality, permissions, and related integrations.

This can reduce feedback time while maintaining risk-based coverage.

However, intelligent selection should complement—not eliminate—periodic full regression testing.

E. AI Agent Testing and LLM Evaluation
A significant emerging opportunity for quality engineers is testing AI-powered applications themselves.

There is an important distinction between:

Using AI to generate Playwright tests

and

Testing whether an AI agent behaves correctly.

An AI agent may generate different outputs for similar requests, invoke external tools, retrieve information, or perform multi-step actions.

Traditional exact-match assertions are often insufficient for evaluating these behaviors.

SDETs need to consider:

Task completion accuracy.
Hallucinations and factual grounding.
Tool-call correctness.
Prompt-injection resistance.
Data privacy and authorization.
Response consistency.
Recovery from failures.
Latency, cost, and reliability.

This introduces evaluation datasets, deterministic checks, model-based evaluation, and human-reviewed benchmarks.

Testing AI requires more than validating an output. It requires evaluating the reliability of the decisions and actions that produced it.

4. MCP: Connecting AI Intelligence with Test Automation
One of the important technologies supporting AI-enabled engineering workflows is Model Context Protocol (MCP).

MCP is an open standard that enables AI applications to connect with external tools, data sources, and services through a common interface.

Traditional automation frameworks typically use direct integrations with browsers, APIs, databases, and development platforms.

MCP provides a standardized way for AI agents to discover and invoke supported capabilities.

How Does MCP Help an Automation Engineer?
Imagine an enterprise automation framework using Playwright, GitHub, Jira, and backend APIs.

A regression test fails during CI/CD execution.

Traditionally, an SDET would:

Open the CI/CD execution report.
Inspect the failed test logs.
Review screenshots or browser traces.
Examine recent code changes.
Compare the behavior against acceptance criteria.
Investigate API responses and test data.
Identify the root cause.

With appropriately configured MCP servers, an AI assistant can coordinate portions of this investigation.

GitHub MCP can expose repository information, workflow results, and code changes.

Playwright MCP can enable browser interaction and UI inspection.

Jira MCP can provide access to relevant requirements and defect history.

API or Database MCP can expose permitted service operations and test-data queries.

An AI agent can then correlate the retrieved evidence and propose likely explanations.

The engineer remains responsible for verifying the conclusions and approving any changes.

MCP Is Not a Replacement for Playwright or Selenium
This distinction is essential.

Playwright and Selenium remain automation technologies used to interact with applications and execute repeatable tests.

MCP provides a standardized connection between AI applications and external capabilities.

Agentic AI provides the ability to coordinate tasks and select actions based on goals and available information.

Together, these technologies can enable more capable testing workflows.

Playwright executes browser interactions. MCP exposes tools to AI applications. AI agents coordinate tasks. SDETs ensure correctness and reliability.

5. Agentic AI: Moving Toward Goal-Oriented Testing
Traditional automation generally follows predefined execution steps.

An AI agent, by contrast, can be given a goal and use available tools to determine how to approach it.

For example:

“Validate the contract creation workflow, investigate unexpected failures, and summarize the results with supporting evidence.”

An appropriately configured agent might:

Inspect the application's current state.
Navigate through the relevant workflow.
Generate or select suitable test inputs.
Execute browser interactions.
Observe UI and API responses.
Compare outcomes against supplied requirements.
Capture failure evidence.
Produce a structured investigation report.

This creates opportunities for exploratory testing, assisted debugging, and faster feedback.

However, autonomous testing introduces new risks.

An agent may misunderstand requirements, select incorrect elements, produce misleading conclusions, or perform unintended actions.

Therefore, agentic testing requires strong engineering controls, including restricted permissions, isolated test environments, deterministic validation, action logging, and human approval for consequential changes.

Autonomy without validation is not quality engineering.

6. What Could an AI-Modernized Automation Framework Look Like?
Consider an enterprise quality engineering framework that combines:

Playwright with TypeScript for UI automation.
Rest Assured or Playwright API testing for service validation.
GitHub Actions or Jenkins for CI/CD execution.
MCP servers for AI-accessible tool integration.
AI assistants for test design and investigation.
Quality dashboards for reporting and trend analysis.

A potential workflow would look like this:

Step 1 — Requirement Intelligence

AI analyzes approved requirements and proposes relevant test scenarios.

Step 2 — Test Design and Review

The SDET reviews scenarios, defines assertions, and prioritizes business risks.

Step 3 — Automation Development

AI-assisted coding tools help engineers develop reusable UI and API tests.

Step 4 — Continuous Execution

Deterministic automation suites execute through CI/CD pipelines.

Step 5 — MCP-Enabled Investigation

AI assistants access authorized testing tools, repository data, and execution evidence.

Step 6 — Intelligent Failure Analysis

AI suggests probable root causes and possible corrective actions.

Step 7 — Human-Verified Improvements

Engineers validate recommendations, review code changes, and approve fixes.

Step 8 — Quality Intelligence

Dashboards monitor test stability, defect trends, regression efficiency, and coverage gaps.

This approach combines the reliability of conventional automation with AI-assisted analysis and workflow orchestration.

7. Will AI Replace Automation Test Engineers?
This is one of the most frequently discussed questions in software testing.

AI is already capable of generating test scripts, suggesting assertions, analyzing logs, and assisting with debugging.

However, software quality is not defined by the number of automated scripts executed.

An experienced SDET understands business risks, application architecture, integration dependencies, customer behavior, and the consequences of system failure.

AI may generate a test for a financial transaction.

But determining whether that transaction satisfies regulatory requirements, business rules, and security expectations requires trusted domain knowledge and verified evidence.

Similarly, in healthcare applications, validating an API response is different from establishing whether the underlying eligibility or claims decision is correct.

The role of the SDET is therefore evolving.

Test Automation Engineer → Quality Engineering Specialist → AI-Enabled SDET → Quality Architect

The most valuable engineers will combine automation expertise with system design, AI evaluation, domain knowledge, and quality strategy.

8. What Should Senior SDETs Learn Next?
The answer is not to abandon existing automation technologies.

It is to build on them.

Strengthen core engineering skills

Java, Python, TypeScript, SQL, API testing, system architecture, and CI/CD.

Modernize automation frameworks

Playwright, resilient test design, API contract testing, parallel execution, and observability.

Understand AI-assisted engineering

GitHub Copilot, coding agents, prompt design, AI-assisted debugging, and test generation.

Explore MCP

MCP clients and servers, tool integration, custom MCP development, permissions, and security.

Learn AI and agent evaluation

LLM testing, RAG evaluation, hallucination detection, tool-call validation, prompt-injection testing, and evaluation datasets.

Build practical proof-of-concept projects

AI-powered failure analysis, MCP-integrated browser testing, intelligent regression recommendations, and agent evaluation frameworks.

Most importantly, evaluate the impact of modernization through measurable outcomes:

Reduced automation maintenance effort.
Improved test stability.
Faster failure investigation.
Shorter feedback cycles.
Better defect detection.
Increased confidence in releases.

Adding AI to an automation framework is not modernization unless it produces meaningful engineering value.

9. Final Thoughts: From Automated Testing to Intelligent Quality Engineering
AI modernization is not about replacing Selenium with Playwright, or replacing test engineers with AI agents.

It is about creating an engineering ecosystem where traditional automation, AI-assisted analysis, standardized tool connectivity, and human expertise work together.

MCP can connect AI applications with engineering tools.

Agentic AI can help coordinate testing and investigation workflows.

Modern automation frameworks can provide reliable, repeatable validation.

But quality engineers remain responsible for defining correctness, interpreting risk, and ensuring trustworthy outcomes.

The future of testing will not be defined by who can generate the most automation scripts using AI.

It will be defined by who can combine automation, intelligence, and engineering judgment to deliver reliable software.

AI can accelerate automation.

MCP can connect intelligence with tools.

Agentic AI can expand what automated workflows can accomplish.

But quality engineering is what makes the results trustworthy.