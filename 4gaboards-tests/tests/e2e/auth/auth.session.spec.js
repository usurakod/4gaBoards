// tests/e2e/auth/auth.session.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../pages/LoginPage');

test('E2E | Auth session: new tab in same browser context shares logged-in state', async ({ page, context }) => {
  const loginPage = new LoginPage(page);

  await test.step('Login in first tab', async () => {
    await loginPage.loginAsDemoUser();
    await expect(loginPage.userAvatar).toBeVisible({ timeout: 8000 });
  });

  await test.step('Open a new tab in the same browser context', async () => {
    const newPage = await context.newPage();

    await test.step('New tab navigates to the app root', async () => {
      await newPage.goto('/');
      await newPage.waitForLoadState('networkidle');
    });

    await test.step('New tab shows logged-in state without re-authenticating', async () => {
      await expect(newPage).not.toHaveURL(/\/login/);
      const avatarInNewTab = newPage.getByTitle('Profile and Settings').first();
      await expect(avatarInNewTab).toBeVisible({ timeout: 8000 });
    });

    await newPage.close();
  });
});
