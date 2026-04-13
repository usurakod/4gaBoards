// tests/e2e/features/card/create/create.basic.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../../../pages/LoginPage');
const { BoardPage }    = require('../../../../pages/BoardPage');
const { CardPage }     = require('../../../../pages/CardPage');
const { LIST_NAMES, CARD_DATA } = require('../../../../fixtures/testData');

test.describe('Feature: Create card — basic', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const boardPage = new BoardPage(page);
    await loginPage.loginAsDemoUser();
    await boardPage.gotoFirstBoard();
  });

  test('Created card appears in the correct list', async ({ page }) => {
    const boardPage = new BoardPage(page);
    const cardPage  = new CardPage(page);

    const card = await boardPage.addCard(LIST_NAMES.todo, CARD_DATA.title);

    try {
      await expect(card).toBeVisible({ timeout: 6000 });
    } finally {
      await boardPage.openCard(card);
      await cardPage.waitForOpen();
      await cardPage.deleteCard();
    }
  });

});
