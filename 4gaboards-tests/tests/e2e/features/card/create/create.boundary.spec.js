// tests/e2e/features/card/create/create.boundary.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../../../pages/LoginPage');
const { BoardPage }    = require('../../../../pages/BoardPage');
const { CardPage }     = require('../../../../pages/CardPage');
const { LIST_NAMES }   = require('../../../../fixtures/testData');

const LONG_TITLE  = 'A'.repeat(200);
const SINGLE_CHAR = 'X';

test.describe('Feature: Create card — boundary inputs', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const boardPage = new BoardPage(page);
    await loginPage.loginAsDemoUser();
    await boardPage.gotoFirstBoard();
  });

  test('Single-character title creates a valid card', async ({ page }) => {
    const boardPage = new BoardPage(page);
    const cardPage  = new CardPage(page);

    const card = await boardPage.addCard(LIST_NAMES.todo, SINGLE_CHAR);

    try {
      await expect(card).toBeVisible({ timeout: 6000 });
    } finally {
      await boardPage.openCard(card);
      await cardPage.waitForOpen();
      await cardPage.deleteCard();
    }
  });

  test('Very long title is accepted or gracefully truncated', async ({ page }) => {
    const boardPage = new BoardPage(page);
    const cardPage  = new CardPage(page);

    const card = await boardPage.addCard(LIST_NAMES.todo, LONG_TITLE);

    try {
      /** Card should appear — truncated or full — without an error state. */
      await expect(card).toBeVisible({ timeout: 6000 });
    } finally {
      await boardPage.openCard(card);
      await cardPage.waitForOpen();
      await cardPage.deleteCard();
    }
  });

});
