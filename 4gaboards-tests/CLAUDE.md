# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run all tests
npm test

# Run a specific directory
npx playwright test tests/e2e/auth/
npx playwright test tests/e2e/card/
npx playwright test tests/e2e/features/

# Run a single spec file
npx playwright test tests/e2e/auth/auth.journey.spec.js

# Run a single test by name (grep)
npx playwright test --grep "Full card lifecycle"

# Open the HTML report after a run
npm run test:report

# Install browsers (run once after npm install)
npx playwright install chromium
```

The app under test must be running before any test command:
```bash
docker compose up -d   # from the 4gaBoards repo root
```

Override the target URL with `BASE_URL=http://localhost:3001 npm test`.

## Architecture

**Stack:** Playwright + CommonJS. No TypeScript, no transpilation step.

**`playwright.config.js`**
- `testDir: './tests/e2e'` — only files under `tests/e2e/` are picked up. Any new spec must live there.
- `workers: 1`, `fullyParallel: false` — all tests run sequentially in a single worker against the same live app and shared board state (same demo user).
- `baseURL` defaults to `http://localhost:3000`.

**Page Objects (`tests/pages/`)**
- `BasePage` — inherited by all page classes. Provides `navigate()`, `clearAndFill()`, and `waitForLoadingToFinish()`.
- `LoginPage` — `login()`, `loginAsDemoUser()`, `logout()`, `getErrorLocator()`.
- `BoardPage` — `addCard()`, `openCard()`, `dragCardToList()`, `getCardsInList()`, `getList()`.
- `CardPage` — `updateTitle()`, `setDescription()`, `addTask()`, `checkTask()`, `deleteTask()`, `deleteCard()`, `close()`.

**`tests/fixtures/testData.js`** — single source of truth for credentials (`TEST_USER`, `INVALID_USER`), card titles/content (`CARD_DATA`), and list names (`LIST_NAMES`).

**Test layout under `tests/e2e/`**
- `auth/` — six auth spec files covering the full journey, session/persistence/multi-tab, validation, and security.
- `card/` — four card spec files covering the full lifecycle, data persistence, multi-user visibility, and failure flows.
- `features/card/` — isolated single-behaviour checks (create, edit, delete, move, checklist, edgeCases).

## Key Conventions

**Selector strategy** — CSS Modules produce hashed class names (`Card_content__abc`). Use `[class*="PartialName"]` substring matching as a stable fallback. Prefer `getByRole` / `getByTitle` where available.

**Optimistic UI gate** — The app renders newly created cards as `<span class="Card_content">` (no `onClick`) until server confirmation, then switches to `<div class="Card_content">`. Always wait for `div[class*="Card_content"]` before clicking a card. `addCard()` already does this internally. Similarly, task checkboxes are `disabled` until persisted — wait for `input[type="checkbox"]:not([disabled])`.

**`addCard()` return value** — Returns a locator scoped to the newly added card (`.nth(existingCount)` of the title-filtered set). Use this reference directly for assertions and `openCard()` calls rather than re-querying the list, to avoid strict-mode violations when multiple cards share similar titles.

**Cleanup pattern** — Feature tests use `try/finally` to guarantee card deletion even on assertion failure. Each test creates throwaway cards with unique `Date.now()` timestamps so parallel or sequential re-runs don't collide.

**Login helper** — `loginPage.login()` uses `click({ clickCount: 3 })` before typing to select-all, ensuring fields are fully replaced rather than appended to when called in succession (important for the invalid→valid login journey).

**`deleteCard()` sequencing** — Waits for `confirmDeleteBtn` to disappear (`state: 'hidden'`) as the server-acknowledgment signal before waiting for the modal to close. This prevents timeout failures during sequential deletions.

**react-beautiful-dnd drag** — `dragCardToList()` uses `page.mouse` with: hold 500 ms → 5-step jitter → 25-step slow move to target → 300 ms pause → release. `dragTo()` is not reliable with RBD.

**Multi-user tests** — Use `browser.newContext()` to create two isolated browser contexts with separate cookie jars. Each context gets its own `page`, `LoginPage`, and `BoardPage` instance.
