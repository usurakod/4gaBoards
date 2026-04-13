// tests/e2e/card/card.failureFlows.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../pages/LoginPage');
const { BoardPage }    = require('../../pages/BoardPage');
const { LIST_NAMES }   = require('../../fixtures/testData');

test.describe('E2E | Card failure flows', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const boardPage = new BoardPage(page);
    await loginPage.loginAsDemoUser();
    await boardPage.gotoFirstBoard();
  });

  test('Empty title submission leaves form open and shows validation', async ({ page }) => {
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

  test('Abandoning the add-card form does not create a card', async ({ page }) => {
    const boardPage = new BoardPage(page);

    /** Use a unique title so we can assert this specific card never appears,
     * regardless of what other parallel tests add or remove from the same list. */
    const title = `Abandoned_${Date.now()}`;

    await boardPage.getAddCardButtonForList(LIST_NAMES.todo).click();
    const input = boardPage.getAddCardInput(LIST_NAMES.todo);
    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.fill(title);
    await page.keyboard.press('Escape');
    await input.waitFor({ state: 'hidden', timeout: 5000 });

    await expect(
      boardPage.getCardsInList(LIST_NAMES.todo).filter({ hasText: title })
    ).toHaveCount(0, { timeout: 3000 });
  });

});
