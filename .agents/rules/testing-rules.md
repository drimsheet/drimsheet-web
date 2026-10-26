# Testing Rules

## Goal

Test each ownership layer at the boundary it is responsible for. Use the
least expensive test that adequately protects the behavior. Browser startup,
navigation, repeated setup, CI runtime, flakiness, and maintenance are costs
that must be justified by the additional assurance.

## Components

- Test components with Vitest, Testing Library, and `userEvent`.
- Use real owned child components and hooks.
- Do not use module mocks in component tests.
- Use deterministic providers, fixtures, and browser-platform shims when the
  runtime requires them.
- Assert user-visible behavior, accessibility, callbacks, and validation
  outcomes rather than implementation details.

## Component Containers

- Test component containers with Vitest and Testing Library.
- Render the real presentational component owned by the container.
- Mock external hooks, services, navigation, storage, notifications, or other
  system boundaries only when necessary.
- Assert the orchestration contract between the external boundary and rendered
  component.

## Page-Owned Support Files

- Test private page UI and containers with the same Vitest boundaries as their
  component-owned counterparts. Import private modules explicitly, not through
  the page barrel.
- Mirror part tests under the page owner's `__tests__/parts/` directory.
- Keep page hook tests in `hooks/__tests__/` and deterministic helper tests in
  the page's `__tests__/helper.test.ts`.
- Test page entries and complete journeys with Playwright; moving a container
  into a page does not change the container's unit-test boundary.

## Browser Integration

- Write Playwright tests only for behavior whose regression requires the
  running frontend, browser, route, page, dialog, portal, or composed boundary.
  If a component, container, hook, mapper, service, or validation test can
  adequately detect the regression, that lower layer owns the coverage and it
  must not be duplicated in Playwright.
- Test dialogs, pages, and frontend route behavior with Playwright integration
  tests.
- Exercise the running application, real composed components, browser portals,
  focus behavior, navigation, and user interaction.
- Control first-party API outcomes with Playwright network interception.
- Register network interception before navigation or the interaction that can
  issue the request.
- Cover loading, success, failure, retained input, dismissal, and reopening
  behavior when relevant within an existing coherent journey. These states
  do not each warrant a separate test.
- Do not replace owned forms or components with mocks.
- Do not add Testing Library unit tests for dialogs or pages.
- Keep every test independently runnable without shared cookies, local storage,
  mutable accounts, or ordering assumptions.
- Use accessible role, label, text, and other user-facing locators. Use
  `data-testid` only when no stable user-facing contract can identify the
  element.
- Use awaited web-first assertions and Playwright auto-waiting. Do not use
  arbitrary `waitForTimeout` calls.
- Do not call a live first-party backend, database, shared account, inbox, or
  identity provider from this suite.
- Import `test` and `expect` from `@integration/fixtures/test` so normal and
  coverage runs share the same lifecycle.

### Admission of browser cases

Every browser case must earn its cost, including cases retained during an
audit. Before adding a case, establish all of the following:

- **Concrete regression:** identify the frontend integration or browser
  behavior that would break, such as route ownership, request scope, cache
  refresh, coordinated writes, focus, or history. Rendering a page is not
  sufficient justification for testing its individual fields in a browser.
- **Lower-level gap:** inspect existing component, container, hook, mapper,
  service, and validation coverage. If one of those layers can adequately
  detect the regression, use or extend that coverage and do not add the
  assertion to Playwright. A component appearing inside a page or dialog does
  not move its owned behavior into the browser-test boundary. Keep whole
  page/dialog composition in Playwright; do not move it into Testing Library to
  reduce the browser count.
- **Separate-case necessity:** extend an existing journey by default. A new
  case needs materially different setup, an incompatible terminal outcome,
  a distinct integration boundary, or a concrete isolation/diagnosis reason.
  Another assertion, UI state, or test title is not a justification.
