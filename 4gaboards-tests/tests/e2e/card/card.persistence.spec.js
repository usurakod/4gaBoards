// tests/e2e/card/card.persistence.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../pages/LoginPage');
const { BoardPage }    = require('../../pages/BoardPage');
const { CardPage }     = require('../../pages/CardPage');
const { LIST_NAMES, CARD_DATA } = require('../../fixtures/testData');

test('E2E | Card data persists after page reload', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const boardPage = new BoardPage(page);
  const cardPage  = new CardPage(page);

  const title = `Persist ${Date.now()}`;

  await test.step('Login and open board', async () => {
    await loginPage.loginAsDemoUser();
    await boardPage.gotoFirstBoard();
  });

  await test.step('Create card and add description', async () => {
    const card = await boardPage.addCard(LIST_NAMES.todo, title);
    await boardPage.openCard(card);
    await cardPage.waitForOpen();
    await cardPage.setDescription(CARD_DATA.description);
    await cardPage.close();
  });

  try {
    await test.step('Reload page', async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Card and description persist after reload', async () => {
      const card = boardPage.getCardsInList(LIST_NAMES.todo).filter({ hasText: title });
      await expect(card).toBeVisible({ timeout: 8000 });
      await boardPage.openCard(card);
      await cardPage.waitForOpen();
      await expect(cardPage.descriptionField).toContainText('Bold description', { timeout: 5000 });
    });
  } finally {
    await test.step('Cleanup', async () => {
      await cardPage.setDescription('');
      await cardPage.deleteCard();
    });
  }
});
