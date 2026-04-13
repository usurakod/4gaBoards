// tests/fixtures/testData.js
// Central store for all test data used across the suite.

const TEST_USER = {
  username: 'demo',
  password: 'demo',
  email: 'demo@demo.demo',
};

const INVALID_USER = {
  username: 'demo',
  password: 'wrongpassword123',
};

// Base timestamp — incremented per entry so every value is unique even when
// all properties are evaluated in the same millisecond.
const _ts = Date.now();

const CARD_DATA = {
  title:        `Test Card ${_ts}`,      // TC-01: create card
  dragTitle:    `Drag Card ${_ts + 1}`,  // TC-05: drag-and-drop
  taskTitle:    `Task Card ${_ts + 2}`,  // TC-06: checklist task
  updatedTitle: `Updated Card ${_ts}`,
  description:  '**Bold description** with _italic_ text',
  taskItem:     `Task_${_ts}`,
};

const LIST_NAMES = {
  todo: 'Getting Started',
  inProgress: 'Useful Links',
};

module.exports = { TEST_USER, INVALID_USER, CARD_DATA, LIST_NAMES };
