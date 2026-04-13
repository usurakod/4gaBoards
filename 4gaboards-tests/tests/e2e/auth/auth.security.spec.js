// tests/e2e/auth/auth.security.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../pages/LoginPage');

test.describe('E2E | Auth security: protected route access', () => {

  test('Unauthenticated user visiting a board URL is redirected to login', async ({ page }) => {
    await test.step('Visit a board route without logging in', async () => {
      /** Use a plausible board path — the app should redirect regardless of whether the ID exists. */
      await page.goto('/boards/1');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Redirected to the login page', async () => {
      await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
    });
  });

  test('Unauthenticated user visiting the app root is redirected to login', async ({ page }) => {
    await test.step('Visit root without logging in', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Redirected to the login page', async () => {
      await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
    });
  });

  test('After logout, navigating back does not restore the session', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Login', async () => {
      await loginPage.loginAsDemoUser();
      await expect(loginPage.userAvatar).toBeVisible({ timeout: 8000 });
    });

    await test.step('Logout', async () => {
      await loginPage.logout();
      await expect(page).toHaveURL(/\/login/);
    });

    await test.step('Browser back button does not restore authenticated session', async () => {
      await page.goBack();
      await page.waitForLoadState('networkidle');
      /** The app should redirect back to login, not show an authenticated page. */
      await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
    });
  });

});
