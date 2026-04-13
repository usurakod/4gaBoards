// tests/e2e/auth/auth.persistence.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../pages/LoginPage');

test('E2E | Auth persistence: session survives full page reload', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await test.step('Login as demo user', async () => {
    await loginPage.loginAsDemoUser();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 10000 });
    await expect(loginPage.userAvatar).toBeVisible({ timeout: 8000 });
  });

  await test.step('Reload the page', async () => {
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  await test.step('Session is still active after reload', async () => {
    await expect(page).not.toHaveURL(/\/login/);
    await expect(loginPage.userAvatar).toBeVisible({ timeout: 8000 });
  });
});
