// tests/e2e/features/card/edit/edit.title.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../../../pages/LoginPage');
const { BoardPage }    = require('../../../../pages/BoardPage');
const { CardPage }     = require('../../../../pages/CardPage');
const { LIST_NAMES, CARD_DATA } = require('../../../../fixtures/testData');

test.describe('Feature: Edit card — title', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const boardPage = new BoardPage(page);
    await loginPage.loginAsDemoUser();
    await boardPage.gotoFirstBoard();
  });

  test('Updated title reflects on the board', async ({ page }) => {
    const boardPage = new BoardPage(page);
    const cardPage  = new CardPage(page);

    const firstCard = boardPage.getCardsInList(LIST_NAMES.todo).first();
    await firstCard.waitFor({ state: 'visible', timeout: 8000 });
    const originalTitle = (await firstCard.textContent()).trim();

    await boardPage.openCard(firstCard);
    await cardPage.waitForOpen();
    await cardPage.updateTitle(CARD_DATA.updatedTitle);
    await cardPage.close();

    try {
      await expect(
        boardPage.getCardsInList(LIST_NAMES.todo).filter({ hasText: CARD_DATA.updatedTitle })
      ).toBeVisible({ timeout: 6000 });
    } finally {
      const updatedCard = boardPage.getCardsInList(LIST_NAMES.todo).filter({ hasText: CARD_DATA.updatedTitle });
      await boardPage.openCard(updatedCard);
      await cardPage.waitForOpen();
      await cardPage.updateTitle(originalTitle);
      await cardPage.close();
    }
  });

});
