// tests/e2e/features/card/create/create.validation.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../../../pages/LoginPage');
const { BoardPage }    = require('../../../../pages/BoardPage');
const { LIST_NAMES }   = require('../../../../fixtures/testData');

test.describe('Feature: Create card — validation', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const boardPage = new BoardPage(page);
    await loginPage.loginAsDemoUser();
    await boardPage.gotoFirstBoard();
  });

  test('Cannot create a card with an empty title', async ({ page }) => {
    const boardPage = new BoardPage(page);
    const input = await boardPage.addCard(LIST_NAMES.todo);

    try {
      const inputVisible = await input.isVisible().catch(() => false);
      const errorVisible = await page.locator('[class*="error"]').first().isVisible().catch(() => false);
      expect(inputVisible || errorVisible).toBeTruthy();
    } finally {
      await page.keyboard.press('Escape');
    }
  });

});
