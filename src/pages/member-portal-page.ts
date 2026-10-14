import { Page, Locator } from '@playwright/test';
import { BasePage } from '../core/base-page.js';

export class MemberPortalPage extends BasePage {
  readonly memberSearchInput: Locator;
  readonly searchButton: Locator;
  readonly memberRoleFilter: Locator;
  readonly applyFiltersButton: Locator;
  readonly memberResultsList: Locator;
  readonly eligibilityBadge: Locator;

  constructor(page: Page) {
    super(page);

    this.memberSearchInput = this.getByRole('textbox', { name: 'Search Member by ID or Name' });
    this.searchButton = this.getByRole('button', { name: 'Search' });
    this.memberRoleFilter = this.getByRole('combobox', { name: 'Member Role' });
    this.applyFiltersButton = this.getByRole('button', { name: 'Apply Filters' });
    this.memberResultsList = this.getByRole('list', { name: 'Member Search Results' });
    this.eligibilityBadge = this.getByTestId('member-eligibility-status');
  }

  async searchMember(query: string, role?: string): Promise<void> {
    await this.safeFill(this.memberSearchInput, query, 'Member Search Input');
    if (role) {
      await this.memberRoleFilter.selectOption(role);
      await this.safeClick(this.applyFiltersButton, 'Apply Filters Button');
    }
    await this.safeClick(this.searchButton, 'Search Button');
  }
}
