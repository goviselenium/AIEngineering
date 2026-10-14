import { test, expect } from '../../src/core/fixtures.js';
import { ContractPage } from '../../src/pages/contract-page.js';

test.describe('Contract Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Self-contained demo application for contract creation
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="en">
      <head><title>Enterprise Contract Management</title></head>
      <body>
        <h1>Contract Portal</h1>
        <button id="btn-create">Create Contract</button>
        <div id="contract-modal" style="display: none;">
          <form id="contract-form">
            <label for="title">Contract Title</label>
            <input id="title" type="text" />
            <br/>
            <label for="client">Client Name</label>
            <input id="client" type="text" />
            <br/>
            <label for="val">Contract Value</label>
            <input id="val" type="text" />
            <br/>
            <label for="cat">Contract Category</label>
            <select id="cat">
              <option value="Enterprise">Enterprise</option>
              <option value="Standard">Standard</option>
            </select>
            <br/>
            <button type="submit">Save Contract</button>
          </form>
        </div>
        <div role="status" id="status" style="display:none;">Contract created successfully!</div>
        <script>
          document.getElementById('btn-create').addEventListener('click', () => {
            document.getElementById('contract-modal').style.display = 'block';
          });
          document.getElementById('contract-form').addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('status').style.display = 'block';
          });
        </script>
      </body>
      </html>
    `);
  });

  test('should successfully create a new enterprise contract using accessible locators', async ({ page }) => {
    const contractPage = new ContractPage(page);

    await contractPage.createContract({
      contractTitle: 'Global Health Services Agreement',
      clientName: 'Apex Health Systems',
      contractValue: '$1,200,000',
      category: 'Enterprise',
    });

    await expect(contractPage.successNotification).toBeVisible();
    await expect(contractPage.successNotification).toHaveText(/Contract created successfully!/);
  });
});
