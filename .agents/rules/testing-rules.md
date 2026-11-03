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
- Test page composition and state transitions with Playwright; moving a
  container into a page does not change the container's unit-test boundary.

## Browser Integration

- Playwright integration tests protect how real components interact within
  one page or dialog: which components render, their visible states, and the
  transitions caused by user interaction or controlled API responses.
- Write Playwright tests only for regressions in that page/dialog composition.
  If a component, container, hook, mapper, service, or validation test can
  adequately detect the regression, that lower layer owns the coverage and it
  must not be duplicated in Playwright.
- Exercise the running application, real composed components, browser portals,
  focus behavior, and user interaction within the owning page/dialog.
- Control first-party API outcomes with Playwright network interception.
- Register network interception before initial navigation or the interaction
  that can issue the request.
- Cover loading, success, failure, retained input, dismissal, and reopening
  behavior when relevant to the composed boundary. Group naturally connected
  transitions; do not force every outcome into one long test.
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

### Page/dialog boundary

- Identify one page or dialog as the owner of each test. Navigate directly to
  its public route with deterministic fixture setup; do not reach it by
  completing login, onboarding, or another page's workflow.
- A page may open its dialog, and a dialog test may use its real host page.
  Assert opening, dismissal, focus restoration, and an immediate update to the
  host page when these are the integration under test. Do not continue into
  another dialog's workflow or a subsequent page.
- Cross-page navigation, redirect destinations, and multi-page business
  journeys are outside this suite, even with mocked APIs. Test navigation
  intent at a lower layer where adequate; complete journeys belong in the
  separate E2E suite. If a routing concern fits neither boundary, call out the
  coverage gap rather than expanding a page/dialog test.
- Same-page URL state, such as filters or pagination, may support assertions
  about the owning page's rendered state. Browser history or browser APIs are
  relevant only when they change that page/dialog's composition or state;
  they are not independent reasons to add browser coverage.
- Stop at the owner's observable outcome. If success leaves the page, do not
  assert the destination page or continue its workflow.
- Assert behavior and state transitions, not just static visibility. Request
  assertions may support the rendered outcome but must not duplicate isolated
  service, mapper, validation, or business-rule coverage.

| Behavior                                                                          | Owner                             |
| --------------------------------------------------------------------------------- | --------------------------------- |
| Form validation, callback payloads, or a component with its owned children        | Vitest component/validation tests |
| A container maps an external hook result to its presentation                      | Vitest container test             |
| A page filter changes the table results while preserving other controls           | Playwright page integration       |
| A dialog coordinates pending/error controls or closes and refreshes its host page | Playwright dialog integration     |
| Login, onboarding, then navigation to another page to continue work               | Separate E2E suite                |

### Admission of browser cases

Every browser case must earn its cost, including cases retained during an
audit. Before adding a case, establish all of the following:

- **Concrete regression:** name the owning page/dialog, the interacting
  components, and the composed state or transition that would break, such as
  coordinated pending controls, refreshed table results, or focus restoration.
  Request scope, cache refresh, or coordinated writes qualify only through
  their effect on that owner's UI. Rendering a page is not sufficient
  justification for testing its individual fields in a browser.
- **Lower-level gap:** inspect existing component, container, hook, mapper,
  service, and validation coverage. If one of those layers can adequately
  detect the regression, use or extend that coverage and do not add the
  assertion to Playwright. A component appearing inside a page or dialog does
  not move its owned behavior into the browser-test boundary. Keep whole
  page/dialog composition in Playwright; do not move it into Testing Library to
  reduce the browser count.
- **Separate-case necessity:** extend an existing case within the same
  page/dialog boundary when the states naturally connect. A new
  case needs materially different setup, an incompatible terminal outcome,
  a distinct integration boundary, or a concrete isolation/diagnosis reason.
  Another assertion, UI state, or test title is not a justification.
- **Variant necessity:** each parameterized variant must exercise distinct
  wiring or browser behavior. Do not enumerate theme, viewport, status,
  validation, or payload combinations without evidence of that distinction.
  Prefer representative states; retain separate containers/endpoints where
  their own integration can fail independently.

State the owner and justification for new cases in the change summary. During
a scoped audit, give every case a keep, consolidate, move to lower-level
coverage, or remove disposition with its reason. Flag cross-page cases as
outside this suite; identify the appropriate owner or coverage gap. Existing
tests and passing runs are not evidence that the coverage is worth retaining.

### Consolidation boundaries

- Combine naturally connected transitions within one page/dialog using named
  `test.step` blocks: for example, submission, coordinated pending controls,
  and success with refreshed host-page data; or submission, settled error,
  and retained input. Do not require a failure-then-success sequence or chain
  cancel/reset/reopen into every test merely to reuse setup.
- Exercise only recovery that the existing UI supports: normal submission or
  browser refresh where appropriate. Do not introduce retry/replay mechanisms
  to make a consolidated case possible.
- Keep each case independent. Do not share mutable state across tests, or
  chain unrelated CRUD operations merely to lower the count. Split when
  consolidation would obscure diagnosis or prevent unrelated integration
  checks from running after an early failure.
- Preserve distinct security, financial, fail-closed, and write-ordering
  protections at the appropriate layer. Within the page/dialog boundary,
  consolidate their compatible states; do not discard their integration
  coverage because a shared helper is unit-tested. These concerns do not
  exempt a test from the page/dialog scope.

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
- Exercise the browser behavior named by the test: use Back for same-page
  history state, actual keyboard interaction for keyboard access, and scrolling
  for pinned actions. A URL, CSS class, or static visibility assertion alone
  does not establish those behaviors.

### Execution cost

- Use existing fixtures and direct navigation to establish the owning
  page/dialog's prerequisites. Login is setup for other owners, not a journey
  to replay in their tests. Authentication pages may have their own composed
  state tests under the same page/dialog boundary.
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
  during the tested page/dialog cases, not as a replacement for Vitest coverage.
- Keep Playwright coverage output separate under `coverage/playwright/`.
- Do not enable coverage collection during normal integration runs.

## System End-to-End

- Keep complete journeys across the deployed frontend, API, database, email,
  and other real test-system boundaries in the separate E2E repository.
- Do not recreate system E2E coverage in this repository.
- Cross-page frontend navigation is not inherently system E2E, but this
  repository deliberately excludes it from page/dialog integration coverage,
  including when APIs are mocked. Do not use that distinction to admit
  cross-page tests here.

## Placement and Commands

Follow `.agents/workflow/testing.md` for test locations, Playwright separation,
and focused verification commands.

Vitest must not discover or execute `playwright/**/*.spec.ts`, and Playwright
must not discover `src/**/__tests__/**/*.test.ts` or
`src/**/__tests__/**/*.test.tsx` files.

## Dialog-Owned Support Files

- Apply page-owned support-file test placement and isolation to dialog owners.
- Test `.dialog.tsx` composition and state transitions with Playwright within
  the page/dialog boundary above; test private parts, containers, hooks, and
  helpers with Vitest.
