// tests/pages/CardPage.js
const { BasePage } = require('./BasePage');

class CardPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);

    this.cardModal = page
      .locator('[class*="CardModal"], [class*="card-detail"], [role="dialog"]')
      .first();

    this.cardTitleText    = this.cardModal.locator('[class*="CardModal_headerTitle"]').first();
    this.cardTitleInput   = this.cardModal.locator('[class*="NameField_field"]').first();
    this.descriptionField = this.cardModal.locator('[class*="CardModal_descriptionText"]').first();
    this.deleteButton     = this.cardModal.getByTitle(/delete card/i).first();
    this.closeButton      = this.cardModal.getByRole('button', { name: /close card/i }).first();
    this.addTaskButton    = this.cardModal.locator('[class*="Tasks_taskButton"]');
    this.taskInput        = this.cardModal.locator('textarea[class*="TaskAdd_field"]').first();

    /** DeleteStep renders inside a FloatingPortal (document.body), outside the card modal. */
    this.confirmDeleteBtn = page.locator('[class*="DeleteStep_deleteButton"]');
  }

  /** Wait for the card modal to be fully visible. */
  async waitForOpen() {
    await this.cardModal.waitFor({ state: 'visible', timeout: 8000 });
  }

  /** Wait for the card modal to close. */
  async waitForClose() {
    await this.cardModal.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Update the card title and confirm with Enter.
   * @param {string} newTitle
   */
  async updateTitle(newTitle) {
    await this.cardTitleText.click();
    await this.cardTitleInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.clearAndFill(this.cardTitleInput, newTitle);
    await this.page.keyboard.press('Enter');
    await this.waitForLoadingToFinish();
  }

  /**
   * Set the card description content.
   * @param {string} text
   */
  async setDescription(text) {
    await this.cardModal
      .getByRole('button', { name: /edit description|add description/i })
      .first()
      .click();
    const descTextarea = this.cardModal.getByPlaceholder(/description/i);
    await descTextarea.waitFor({ state: 'attached', timeout: 5000 });
    await descTextarea.fill(text, { force: true });
    await this.page.keyboard.press('Control+Enter');
    await this.waitForLoadingToFinish();
  }

  /**
   * Add a checklist task to the card.
   * @param {string} taskText
   */
  async addTask(taskText) {
    await this.addTaskButton.click();
    await this.taskInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.taskInput.fill(taskText);
    await this.page.keyboard.press('Enter');
    await this.waitForLoadingToFinish();
    /** Wait for server confirmation — checkbox is disabled (isPersisted=false) until then. */
    await this.cardModal
      .locator('[class*="Task_wrapper"]')
      .filter({ hasText: taskText })
      .first()
      .locator('input[type="checkbox"]:not([disabled])')
      .waitFor({ state: 'visible', timeout: 8000 });
  }

  /**
   * Delete a task by its label text.
   * @param {string} taskText
   */
  async deleteTask(taskText) {
    const taskRow = this.cardModal
      .locator('[class*="Task_wrapper"]')
      .filter({ hasText: taskText })
      .first();
    await taskRow.hover();
    await taskRow.getByTitle('Edit Task').click();
    await this.page.getByTitle('Delete Task').click();
    await this.page.locator('[class*="DeleteStep_deleteButton"]').click();
    await this.waitForLoadingToFinish();
  }

  /**
   * Check (complete) a task by its label text.
   * @param {string} taskText
   */
  async checkTask(taskText) {
    const taskRow = this.cardModal
      .locator('[class*="Task_wrapper"]')
      .filter({ hasText: taskText });
    await taskRow.locator('input[type="checkbox"]').first().click();
  }

  /** Delete the card and wait for the modal to close. */
  async deleteCard() {
    await this.deleteButton.click();
    await this.confirmDeleteBtn.waitFor({ state: 'visible', timeout: 5000 });
    await this.confirmDeleteBtn.click();
    /** Wait for the confirm button to disappear — proof the server accepted the request. */
    await this.confirmDeleteBtn.waitFor({ state: 'hidden', timeout: 10000 });
    await this.cardModal.waitFor({ state: 'hidden', timeout: 10000 });
  }

  /** Close the card modal. */
  async close() {
    await this.closeButton.click();
    await this.waitForClose();
  }
}

module.exports = { CardPage };
