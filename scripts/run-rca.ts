import { TraceParser } from '../src/ai/rca/trace-parser.js';
import { FailureAnalyzer } from '../src/ai/rca/failure-analyzer.js';
import { RCAReporter } from '../src/ai/rca/rca-reporter.js';
import { getLLMProvider } from '../src/ai/providers/base-provider.js';

async function main() {
  console.log('===============================================================');
  console.log('🤖 Starting Agentic AI Failure RCA & Root-Cause Triage Pipeline');
  console.log('===============================================================\n');

  const provider = getLLMProvider();
  console.log(`[RCA] Initializing LLM Provider: "${provider.name.toUpperCase()}"`);

  const isAvailable = await provider.isAvailable();
  if (isAvailable) {
    console.log(`[RCA] ✅ Provider "${provider.name}" is online and reachable.`);
  } else {
    console.log(`[RCA] ⚠️ Provider "${provider.name}" is offline. Fallback rule-based engine will be used.`);
  }

  const parser = new TraceParser();
  const failures = await parser.extractFailedTests();

  if (failures.length === 0) {
    console.log('[RCA] 🎉 No failed tests found in test-results/results.json. Suite is 100% green!');
    const reporter = new RCAReporter();
    reporter.saveReports([]);
    return;
  }

  console.log(`[RCA] Discovered ${failures.length} failed test(s). Running AI root-cause analysis...\n`);

  const analyzer = new FailureAnalyzer(provider);
  const diagnoses = [];

  for (let i = 0; i < failures.length; i++) {
    const failure = failures[i];
    console.log(`[RCA] Triaging failure [${i + 1}/${failures.length}]: "${failure.title}"...`);
    try {
      const diagnosis = await analyzer.analyzeFailure(failure);
      diagnoses.push(diagnosis);
      console.log(`  -> Category: [${diagnosis.classification}] (Confidence: ${(diagnosis.confidenceScore * 100).toFixed(0)}%)`);
      console.log(`  -> Cause: ${diagnosis.possibleCause}`);
      console.log(`  -> Action: ${diagnosis.recommendedInvestigation}\n`);
    } catch (err: any) {
      console.error(`  -> Error triaging test: ${err.message}`);
    }
  }

  const reporter = new RCAReporter();
  const { jsonPath, markdownPath } = reporter.saveReports(diagnoses);

  console.log('===============================================================');
  console.log(`✅ RCA Triage Complete! Generated reports:`);
  console.log(`  - Markdown Report: ${markdownPath}`);
  console.log(`  - JSON Manifest:   ${jsonPath}`);
  console.log('===============================================================\n');
}

main().catch((err) => {
  console.error('[RCA Pipeline Error]', err);
  process.exit(1);
});
