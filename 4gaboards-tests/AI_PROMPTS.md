# AI Agent Interaction Log

This file documents the prompts used when working with AI agents to assist in
designing, planning, and implementing these Playwright tests.

---

## Prompt 1 — Feature Selection

**Goal:** Identify the best two features to cover with E2E tests.

**Prompt sent to Claude:**
> I am setting up Playwright E2E tests for 4ga Boards, an open-source kanban
> board application (https://github.com/RARgames/4gaBoards). Based on its
> features — card management, lists, boards, Markdown descriptions, tasks,
> drag-and-drop, user authentication (local + SSO) — which two features would
> give the best E2E coverage? Consider business criticality, risk if broken,
> and test complexity.

**Outcome:**
Selected **User Authentication** and **Card Management** based on:
- Authentication is the gate to every other feature
- Card management is the core product workflow (create, edit, move, delete)

---

## Prompt 2 — Test Case Design

**Goal:** Define specific test cases for both features.

**Prompt sent to Claude:**
> For User Authentication and Card Management in 4ga Boards, write a
> comprehensive set of E2E test cases. Each case should include: test ID,
> title, pre-conditions, steps, and expected result. Include both happy-path
> and negative/edge cases.

**Outcome:**
Generated an initial set of 14 test cases (TC-01 through TC-14) covering
happy path flows, negative cases for empty inputs and duplicate data, and a
security test for protected route access. These were later expanded into a
structured 27-test suite (see Prompt 9).

---

## Prompt 3 — POM Architecture

**Goal:** Design the Page Object Model structure.

**Prompt sent to Claude:**
> Design a Playwright Page Object Model (POM) for 4ga Boards. The app has:
> a login page, a register page, a board view with lists and cards, and a card
> detail modal. Suggest what classes to create, what selectors to use
> (preferring role/aria over CSS classes), and how to share utilities.

**Outcome:**
Defined five classes: BasePage, LoginPage, RegisterPage, BoardPage, CardPage.
BasePage holds shared utilities inherited by all others.

---

## Prompt 4 — Drag-and-Drop Implementation

**Goal:** Handle the drag-and-drop interaction reliably.

**Prompt sent to Claude:**
> How do I implement a reliable drag-and-drop test in Playwright for a
> react-beautiful-dnd component? The card needs to move from one list column
> to another.

**Outcome:**
Used `page.mouse` API with move/down/up and stepped movement to simulate a
realistic drag. The required sequence is: hold ≥150 ms → small jitter →
slow 25-step move to target → 300 ms pause → release. `dragTo()` is not
reliable with react-beautiful-dnd.

---

## Prompt 5 — Selector Strategy for CSS Modules

**Goal:** Keep selectors resilient to CSS Module hash class name changes.

**Prompt sent to Claude:**
> 4ga Boards uses React with CSS Modules so class names like `.cardItem__abc`
> change between builds. What selector strategy should I use in Playwright
> to keep tests stable across builds?

**Outcome:**
Adopted a layered strategy: `getByRole` and `getByTitle` as first choice,
`[class*="partialName"]` substring matching as resilient fallback,
and `filter({ hasText })` to scope locators contextually within list columns.

---

## Prompt 6 — Fixing Flaky Card Interactions (Optimistic UI)

**Goal:** Resolve failures where `openCard()` timed out and drag-and-drop silently failed on newly created cards.

**Prompt sent to Claude:**
> Test TC-06 is failing — openCard() times out when clicking a card that was just created.
> Also TC-05 (drag) silently fails on the same cards.

**Outcome:**
Identified root cause: 4ga Boards uses an optimistic UI pattern. Newly created
cards are rendered as `<span class="Card_content">` (no `onClick`, `isDragDisabled=true`)
until the server confirms. Only after server confirmation does the element
become `<div class="Card_content">` with a working click handler.

Fixes applied:
- `openCard()` changed to target `div[class*="Card_content"]` — the `<div>` only
  exists when the card is persisted, making it a natural persistence gate.
- `addCard()` now waits for `div[class*="Card_content"]` before returning, ensuring
  the caller always receives a fully persisted card.
- Same pattern applied to tasks: `addTask()` waits for
  `input[type="checkbox"]:not([disabled])` before returning, since the checkbox
  is `disabled={!isPersisted}` until the server responds.

---

## Prompt 7 — Auth Login Field Not Clearing Between Attempts

**Goal:** Fix the E2E auth journey where valid credentials fail because the field still contains the previous (invalid) username.

**Prompt sent to Claude:**
> For the valid user login the input fields are not cleared hence its failing for valid credentials.

**Outcome:**
The `login()` method was appending to the existing field value because
`pressSequentially` does not clear first. Fixed by adding
`click({ clickCount: 3 })` before typing — triple-click selects all existing
text so the subsequent keystrokes replace rather than append it.

---

## Prompt 8 — Full Test Suite Expansion

**Goal:** Expand from 14 flat test cases into a layered suite covering auth and card flows end-to-end.

**Prompt sent to Claude:**
> Create all the e2e flows for card — like this:
> e2e/
> ├── card/          ← full journey + integration flows
> │   ├── card.lifecycle.spec.js
> │   ├── card.persistence.spec.js
> │   ├── card.multiUser.spec.js
> │   └── card.failureFlows.spec.js
> └── features/card/ ← isolated single-feature checks
>     ├── create/
>     ├── edit/
>     ├── delete/
>     ├── move/
>     ├── checklist/
>     └── edgeCases/

**Outcome:**
Created the full directory structure under `tests/e2e/`. Key design decisions:
- `card.lifecycle.spec.js` — single chained journey (create → edit → task → move → delete) using `test.step()`
- `card.multiUser.spec.js` — two-browser-context pattern (`browser.newContext()`) to isolate sessions per user
- Feature tests each use `try/finally` to guarantee cleanup even on assertion failure
- `playwright.config.js` `testDir: './tests/e2e'` — all feature tests must live under `tests/e2e/features/` to be picked up by the runner

---

## Prompt 9 — Full Auth E2E Coverage

**Goal:** Mirror the card structure for auth with six dedicated spec files.

**Prompt sent to Claude:**
> Cover e2e flow for auth as well:
> e2e/auth/
> ├── auth.journey.spec.js
> ├── auth.persistence.spec.js
> ├── auth.session.spec.js
> ├── auth.validation.spec.js
> ├── auth.security.spec.js
> └── auth.multiTab.spec.js

**Outcome:**
Created all six auth spec files:
- `auth.journey.spec.js` — full user journey (invalid login → valid login → logout) using `test.step()`
- `auth.persistence.spec.js` — session survives `page.reload()`
- `auth.session.spec.js` — `context.newPage()` shares cookie jar; new tab shows logged-in state without re-auth
- `auth.validation.spec.js` — empty fields, wrong password, non-existent username each in isolated `test()` blocks
- `auth.security.spec.js` — unauthenticated visits to `/` and `/boards/1` redirect to `/login`; browser back after logout does not restore session
- `auth.multiTab.spec.js` — logout in tab1, navigate in tab2, tab2 redirects to login

---

## Prompt 10 — Duplicate Card Strict Mode Fix

**Goal:** Fix strict mode violation in `duplicate.spec.js` where `addCard()` returned a locator matching two same-title cards.

**Prompt sent to Claude:**
> Running 1 test using 1 worker — strict mode violation: locator resolved to 2 elements.

**Outcome:**
`addCard()` was updated to snapshot the count of existing same-title cards
before creating the new one (`existingCount`), then return `.nth(existingCount)`
to target only the newly created card. This makes duplicate-title tests
unambiguous without requiring unique titles.

---

## Prompt 11 — rapidActions Timeout Fix

**Goal:** Fix `waitForClose` timeout on the third card deletion in the rapid actions test.

**Prompt sent to Claude:**
> [rapidActions failure: waitForClose timeout after sequential deletions]

**Outcome:**
`deleteCard()` in CardPage was relying solely on the card modal disappearing
as the signal that deletion was complete. Under sequential rapid deletions the
server was slow to respond. Fixed by adding an intermediate wait:
`confirmDeleteBtn.waitFor({ state: 'hidden', timeout: 10000 })` — the confirm
button disappearing is a reliable server-acknowledgment signal before the modal
closes. Modal close timeout also increased from 5 000 ms to 10 000 ms.
