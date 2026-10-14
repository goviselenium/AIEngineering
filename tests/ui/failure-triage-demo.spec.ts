import { test, expect } from '../../src/core/fixtures.js';

test.describe('Failure Triage Demo Suite (Healthcare & BFSI Scenarios)', () => {
  test('should triage delayed API response and timed out element interaction', async ({ page }) => {
    // Mock page with an asynchronous delayed member filter and API failure
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head><title>Member Eligibility Search</title></head>
      <body>
        <h1>Member Search</h1>
        <div id="loading-spinner">Loading member filter parameters...</div>
        <script>
          // Simulate an API network error in the background
          fetch('/api/v1/members/eligibility-filters')
            .catch(() => console.error('API Error: 504 Gateway Timeout while fetching member filters'));
        </script>
      </body>
      </html>
    `);

    // Intentionally wait for a checkbox that never appears due to the simulated API timeout
    // This allows the AI Root-Cause Analysis (RCA) engine to ingest the trace, console logs, and failure
    const filterCheckbox = page.getByRole('checkbox', { name: 'Active Coverage Only' });

    // Expect element with short timeout to trigger failure evidence generation
    await expect(filterCheckbox).toBeVisible({ timeout: 2000 });
  });
});
