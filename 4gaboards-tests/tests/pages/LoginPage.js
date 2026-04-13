// tests/pages/LoginPage.js
const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class LoginPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);

    this.usernameInput = page
      .locator('input:not([type="password"]):not([type="hidden"]):not([type="submit"]):not([type="checkbox"])')
      .first();
    this.passwordInput = page.locator('input[type="password"]').first();
    this.loginButton   = page.locator('button[type="submit"]').first();
    this.userAvatar    = page.getByTitle('Profile and Settings').first();
  }

  /** @returns {import('@playwright/test').Locator} */
  getErrorLocator() {
    return this.page
      .locator('[class*="error"], [class*="Error"], [role="alert"]')
      .first();
  }

  /** Navigate to the login page and wait for the form. */
  async goto() {
    await this.navigate('/login');
    await this.page.waitForLoadState('networkidle');
    await this.page.locator('input').first().waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Fill and submit the login form.
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    await this.usernameInput.waitFor({ state: 'visible', timeout: 10000 });
    await expect(this.usernameInput).toBeEnabled({ timeout: 5000 });
    await this.usernameInput.click({ clickCount: 3 });
    await this.usernameInput.pressSequentially(username, { delay: 50 });
    await this.passwordInput.click({ clickCount: 3 });
    await this.passwordInput.pressSequentially(password, { delay: 50 });
    await this.page.waitForTimeout(400);
    await this.loginButton.click();
    await this.waitForLoadingToFinish();
  }

  /** Log in as the demo user and wait for the dashboard. */
  async loginAsDemoUser() {
    await this.goto();
    await this.login('demo', 'demo');
    await this.page.waitForURL(
      (url) => !url.pathname.includes('/login'),
      { timeout: 12000 },
    );
  }

  /** Click the user avatar, then click the log-out button. */
  async logout() {
    await this.userAvatar.click();
    const logoutBtn = this.page
      .locator('button:has-text("Log out"), button:has-text("Logout"), button:has-text("Sign out")')
      .first();
    await logoutBtn.waitFor({ state: 'visible', timeout: 5000 });
    await logoutBtn.click();
    await this.page.waitForURL(/\/login/, { timeout: 8000 });
  }
}

module.exports = { LoginPage };
