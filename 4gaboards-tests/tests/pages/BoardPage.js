// tests/pages/BoardPage.js
const { BasePage } = require('./BasePage');

class BoardPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this.boardTitle    = page.locator('[class*="boardName"], h1').first();
    this.listContainer = page.locator('[class*="list"], [class*="column"]');
  }

  /** Click the first board visible on the dashboard. */
  async gotoFirstBoard() {
    const firstBoard = this.page.locator('[class*="board"], [class*="Board"]').first();
    await firstBoard.waitFor({ state: 'visible', timeout: 8000 });
    await firstBoard.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get the list/column locator by its header name.
   * @param {string} listName
   * @returns {import('@playwright/test').Locator}
   */
  getList(listName) {
    return this.page
      .locator('[class*="List_innerWrapper"]')
      .filter({
        has: this.page.locator('[class*="List_headerName"]').filter({ hasText: listName }),
      });
  }

  /**
   * Get all card locators inside a named list.
   * @param {string} listName
   * @returns {import('@playwright/test').Locator}
   */
  getCardsInList(listName) {
    return this.getList(listName).locator('[class*="Card_card"]');
  }

  /**
   * Open a card's detail modal.
   * @param {import('@playwright/test').Locator} cardLocator
   */
  async openCard(cardLocator) {
    /** <div class="Card_content"> only exists once the card is persisted (server confirmed).
     * Optimistic cards render a <span> with no onClick. Clicking at (10,10) stays in
     * the title area, above any data-prevent-card-switch elements (labels/tasks). */
    await cardLocator.locator('div[class*="Card_content"]').click({ position: { x: 10, y: 10 } });
  }

  /**
   * Get the add-card input scoped to a specific list.
   * @param {string} listName
   * @returns {import('@playwright/test').Locator}
   */
  getAddCardInput(listName) {
    return this.getList(listName)
      .locator('textarea[placeholder*="card"], input[placeholder*="card"], input[placeholder*="title"]')
      .first();
  }

  /**
   * Open the add-card form and optionally create a card.
   * With title → creates the card, waits for persistence, returns the card locator.
   * Without title → submits empty (validation test), returns the input locator.
   * @param {string} listName
   * @param {string} [title]
   * @returns {import('@playwright/test').Locator}
   */
  async addCard(listName, title) {
    await this.getAddCardButtonForList(listName).click();
    const input = this.getAddCardInput(listName);
    await input.waitFor({ state: 'visible', timeout: 5000 });

    if (title) {
      /** Snapshot count before adding so duplicate titles resolve to the correct nth card. */
      const existingCount = await this.getCardsInList(listName).filter({ hasText: title }).count();

      await input.fill(title);
      await this.page.keyboard.press('Enter');
      await this.page.keyboard.press('Escape');
      await input.waitFor({ state: 'hidden', timeout: 5000 });

      const card = this.getCardsInList(listName).filter({ hasText: title }).nth(existingCount);
      await card.waitFor({ state: 'visible', timeout: 6000 });
      /** Wait for server confirmation — optimistic cards have no onClick and isDragDisabled=true. */
      await card.locator('div[class*="Card_content"]').waitFor({ state: 'visible', timeout: 8000 });
      return card;
    }

    await this.page.keyboard.press('Enter');
    return input;
  }

  /**
   * Drag a card to a target list using react-beautiful-dnd mouse events.
   * @param {import('@playwright/test').Locator} cardLocator
   * @param {string} targetListName
   */
  async dragCardToList(cardLocator, targetListName) {
    const targetCardsArea = this.getList(targetListName)
      .locator('[class*="List_cardsInnerWrapper"]')
      .first();

    await targetCardsArea.waitFor({ state: 'visible', timeout: 8000 });
    await cardLocator.scrollIntoViewIfNeeded();

    const srcBox = await cardLocator.boundingBox();
    const dstBox = await targetCardsArea.boundingBox();

    const srcX = srcBox.x + srcBox.width / 2;
    const srcY = srcBox.y + srcBox.height / 2;
    const dstX = dstBox.x + dstBox.width / 2;
    const dstY = dstBox.y + Math.min(50, dstBox.height / 2);

    /** RBD requires: hold ≥150ms → jitter → slow move → pause → release */
    await this.page.mouse.move(srcX, srcY);
    await this.page.mouse.down();
    await this.page.waitForTimeout(500);
    await this.page.mouse.move(srcX + 5, srcY, { steps: 5 });
    await this.page.mouse.move(dstX, dstY, { steps: 25 });
    await this.page.waitForTimeout(300);
    await this.page.mouse.up();
    await this.page.waitForTimeout(2000);
  }

  /**
   * Get the "Add Card" trigger button scoped to a specific list.
   * @param {string} listName
   * @returns {import('@playwright/test').Locator}
   */
  getAddCardButtonForList(listName) {
    /** Exclude [type="submit"] to avoid matching the hidden submit inside the add-card form. */
    return this.getList(listName)
      .locator('*:not([type="submit"])')
      .filter({ hasText: /^\+?\s*add card$/i })
      .first();
  }
}

module.exports = { BoardPage };
