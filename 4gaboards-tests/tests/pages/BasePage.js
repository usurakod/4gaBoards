// tests/pages/BasePage.js
class BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to a path relative to baseURL.
   * @param {string} path
   */
  async navigate(path = '/') {
    await this.page.goto(path);
  }

  /** Wait for any loading spinners to disappear. */
  async waitForLoadingToFinish() {
    await this.page
      .locator('[class*="loading"], [class*="spinner"]')
      .first()
      .waitFor({ state: 'hidden', timeout: 10000 })
      .catch(() => {});
  }

  /**
   * Clear a field and fill it with a new value.
   * @param {import('@playwright/test').Locator} locator
   * @param {string} value
   */
  async clearAndFill(locator, value) {
    await locator.clear();
    await locator.fill(value);
  }
}

module.exports = { BasePage };
