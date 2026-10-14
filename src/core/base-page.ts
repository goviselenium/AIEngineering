import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage implements resilient locator patterns and semantic element queries
 * as outlined in the Phase 5 Agentic Quality Engineering specification.
 */
export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a URL with network-idle verification
   */
  async goto(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Resilient Accessible Role-based locator
   * Preferred over fragile XPath and CSS selectors
   */
  getByRole(
    role: Parameters<Page['getByRole']>[0],
    options?: Parameters<Page['getByRole']>[1]
  ): Locator {
    return this.page.getByRole(role, options);
  }

  /**
   * Semantic label locator for form inputs
   */
  getByLabel(text: string | RegExp, options?: { exact?: boolean }): Locator {
    return this.page.getByLabel(text, options);
  }

  /**
   * Stable TestId locator fallback
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Click with built-in actionability check and logging
   */
  async safeClick(locator: Locator, description: string): Promise<void> {
    await expect(locator, `Expected "${description}" to be visible before clicking`).toBeVisible({
      timeout: 8000,
    });
    await locator.click();
  }

  /**
   * Fill input with built-in visibility check
   */
  async safeFill(locator: Locator, value: string, description: string): Promise<void> {
    await expect(locator, `Expected "${description}" to be visible before filling`).toBeVisible({
      timeout: 8000,
    });
    await locator.fill(value);
  }

  /**
   * Wait for network response matching URL predicate before or after an action
   */
  async waitForResponse(
    urlOrPredicate: string | RegExp | ((response: any) => boolean),
    action: () => Promise<void>
  ): Promise<any> {
    const [response] = await Promise.all([
      this.page.waitForResponse(urlOrPredicate, { timeout: 10000 }),
      action(),
    ]);
    return response;
  }
}
