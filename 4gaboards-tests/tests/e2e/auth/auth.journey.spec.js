// tests/e2e/auth/auth.journey.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../pages/LoginPage');
const { TEST_USER, INVALID_USER } = require('../../fixtures/testData');

test('E2E | Auth journey: invalid login → valid login → logout', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await test.step('Navigate to login page', async () => {
    await loginPage.goto();
    await expect(page).toHaveURL(/\/login/);
  });

  await test.step('Fail login with invalid credentials', async () => {
    await loginPage.login(INVALID_USER.username, INVALID_USER.password);
    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.getErrorLocator()).toBeVisible({ timeout: 5000 });
  });

  await test.step('Login with valid credentials', async () => {
    await loginPage.login(TEST_USER.username, TEST_USER.password);
    await expect(page).not.toHaveURL(/\/login/, { timeout: 10000 });
    await expect(loginPage.userAvatar).toBeVisible({ timeout: 8000 });
  });

  await test.step('Logout and return to login page', async () => {
    await loginPage.logout();
    await expect(page).toHaveURL(/\/login/);
  });
});
