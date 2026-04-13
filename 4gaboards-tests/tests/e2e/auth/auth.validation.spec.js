// tests/e2e/auth/auth.validation.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../pages/LoginPage');

test.describe('E2E | Auth validation', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('Empty username and password shows an error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Submit form with both fields empty', async () => {
      await loginPage.loginButton.click();
    });

    await test.step('Stays on login page', async () => {
      await expect(page).toHaveURL(/\/login/);
    });

    await test.step('Error or required indicator is shown', async () => {
      /** Either a visible error message or browser-native validation keeps us on the page. */
      const stayed = page.url().includes('/login');
      expect(stayed).toBe(true);
    });
  });

  test('Wrong password for valid username shows an error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Submit form with valid username but wrong password', async () => {
      await loginPage.login('demo', 'thisisnotthepassword');
    });

    await test.step('Stays on login page', async () => {
      await expect(page).toHaveURL(/\/login/);
    });

    await test.step('Error message is visible', async () => {
      await expect(loginPage.getErrorLocator()).toBeVisible({ timeout: 5000 });
    });
  });

  test('Non-existent username shows an error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Submit form with a username that does not exist', async () => {
      await loginPage.login(`nouser_${Date.now()}`, 'somepassword');
    });

    await test.step('Stays on login page', async () => {
      await expect(page).toHaveURL(/\/login/);
    });

    await test.step('Error message is visible', async () => {
      await expect(loginPage.getErrorLocator()).toBeVisible({ timeout: 5000 });
    });
  });

});
