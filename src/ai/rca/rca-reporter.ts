import fs from 'fs';
import path from 'path';
import { RCADiagnosis } from './failure-analyzer.js';

export class RCAReporter {
  private outputDir: string;

  constructor(outputDir = 'test-results') {
    this.outputDir = path.resolve(outputDir);
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Save diagnoses to JSON and Markdown artifacts
   */
  saveReports(diagnoses: RCADiagnosis[]): { jsonPath: string; markdownPath: string } {
    const jsonPath = path.join(this.outputDir, 'rca-summary.json');
    const markdownPath = path.join(this.outputDir, 'rca-summary.md');

    // 1. Write JSON
    fs.writeFileSync(jsonPath, JSON.stringify(diagnoses, null, 2));

    // 2. Format & Write Markdown
    const markdownContent = this.formatMarkdown(diagnoses);
    fs.writeFileSync(markdownPath, markdownContent);

    // 3. If in GitHub Actions, write to step summary
    if (process.env.GITHUB_STEP_SUMMARY) {
      try {
        fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n\n${markdownContent}\n`);
      } catch (err) {
        console.warn('[RCAReporter] Could not write to GITHUB_STEP_SUMMARY');
      }
    }

    return { jsonPath, markdownPath };
  }

  private formatMarkdown(diagnoses: RCADiagnosis[]): string {
    if (diagnoses.length === 0) {
      return `### ✅ AI Quality Engineering Triage: All Tests Passed!
No test failures detected in this run. Continuous Quality Validation verified.`;
    }

    const lines: string[] = [];
    lines.push(`## 🤖 AI-Powered Failure Analysis & Root Cause Triage`);
    lines.push(`> **Run Summary:** ${diagnoses.length} failed test(s) triaged using ${diagnoses[0]?.providerUsed.toUpperCase()} provider.\n`);

    lines.push(`| Status | Test Title | Failure Category | Confidence | Recommended Action |`);
    lines.push(`| :--- | :--- | :--- | :---: | :--- |`);

    for (const d of diagnoses) {
      const badge = this.getCategoryBadge(d.classification);
      const action = d.recommendedInvestigation.replace(/\|/g, '\\|');
      lines.push(`| ❌ | **${d.testTitle}** | ${badge} | ${(d.confidenceScore * 100).toFixed(0)}% | ${action} |`);
    }

    lines.push(`\n---`);
    lines.push(`### Detailed Diagnostics\n`);

    for (let i = 0; i < diagnoses.length; i++) {
      const d = diagnoses[i];
      lines.push(`#### ${i + 1}. ${d.testTitle}`);
      lines.push(`- **Test File:** \`${d.testFile}\``);
      lines.push(`- **Classification:** **${d.classification}**`);
      lines.push(`- **Summary:** ${d.summary}`);
      lines.push(`- **Possible Cause:** ${d.possibleCause}`);
      lines.push(`- **Evidence:**`);
      for (const ev of d.evidence) {
        lines.push(`  - \`${ev}\``);
      }
      lines.push(`- **Recommended Investigation:** ${d.recommendedInvestigation}`);
      if (d.suggestedFix) {
        lines.push(`- **Suggested Fix:**\n\`\`\`typescript\n${d.suggestedFix}\n\`\`\``);
      }
      lines.push(``);
    }

    return lines.join('\n');
  }

  private getCategoryBadge(classification: string): string {
    switch (classification) {
      case 'APPLICATION_DEFECT':
        return '🚨 **Application Defect**';
      case 'LOCATOR_DRIFT':
        return '⚠️ **Locator Drift**';
      case 'API_DELAY_OR_ENVIRONMENT':
        return '🌐 **API / Environment Delay**';
      case 'TEST_DATA_MISMATCH':
        return '🗄️ **Data Mismatch**';
      case 'SYNCHRONIZATION_FLAKE':
        return '⏱️ **Sync Flake**';
      default:
        return classification;
    }
  }
}
