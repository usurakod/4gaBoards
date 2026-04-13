// tests/e2e/features/card/edgeCases/duplicate.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../../../pages/LoginPage');
const { BoardPage }    = require('../../../../pages/BoardPage');
const { CardPage }     = require('../../../../pages/CardPage');
const { LIST_NAMES }   = require('../../../../fixtures/testData');

test.describe('Edge case: Duplicate card titles', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const boardPage = new BoardPage(page);
    await loginPage.loginAsDemoUser();
    await boardPage.gotoFirstBoard();
  });

  test('Two cards with the same title can coexist in the same list', async ({ page }) => {
    const boardPage = new BoardPage(page);
    const cardPage  = new CardPage(page);

    const title = `Duplicate ${Date.now()}`;
    const card1 = await boardPage.addCard(LIST_NAMES.todo, title);
    const card2 = await boardPage.addCard(LIST_NAMES.todo, title);

    try {
      await expect(
        boardPage.getCardsInList(LIST_NAMES.todo).filter({ hasText: title })
      ).toHaveCount(2, { timeout: 6000 });
    } finally {
      await boardPage.openCard(card1);
      await cardPage.waitForOpen();
      await cardPage.deleteCard();
      const remaining = boardPage.getCardsInList(LIST_NAMES.todo).filter({ hasText: title });
      await boardPage.openCard(remaining);
      await cardPage.waitForOpen();
      await cardPage.deleteCard();
    }
  });

});
