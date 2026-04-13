# 4ga Boards — Playwright E2E Tests

## Project Structure

```
4gaboards-tests/
├── package.json                  # Dependencies and npm scripts
├── playwright.config.js          # Playwright configuration (testDir: tests/e2e)
├── TEST_PLAN.md                  # Test plan
├── AI_PROMPTS.md                 # AI agent interaction log
├── README.md                     # This file
└── tests/
    ├── fixtures/
    │   └── testData.js           # Shared constants (users, card data, list names)
    ├── pages/                    # Page Object Model classes
    │   ├── BasePage.js           # Shared utilities (navigate, clearAndFill, waitForLoading)
    │   ├── LoginPage.js          # Login, logout, loginAsDemoUser
    │   ├── BoardPage.js          # Board view: lists, cards, drag-and-drop
    │   └── CardPage.js           # Card modal: title, description, tasks, delete
    └── e2e/                      # All test specs (picked up by playwright.config.js)
        ├── auth/                 # Authentication E2E flows
        │   ├── auth.journey.spec.js      # invalid login → valid login → logout
        │   ├── auth.persistence.spec.js  # session survives full page reload
        │   ├── auth.session.spec.js      # new tab in same context shares session
        │   ├── auth.validation.spec.js   # empty fields, wrong password, unknown user
        │   ├── auth.security.spec.js     # protected routes redirect; back-button after logout
        │   └── auth.multiTab.spec.js     # logout in tab1 reflects in tab2
        ├── card/                 # Card E2E flows (full journeys)
        │   ├── card.lifecycle.spec.js    # create → edit → task → move → delete
        │   ├── card.persistence.spec.js  # create + description → reload → data still there
        │   ├── card.multiUser.spec.js    # user1 creates card, user2 sees it live
        │   └── card.failureFlows.spec.js # empty title rejected, abandon form no card created
        └── features/             # Focused single-feature tests
            └── card/
                ├── checklist/
                │   └── checklist.spec.js          # add, check, delete tasks
                ├── create/
                │   ├── create.basic.spec.js        # happy-path card creation
                │   ├── create.validation.spec.js   # empty title not accepted
                │   └── create.boundary.spec.js     # 1-char and 200-char titles
                ├── delete/
                │   └── delete.card.spec.js         # delete card and confirm removal
                ├── edit/
                │   ├── edit.title.spec.js          # rename card title
                │   └── edit.description.spec.js    # add/update card description
                ├── move/
                │   └── move.dragdrop.spec.js       # drag card between lists
                └── edgeCases/
                    ├── duplicate.spec.js            # two cards with the same title
                    ├── specialChars.spec.js         # title with !@#$%^&*() characters
                    └── rapidActions.spec.js         # 3 cards created in rapid succession
```

## Prerequisites

- Node.js 18 or higher
- Docker Desktop installed and running
- The 4ga Boards app running via `docker compose up -d` (from repo root)

## Setup

```bash
# From inside the 4gaboards-tests folder
npm install
npx playwright install chromium
```

## Running Tests

```bash
# Run all tests
npm test

# Run only authentication tests
npx playwright test tests/e2e/auth/

# Run only card E2E flows
npx playwright test tests/e2e/card/

# Run only focused feature tests
npx playwright test tests/e2e/features/

# Run a specific spec file
npx playwright test tests/e2e/auth/auth.journey.spec.js

# Open the HTML report after a run
npm run test:report
```

## Environment Variables

| Variable   | Default                 | Description            |
|------------|-------------------------|------------------------|
| `BASE_URL` | `http://localhost:3000` | URL of the running app |

```bash
BASE_URL=http://localhost:3001 npm test
```
