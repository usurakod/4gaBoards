# Test Plan — 4ga Boards E2E Testing

**Project:** 4ga Boards (https://github.com/RARgames/4gaBoards)
**Tool:** Playwright
**Date:** 2026-04-13

---

## 1. Scope

Two core features selected for end-to-end testing:

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | **User Authentication** | Gate to the entire application. If login/logout breaks, nothing else is accessible. |
| 2 | **Card Management** | Core value of a kanban board. Create, edit, move, and delete cards is the primary user workflow. |

---

## 2. Test Environment

- **Base URL:** `http://localhost:3000` (override with `BASE_URL` env var)
- **Default credentials:** `demo` / `demo`
- **Setup:** `docker compose up -d` from repo root
- **Browser:** Chromium (desktop)

---

## 3. Test Cases

Tests are grouped into three layers: **E2E journeys** (full user flows), **E2E flows** (focused single-concern flows), and **feature tests** (isolated single-behaviour checks).

---

### 3.1 Authentication — E2E Journey

File: `tests/e2e/auth/auth.journey.spec.js`

| ID | Title | Type | Priority |
|----|-------|------|----------|
| AUTH-J-01 | Invalid login → valid login → logout (full journey) | E2E journey | P1 |

---

### 3.2 Authentication — E2E Flows

| ID | Title | File | Type | Priority |
|----|-------|------|------|----------|
| AUTH-E-01 | Session survives full page reload | `auth/auth.persistence.spec.js` | Happy path | P1 |
| AUTH-E-02 | New tab in same browser context shares logged-in state | `auth/auth.session.spec.js` | Happy path | P2 |
| AUTH-E-03 | Logout in tab1 reflects in tab2 on next navigation | `auth/auth.multiTab.spec.js` | Happy path | P2 |

---

### 3.3 Authentication — Validation & Security

File: `tests/e2e/auth/auth.validation.spec.js`

| ID | Title | Type | Priority |
|----|-------|------|----------|
| AUTH-V-01 | Empty username and password — stays on login page | Negative | P1 |
| AUTH-V-02 | Wrong password for valid username shows error | Negative | P1 |
| AUTH-V-03 | Non-existent username shows error | Negative | P2 |

File: `tests/e2e/auth/auth.security.spec.js`

| ID | Title | Type | Priority |
|----|-------|------|----------|
| AUTH-S-01 | Unauthenticated visit to `/boards/1` redirects to login | Security | P1 |
| AUTH-S-02 | Unauthenticated visit to `/` redirects to login | Security | P1 |
| AUTH-S-03 | Browser back button after logout does not restore session | Security | P1 |

---

### 3.4 Card Management — E2E Journey

File: `tests/e2e/card/card.lifecycle.spec.js`

| ID | Title | Type | Priority |
|----|-------|------|----------|
| CARD-J-01 | Full card lifecycle: create → edit → task → move → delete | E2E journey | P1 |

---

### 3.5 Card Management — E2E Flows

| ID | Title | File | Type | Priority |
|----|-------|------|------|----------|
| CARD-E-01 | Card title and description persist after page reload | `card/card.persistence.spec.js` | Happy path | P1 |
| CARD-E-02 | Card created by user1 is visible to user2 in a separate session | `card/card.multiUser.spec.js` | Happy path | P2 |
| CARD-E-03 | Empty title submission leaves form open (no card created) | `card/card.failureFlows.spec.js` | Negative | P1 |
| CARD-E-04 | Abandoning the add-card form does not create a card | `card/card.failureFlows.spec.js` | Negative | P2 |

---

### 3.6 Card Management — Feature Tests

#### Create

File: `tests/e2e/features/card/create/`

| ID | Title | File | Type | Priority |
|----|-------|------|------|----------|
| CARD-F-C-01 | Created card appears in the correct list | `create.basic.spec.js` | Happy path | P1 |
| CARD-F-C-02 | Cannot create a card with an empty title | `create.validation.spec.js` | Negative | P1 |
| CARD-F-C-03 | Single-character title creates a valid card | `create.boundary.spec.js` | Boundary | P2 |
| CARD-F-C-04 | 200-character title is accepted or gracefully truncated | `create.boundary.spec.js` | Boundary | P2 |

#### Edit

File: `tests/e2e/features/card/edit/`

| ID | Title | File | Type | Priority |
|----|-------|------|------|----------|
| CARD-F-E-01 | Updated title reflects on the board | `edit.title.spec.js` | Happy path | P1 |
| CARD-F-E-02 | Description is saved and visible in the card modal | `edit.description.spec.js` | Happy path | P1 |

#### Delete

File: `tests/e2e/features/card/delete/delete.card.spec.js`

| ID | Title | Type | Priority |
|----|-------|------|----------|
| CARD-F-D-01 | Deleted card is removed from the board | Happy path | P1 |

#### Move

File: `tests/e2e/features/card/move/move.dragdrop.spec.js`

| ID | Title | Type | Priority |
|----|-------|------|----------|
| CARD-F-M-01 | Dragged card appears in target list and is removed from source | Happy path | P1 |

#### Checklist

File: `tests/e2e/features/card/checklist/checklist.spec.js`

| ID | Title | Type | Priority |
|----|-------|------|----------|
| CARD-F-CL-01 | Task can be added and checked off | Happy path | P2 |

#### Edge Cases

File: `tests/e2e/features/card/edgeCases/`

| ID | Title | File | Type | Priority |
|----|-------|------|------|----------|
| CARD-F-X-01 | Two cards with the same title can coexist in the same list | `duplicate.spec.js` | Edge case | P2 |
| CARD-F-X-02 | Card with special characters (`!@#$%^&*()`) is created correctly | `specialChars.spec.js` | Edge case | P2 |
| CARD-F-X-03 | Three cards created in rapid succession all appear in the list | `rapidActions.spec.js` | Edge case | P2 |

---

## 4. Test Design Approach

- **Pattern:** Page Object Model (POM) — each page/component is a class under `tests/pages/`
- **Fixtures:** Shared test data lives in `tests/fixtures/testData.js`
- **Cleanup:** Feature tests use `try/finally` to guarantee card deletion even on failure
- **Isolation:** Card tests create throwaway data with unique timestamps; `beforeEach` handles login and navigation
- **Selectors:** `getByRole` and `getByTitle` preferred; `[class*="partial"]` used as resilient fallback for React CSS Module hashed class names
- **Optimistic UI:** Card and task interactions wait for server confirmation (`div[class*="Card_content"]` and `input[type="checkbox"]:not([disabled])`) before proceeding — prevents flaky failures on unpersisted elements
- **Drag-and-drop:** react-beautiful-dnd requires a specific mouse event sequence (hold ≥150 ms → jitter → slow 25-step move → pause → release)
- **Multi-user:** Two-browser-context pattern (`browser.newContext()`) isolates session cookies per user

---

## 5. Out of Scope

- SSO login (Google / GitHub / Microsoft) — requires OAuth credentials
- Import / export functionality
- Visual regression / dark mode / accessibility
- Performance and load testing

---

## 6. Running the Tests

```bash
# 1. Make sure Docker is running and the app is up
docker compose up -d

# 2. Install dependencies (run once)
cd 4gaboards-tests
npm install
npx playwright install chromium

# 3. Run all tests
npm test

# 4. Run a specific group
npx playwright test tests/e2e/auth/
npx playwright test tests/e2e/card/
npx playwright test tests/e2e/features/

# 5. Run a single file
npx playwright test tests/e2e/auth/auth.journey.spec.js

# 6. Open the HTML report
npm run test:report
```
