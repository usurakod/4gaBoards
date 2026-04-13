// tests/e2e/auth/auth.multiTab.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../pages/LoginPage');

test('E2E | Auth multi-tab: logout in one tab reflects in another tab on next navigation', async ({ page, context }) => {
  const loginPage = new LoginPage(page);

  let secondPage;

  await test.step('Login in the first tab', async () => {
    await loginPage.loginAsDemoUser();
    await expect(loginPage.userAvatar).toBeVisible({ timeout: 8000 });
  });

  await test.step('Open a second tab and confirm it is also logged in', async () => {
    secondPage = await context.newPage();
    await secondPage.goto('/');
    await secondPage.waitForLoadState('networkidle');
    await expect(secondPage).not.toHaveURL(/\/login/);
    const avatarTab2 = secondPage.getByTitle('Profile and Settings').first();
    await expect(avatarTab2).toBeVisible({ timeout: 8000 });
  });

  await test.step('Logout from the first tab', async () => {
    await loginPage.logout();
    await expect(page).toHaveURL(/\/login/);
  });

  await test.step('Second tab is unauthenticated on next navigation', async () => {
    /** Trigger a navigation so the second tab re-evaluates auth state. */
    await secondPage.goto('/');
    await secondPage.waitForLoadState('networkidle');
    await expect(secondPage).toHaveURL(/\/login/, { timeout: 8000 });
    await secondPage.close();
  });
});
