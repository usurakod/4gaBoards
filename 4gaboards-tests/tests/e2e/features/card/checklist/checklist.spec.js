// tests/e2e/features/card/checklist/checklist.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../../../../pages/LoginPage');
const { BoardPage }    = require('../../../../pages/BoardPage');
const { CardPage }     = require('../../../../pages/CardPage');
const { LIST_NAMES, CARD_DATA } = require('../../../../fixtures/testData');

test.describe('Feature: Card checklist', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const boardPage = new BoardPage(page);
    await loginPage.loginAsDemoUser();
    await boardPage.gotoFirstBoard();
  });

  test('Task can be added and checked off', async ({ page }) => {
    const boardPage = new BoardPage(page);
    const cardPage  = new CardPage(page);

    const card = await boardPage.addCard(LIST_NAMES.todo, CARD_DATA.taskTitle);
    await boardPage.openCard(card);
    await cardPage.waitForOpen();
    await cardPage.addTask(CARD_DATA.taskItem);

    const taskRow = cardPage.cardModal
      .locator('[class*="Task_wrapper"]')
      .filter({ hasText: CARD_DATA.taskItem })
      .first();

    try {
      await expect(taskRow).toBeVisible({ timeout: 5000 });
      await cardPage.checkTask(CARD_DATA.taskItem);
      await expect(taskRow.locator('input[type="checkbox"]').first()).toBeChecked({ timeout: 3000 });
    } finally {
      await cardPage.deleteTask(CARD_DATA.taskItem);
      await cardPage.deleteCard();
    }
  });

});
