import { Page, Locator } from '@playwright/test';
import { BasePage } from '../core/base-page.js';

export interface ContractDetails {
  contractTitle: string;
  clientName: string;
  contractValue: string;
  category: string;
}

export class ContractPage extends BasePage {
  readonly createContractButton: Locator;
  readonly contractTitleInput: Locator;
  readonly clientNameInput: Locator;
  readonly contractValueInput: Locator;
  readonly categorySelect: Locator;
  readonly submitButton: Locator;
  readonly successNotification: Locator;
  readonly contractsTable: Locator;

  constructor(page: Page) {
    super(page);

    // Resilient Role-Based Locators
    this.createContractButton = this.getByRole('button', { name: 'Create Contract' });
    this.contractTitleInput = this.getByLabel('Contract Title');
    this.clientNameInput = this.getByLabel('Client Name');
    this.contractValueInput = this.getByLabel('Contract Value');
    this.categorySelect = this.getByLabel('Contract Category');
    this.submitButton = this.getByRole('button', { name: 'Save Contract' });
    this.successNotification = this.getByRole('status');
    this.contractsTable = this.getByRole('table', { name: 'Contracts' });
  }

  async createContract(details: ContractDetails): Promise<void> {
    await this.safeClick(this.createContractButton, 'Create Contract Button');
    await this.safeFill(this.contractTitleInput, details.contractTitle, 'Contract Title');
    await this.safeFill(this.clientNameInput, details.clientName, 'Client Name');
    await this.safeFill(this.contractValueInput, details.contractValue, 'Contract Value');
    await this.categorySelect.selectOption(details.category);
    await this.safeClick(this.submitButton, 'Save Contract Button');
  }
}
