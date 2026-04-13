// tests/e2e/features/card/edit/edit.description.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../../../pages/LoginPage');
const { BoardPage }    = require('../../../../pages/BoardPage');
const { CardPage }     = require('../../../../pages/CardPage');
const { LIST_NAMES, CARD_DATA } = require('../../../../fixtures/testData');

test.describe('Feature: Edit card — description', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const boardPage = new BoardPage(page);
    await loginPage.loginAsDemoUser();
    await boardPage.gotoFirstBoard();
  });

  test('Description is saved and visible in the card modal', async ({ page }) => {
    const boardPage = new BoardPage(page);
    const cardPage  = new CardPage(page);

    const firstCard = boardPage.getCardsInList(LIST_NAMES.todo).first();
    await firstCard.waitFor({ state: 'visible', timeout: 8000 });
    await boardPage.openCard(firstCard);
    await cardPage.waitForOpen();
    await cardPage.setDescription(CARD_DATA.description);

    try {
      await expect(cardPage.descriptionField).toContainText('Bold description', { timeout: 5000 });
    } finally {
      await cardPage.setDescription('');
      await cardPage.close();
    }
  });

});
