// tests/e2e/features/card/edgeCases/specialChars.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../../../pages/LoginPage');
const { BoardPage }    = require('../../../../pages/BoardPage');
const { CardPage }     = require('../../../../pages/CardPage');
const { LIST_NAMES }   = require('../../../../fixtures/testData');

const SPECIAL_TITLE = `Card !@#$%^&*() ${Date.now()}`;

test.describe('Edge case: Special characters in card title', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const boardPage = new BoardPage(page);
    await loginPage.loginAsDemoUser();
    await boardPage.gotoFirstBoard();
  });

  test('Card with special characters is created and displayed correctly', async ({ page }) => {
    const boardPage = new BoardPage(page);
    const cardPage  = new CardPage(page);

    const card = await boardPage.addCard(LIST_NAMES.todo, SPECIAL_TITLE);

    try {
      await expect(card).toBeVisible({ timeout: 6000 });
    } finally {
      await boardPage.openCard(card);
      await cardPage.waitForOpen();
      await cardPage.deleteCard();
    }
  });

});