- **Variant necessity:** each parameterized variant must exercise distinct
  wiring or browser behavior. Do not enumerate theme, viewport, status,
  validation, or payload combinations without evidence of that distinction.
  Prefer representative states; retain separate containers/endpoints where
  their own integration can fail independently.

State the justification for new cases in the change summary. During a scoped
audit, give every case a keep, consolidate, move to lower-level coverage, or
remove disposition with its reason. Existing tests and passing runs are not
evidence that the coverage is worth retaining.

### Consolidation boundaries

- Combine compatible stages of one lifecycle using named `test.step` blocks.
  For example, a form journey may cover cancel/reset, settled failure,
  retained edits, explicit submission, pending controls, success, and refreshed
  data without repeating navigation and login for each state. Include only
  stages relevant to that workflow.
- Exercise only recovery that the existing UI supports: normal submission or
  browser refresh where appropriate. Do not introduce retry/replay mechanisms
  to make a consolidated journey possible.
- Keep each case independent. Do not share mutable state across tests, or
  chain unrelated CRUD operations merely to lower the count. Split when
  consolidation would obscure diagnosis or prevent unrelated integration
  checks from running after an early failure.
- Preserve distinct security, financial, fail-closed, and write-ordering
  protections. Consolidate their compatible states; do not discard their
  integration coverage because a shared helper is unit-tested.

### Assertions must detect the claimed regression

- Failure tests must observe the handled error and completion of the pending
  state before asserting retained input or recovery. Values present before
  submission do not establish failure handling.
- Negative request assertions must follow the relevant settled UI outcome.
  Gate the specific request under test when asserting pending or stale-data
  behavior; a gate released on the first request cannot prove a later recheck.
- Query tests must assert exact relevant combined parameters and distinguishable
  rendered results. Pagination/filter/sort mocks must return appropriate
  different rows or ordering; a truthy direction or any matching request is
  insufficient. Check interaction between controls where state must persist
  or reset.
- Exercise the browser behavior named by the test: use Back for history
  protection, actual keyboard interaction for keyboard access, and scrolling
  for pinned actions. A URL, CSS class, or static visibility assertion alone
  does not establish those behaviors.

### Execution cost

- Avoid repeated setup and login when existing fixtures and direct navigation
  can reach the behavior without bypassing the boundary being tested. Keep
  authentication and entrypoint journeys where those connections matter.
- Do not add unconditional screenshots, traces, or videos that assert nothing.
  Retain configured failure diagnostics; visual assertions or explicitly
  requested manual evidence need a concrete purpose.
- Evaluate runtime, repeated work, retry frequency, and maintenance alongside
  case count. Do not use arbitrary count targets, remove required checks, or
  weaken assertions to claim savings. Report runtime savings only when
  measured; a static audit can identify likely savings without benchmarking.
- Follow the workflow's scoped verification guidance. Coverage collection and
  repeated full-suite runs are not routine prerequisites for every edit.

## Browser Integration Coverage

- Run Playwright code coverage only through
  `npm run test:integration:coverage`.
- Treat the report as Chromium runtime coverage for application modules loaded
  during the tested journeys, not as a replacement for Vitest coverage.
- Keep Playwright coverage output separate under `coverage/playwright/`.
- Do not enable coverage collection during normal integration runs.

## System End-to-End

- Keep complete journeys across the deployed frontend, API, database, email,
  and other real test-system boundaries in the separate E2E repository.
- Do not recreate system E2E coverage in this repository.
- A frontend route alone does not make a test E2E; select the layer according to
  the external boundaries exercised.

## Placement and Commands

Follow `.agents/workflow/testing.md` for test locations, Playwright separation,
and focused verification commands.

Vitest must not discover or execute `playwright/**/*.spec.ts`, and Playwright
must not discover `src/**/__tests__/**/*.test.ts` or
`src/**/__tests__/**/*.test.tsx` files.

## Dialog-Owned Support Files

- Apply page-owned support-file test placement and isolation to dialog owners.
- Test complete `.dialog.tsx` workflows with Playwright; test private parts,
  containers, hooks, and helpers with Vitest.
