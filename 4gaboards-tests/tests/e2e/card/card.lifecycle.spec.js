// tests/e2e/card/card.lifecycle.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../pages/LoginPage');
const { BoardPage }    = require('../../pages/BoardPage');
const { CardPage }     = require('../../pages/CardPage');
const { LIST_NAMES, CARD_DATA } = require('../../fixtures/testData');

test('E2E | Full card lifecycle: create → edit → task → move → delete', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const boardPage = new BoardPage(page);
  const cardPage  = new CardPage(page);

  const title = `Lifecycle ${Date.now()}`;

  await test.step('Login and open board', async () => {
    await loginPage.loginAsDemoUser();
    await boardPage.gotoFirstBoard();
  });

  let card;
  await test.step('Create card', async () => {
    card = await boardPage.addCard(LIST_NAMES.todo, title);
    await expect(card).toBeVisible();
  });

  await test.step('Edit card title', async () => {
    await boardPage.openCard(card);
    await cardPage.waitForOpen();
    await cardPage.updateTitle(`${title} (edited)`);
    await cardPage.close();
    card = boardPage.getCardsInList(LIST_NAMES.todo).filter({ hasText: `${title} (edited)` });
    await expect(card).toBeVisible({ timeout: 6000 });
  });

  await test.step('Add and complete a checklist task', async () => {
    await boardPage.openCard(card);
    await cardPage.waitForOpen();
    await cardPage.addTask(CARD_DATA.taskItem);
    const taskRow = cardPage.cardModal
      .locator('[class*="Task_wrapper"]')
      .filter({ hasText: CARD_DATA.taskItem })
      .first();
    await expect(taskRow).toBeVisible({ timeout: 5000 });
    await cardPage.checkTask(CARD_DATA.taskItem);
    await expect(taskRow.locator('input[type="checkbox"]').first()).toBeChecked({ timeout: 3000 });
    await cardPage.deleteTask(CARD_DATA.taskItem);
    await cardPage.close();
  });

  await test.step('Move card to another list', async () => {
    await boardPage.dragCardToList(card, LIST_NAMES.inProgress);
    await expect(
      boardPage.getCardsInList(LIST_NAMES.inProgress).filter({ hasText: `${title} (edited)` })
    ).toBeVisible({ timeout: 8000 });
    card = boardPage.getCardsInList(LIST_NAMES.inProgress).filter({ hasText: `${title} (edited)` });
  });

  await test.step('Delete card', async () => {
    await boardPage.openCard(card);
    await cardPage.waitForOpen();
    await cardPage.deleteCard();
    await expect(
      boardPage.getCardsInList(LIST_NAMES.inProgress).filter({ hasText: `${title} (edited)` })
    ).toHaveCount(0, { timeout: 6000 });
  });
});
