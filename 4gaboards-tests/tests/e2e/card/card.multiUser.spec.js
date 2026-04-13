// tests/e2e/card/card.multiUser.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../pages/LoginPage');
const { BoardPage }    = require('../../pages/BoardPage');
const { CardPage }     = require('../../pages/CardPage');
const { LIST_NAMES }   = require('../../fixtures/testData');

test('E2E | Card created by user1 is visible to user2 in a separate session', async ({ browser }) => {
  const title = `MultiUser ${Date.now()}`;

  const ctx1  = await browser.newContext();
  const ctx2  = await browser.newContext();
  const page1 = await ctx1.newPage();
  const page2 = await ctx2.newPage();

  const loginPage1 = new LoginPage(page1);
  const boardPage1 = new BoardPage(page1);
  const cardPage1  = new CardPage(page1);

  const loginPage2 = new LoginPage(page2);
  const boardPage2 = new BoardPage(page2);

  try {
    await test.step('User 1 — login and create card', async () => {
      await loginPage1.loginAsDemoUser();
      await boardPage1.gotoFirstBoard();
      const card = await boardPage1.addCard(LIST_NAMES.todo, title);
      await expect(card).toBeVisible();
    });

    await test.step('User 2 — login and see the card', async () => {
      await loginPage2.loginAsDemoUser();
      await boardPage2.gotoFirstBoard();
      await expect(
        boardPage2.getCardsInList(LIST_NAMES.todo).filter({ hasText: title })
      ).toBeVisible({ timeout: 8000 });
    });
  } finally {
    await test.step('Cleanup — User 1 deletes the card', async () => {
      const card = boardPage1.getCardsInList(LIST_NAMES.todo).filter({ hasText: title });
      await boardPage1.openCard(card);
      await cardPage1.waitForOpen();
      await cardPage1.deleteCard();
    });

    await ctx1.close();
    await ctx2.close();
  }
});
