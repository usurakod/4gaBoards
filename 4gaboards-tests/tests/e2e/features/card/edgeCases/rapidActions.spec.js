// tests/e2e/features/card/edgeCases/rapidActions.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../../../pages/LoginPage');
const { BoardPage }    = require('../../../../pages/BoardPage');
const { CardPage }     = require('../../../../pages/CardPage');
const { LIST_NAMES }   = require('../../../../fixtures/testData');

test.describe('Edge case: Rapid card actions', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const boardPage = new BoardPage(page);
    await loginPage.loginAsDemoUser();
    await boardPage.gotoFirstBoard();
  });

  test('Three cards created in rapid succession all appear in the list', async ({ page }) => {
    const boardPage = new BoardPage(page);
    const cardPage  = new CardPage(page);

    const ts     = Date.now();
    const titles = [`Rapid A ${ts}`, `Rapid B ${ts}`, `Rapid C ${ts}`];

    /** Store each returned locator — addCard() already waits for visibility and persistence. */
    const cards = [];
    for (const title of titles) {
      const card = await boardPage.addCard(LIST_NAMES.todo, title);
      cards.push(card);
    }

    try {
      /** Assert on the locators returned by addCard() rather than re-querying the full list,
       * avoiding strict mode violations when the list has leftover cards from other tests. */
      for (const card of cards) {
        await expect(card.first()).toBeVisible({ timeout: 6000 });
      }
    } finally {
      /** Re-query by exact title for cleanup; .first() guards against any edge-case duplicates. */
      for (const title of titles) {
        const card = boardPage.getCardsInList(LIST_NAMES.todo).filter({ hasText: title }).first();
        await boardPage.openCard(card);
        await cardPage.waitForOpen();
        await cardPage.deleteCard();
      }
    }
  });

});
