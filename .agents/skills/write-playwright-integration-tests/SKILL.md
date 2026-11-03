---
name: write-playwright-integration-tests
description: Create, refactor, debug, or review Playwright integration tests in this repository. Use for page/dialog component composition and state transitions, Playwright configuration and support code, and deciding whether coverage belongs in Vitest, page/dialog integration, or the separate E2E suite.
---

# Write Playwright Integration Tests

Protect component integration within one page or dialog: rendered components,
visible states, and state transitions. Every separate case must justify its
execution and maintenance cost. Do not test cross-page journeys or depend on
a live backend.

## Read the rules

Before editing integration tests or configuration:

1. Read `.agents/rules/folder-structure.md`,
   `.agents/rules/dependency-rules.md`,
   `.agents/rules/file-responsibility-rules.md`,
   `.agents/rules/type-naming-rules.md`, and
   `.agents/rules/testing-rules.md`.
2. Read `.agents/workflow/testing.md`.
3. Treat those files as authoritative. Existing or removed E2E files may
   predate the current boundary.

## Select the boundary

- Write Playwright coverage only when the regression depends on components
  composing within one page or dialog. Before adding a case
  or assertion, determine whether a component, container, hook, mapper,
  service, or validation test can detect it. If so, add or retain the coverage
  there and omit it from Playwright. Rendering that owner inside a page or
  dialog does not make its isolated behavior an integration concern.
- Name the owning page/dialog and follow the rules'
  [page/dialog boundary](../../rules/testing-rules.md#pagedialog-boundary).
  Use controlled first-party API responses. Portals, focus, browser APIs, and
  same-page URL state qualify only through their effect on that owner's UI.
- Direct route entry and fixture prerequisites are setup. A dialog may open
  from and update its host page. Exclude cross-page navigation, redirect
  destination assertions, and subsequent page/dialog workflows even with
  mocked APIs. Do not replay login/onboarding to reach the owner.
- Keep components, containers, hooks, mappers, services, and validation in
  Vitest unless browser composition is material to the outcome.
- Keep journeys involving the real API, database, email delivery, identity
  provider, or other deployed services in the separate E2E repository.

## Workflow

1. Inspect `git status` and preserve unrelated work.
2. Apply the browser-case admission requirements in
   [Testing Rules](../../rules/testing-rules.md#browser-integration). Identify
   the concrete regression; inspect the route, page/dialog, API contract,
   translations, existing cases for that owner, and lower-level coverage. Reject the
   Playwright assertion when a lower-level owner can adequately protect it.
3. Extend an existing case for the same owner when states naturally connect,
   or extend a lower-level test. Justify any
   new browser case and each matrix variant by the uncovered integration risk
   and reason it cannot reasonably join an existing lifecycle. Record that
   reasoning in the change summary, not per-assertion boilerplate.
4. Follow [Testing Workflow](../../workflow/testing.md#browser-integration-tests)
   to group naturally connected transitions using `test.step`. Extend the
   owning spec under `playwright/tests/<feature>/<user-outcome>.spec.ts`.
   Do not force failure-then-success or dismissal/reopening sequences merely
   to reuse setup; never chain unrelated workflows to meet a test-count target.
5. Import `test` and `expect` from `@integration/fixtures/test` so the spec
   participates in opt-in code coverage.
6. Register network interception before navigation or the interaction that can
   issue the request.
7. Navigate directly to the owner's public route and use real application
   composition. Open the dialog from its host page when needed.
8. Prefer role, label, text, placeholder, alt text, and title locators. Use a
   test ID only when no user-facing contract is stable.
9. Use awaited web-first assertions and Playwright auto-waiting. Do not use
   fixed sleeps.
10. Apply the rules' assertion requirements: observe settled failures, use
    distinguishable query results and exact relevant combined parameters,
    gate the request actually under test, and exercise claimed browser behavior.
    Do not accept pre-existing values or static visibility as proof of a
    completed operation. Assert requests only in support of the owner's UI
    outcome, and stop without asserting a subsequent page's state.
11. Review prerequisite setup, parameter matrices, and artifacts for
    unnecessary cost. Preserve distinct financial/security protections at the
    appropriate layer and independently wired containers within the page/dialog
    boundary. Verify using the scoped guidance below.

For audits, account for every case in scope with a reasoned keep, consolidate,
move, or remove disposition and a destination for preserved coverage. Flag
cross-page cases, coverage gaps, ineffective assertions, and redundant cases.
A passing test or lower
case count does not establish useful coverage. Honor read-only audit requests.

Keep one-off locators and route responses in the owning spec. Extract a fixture,
feature mock, factory, or page object only when reuse or lifecycle complexity
justifies it. Do not create base page classes or generic helper buckets.

## Verification

Follow [Final Verification](../../workflow/testing.md#final-verification).
For test changes, start with integration typechecking and affected specs:

```bash
npm run typecheck:integration
npm run test:integration -- playwright/tests/<feature>/<name>.spec.ts --project=chromium
```

Use focused runs to verify independence when needed. Broaden only for affected
shared behavior, configuration changes, or unresolved failures; do not repeat
successful runs without a reason. Keep files stable while the browser suite
runs. Guidance-only changes need document/skill validation, not browser runs.

Available broader checks, selected according to the change:

```bash
npm run test:integration
npm test -- --run
npm run lint
npm run build
```

Use `npx playwright test --list` when inventory or runner configuration changes.
Coverage is opt-in: use `npm run test:integration:coverage` only for a concrete
coverage question or an explicit request. Inspect traces and the HTML report
when a browser test fails. Report environmental blockers; do not work around
them by calling a live backend. Report measured timings separately from case
count reductions, and preserve configured failure diagnostics and CI checks.

## Completion checklist

- Each added case and variant passes the admission requirements; existing
  cases for the same page/dialog and lower-level owners were considered first.
- One page/dialog owns the test; no cross-page journey or destination-page
  assertion is included. Dialog-to-host updates stay within the stated boundary.
- Naturally connected states share readable steps; distinct
  integration protections remain covered.
- The spec is feature-owned and independently runnable.
- Expected API calls are intercepted before they can fire.
- No live service, secret, shared account, inbox, or mutable shared state is
  required.
- Locators express accessible or user-visible contracts.
- Assertions use Playwright retrying behavior without fixed sleeps.
- Assertions would detect the claimed regression after the operation settles.
- Support abstractions exist only where reuse justifies them.
- Repeated setup and non-asserting artifacts do not add unjustified cost.
- The spec uses the coverage-aware integration fixture.
- Verification matches the change scope; applicable checks pass or remaining
  blockers are reported.
