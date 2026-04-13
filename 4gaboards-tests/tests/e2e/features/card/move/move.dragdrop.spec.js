// tests/e2e/features/card/move/move.dragdrop.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../../../pages/LoginPage');
const { BoardPage }    = require('../../../../pages/BoardPage');
const { CardPage }     = require('../../../../pages/CardPage');
const { LIST_NAMES, CARD_DATA } = require('../../../../fixtures/testData');

test.describe('Feature: Move card — drag and drop', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const boardPage = new BoardPage(page);
    await loginPage.loginAsDemoUser();
    await boardPage.gotoFirstBoard();
  });

  test('Dragged card appears in the target list and is removed from the source', async ({ page }) => {
    const boardPage = new BoardPage(page);
    const cardPage  = new CardPage(page);

    const card = await boardPage.addCard(LIST_NAMES.todo, CARD_DATA.dragTitle);
    await boardPage.dragCardToList(card, LIST_NAMES.inProgress);

    try {
      await expect(
        boardPage.getCardsInList(LIST_NAMES.inProgress).filter({ hasText: CARD_DATA.dragTitle })
      ).toBeVisible({ timeout: 8000 });
      await expect(
        boardPage.getCardsInList(LIST_NAMES.todo).filter({ hasText: CARD_DATA.dragTitle })
      ).toHaveCount(0);
    } finally {
      const movedCard = boardPage.getCardsInList(LIST_NAMES.inProgress).filter({ hasText: CARD_DATA.dragTitle });
      await boardPage.openCard(movedCard);
      await cardPage.waitForOpen();
      await cardPage.deleteCard();
    }
  });

});
