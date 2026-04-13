// tests/e2e/features/card/delete/delete.card.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../../../pages/LoginPage');
const { BoardPage }    = require('../../../../pages/BoardPage');
const { CardPage }     = require('../../../../pages/CardPage');
const { LIST_NAMES }   = require('../../../../fixtures/testData');

test.describe('Feature: Delete card', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const boardPage = new BoardPage(page);
    await loginPage.loginAsDemoUser();
    await boardPage.gotoFirstBoard();
  });

  test('Deleted card is removed from the board', async ({ page }) => {
    const boardPage = new BoardPage(page);
    const cardPage  = new CardPage(page);

    const title   = `DELETE_ME_${Date.now()}`;
    const newCard = await boardPage.addCard(LIST_NAMES.todo, title);

    await boardPage.openCard(newCard);
    await cardPage.waitForOpen();
    await cardPage.deleteCard();

    await expect(
      boardPage.getCardsInList(LIST_NAMES.todo).filter({ hasText: title })
    ).toHaveCount(0, { timeout: 6000 });
  });

});
