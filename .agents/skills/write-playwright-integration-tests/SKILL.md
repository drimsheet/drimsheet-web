---
name: write-playwright-integration-tests
description: Create, refactor, debug, or review Playwright browser integration tests in this repository. Use for playwright.config.ts, playwright/**/*.spec.ts, Playwright fixtures, network mocks, test-data factories, page objects, browser routing or dialog coverage, and deciding whether a user journey belongs in frontend integration or the separate system E2E suite.
---

# Write Playwright Integration Tests

Protect frontend integration with the smallest adequate set of coherent browser
journeys. Every separate case must justify its execution and maintenance cost.
Do not depend on a live backend or duplicate the separate system E2E suite.

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

- Use Playwright here for routes, pages, dialogs, portals, focus, navigation,
  browser APIs, and composed frontend behavior with controlled first-party API
  responses.
- Keep components, containers, hooks, mappers, services, and validation in
  Vitest unless browser composition is material to the outcome.
- Keep journeys involving the real API, database, email delivery, identity
  provider, or other deployed services in the separate E2E repository.

## Workflow

1. Inspect `git status` and preserve unrelated work.
2. Apply the browser-case admission requirements in
   [Testing Rules](../../rules/testing-rules.md#browser-integration). Identify
   the concrete regression; inspect the route, page/dialog, API contract,
   translations, existing journeys, and lower-level coverage.
3. Default to extending an existing journey or lower-level test. Justify any
   new browser case and each matrix variant by the uncovered integration risk
   and reason it cannot reasonably join an existing lifecycle. Record that
   reasoning in the change summary, not per-assertion boilerplate.
4. Follow [Testing Workflow](../../workflow/testing.md#browser-integration-tests)
   to consolidate compatible states using `test.step`. Extend the owning spec
   under `playwright/tests/<feature>/<user-outcome>.spec.ts`. Loading, failure,
   retention, dismissal, and success do not each deserve a separate case;
   unrelated workflows must not be chained to meet a test-count target.
5. Import `test` and `expect` from `@integration/fixtures/test` so the spec
   participates in opt-in code coverage.
6. Register network interception before navigation or the interaction that can
   issue the request.
7. Navigate through the public route and use the real application composition.
8. Prefer role, label, text, placeholder, alt text, and title locators. Use a
   test ID only when no user-facing contract is stable.
9. Use awaited web-first assertions and Playwright auto-waiting. Do not use
   fixed sleeps.
10. Apply the rules' assertion requirements: observe settled failures, use
    distinguishable query results and exact relevant combined parameters,
    gate the request actually under test, and exercise claimed browser behavior.
    Do not accept pre-existing values or static visibility as proof of a
    completed operation.
11. Review repeated navigation/login, parameter matrices, and artifacts for
    unnecessary cost. Preserve distinct financial/security protections and
    independently wired containers. Verify using the scoped guidance below.

For audits, account for every case in scope with a reasoned keep, consolidate,
move, or remove disposition and a destination for preserved coverage. Flag
ineffective assertions as well as redundant cases. A passing test or lower
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
  journeys and lower-level owners were considered first.
- Compatible states share a coherent lifecycle with readable steps; distinct
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
