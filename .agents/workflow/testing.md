# Testing Workflow

## Goal

Choose the least expensive adequate runner and isolation boundary for the
behavior under test. Default to extending existing coverage before adding
another page/dialog integration case.

## Test Matrix

| Layer                    | Runner                   | Boundary                                                            | Location                       |
| ------------------------ | ------------------------ | ------------------------------------------------------------------- | ------------------------------ |
| Component                | Vitest + Testing Library | Real owned component tree                                           | Owner `__tests__/*.test.tsx`   |
| Component container      | Vitest + Testing Library | Real presentation with external boundaries mocked                   | Owner `__tests__/*.test.tsx`   |
| Hook, mapper, validation | Vitest                   | Deterministic module contract                                       | Owner `__tests__/*.test.ts(x)` |
| Browser integration      | Playwright               | One page/dialog's component composition and states; controlled APIs | `playwright/tests/<feature>/`  |
| System end-to-end        | External E2E suite       | Deployed frontend and real test-system boundaries                   | Separate repository            |

## Select the Layer

- Use Vitest for components, containers, hooks, mappers, services, validation,
  and other module-owned contracts.
- Use Playwright for interacting components, visible states, and state
  transitions within one page or dialog when lower-level tests are inadequate.
  Portals, focus, browser APIs, and same-page URL state qualify only when
  material to that composed UI behavior.
- Exclude cross-page navigation and business journeys even with mocked APIs.
  Direct route entry is setup. A dialog may open from and update its host page;
  do not continue into another page or dialog workflow. Follow the
  [page/dialog boundary](../rules/testing-rules.md#pagedialog-boundary).
- Use the external E2E suite when the behavior under test includes the real API,
  database, email delivery, identity provider, or another deployed service.
- Do not duplicate lower-level component assertions in Playwright unless the
  browser composition itself changes the behavior.

## Component Tests

1. Render the public component through its barrel.
2. Use real owned child components and hooks.
3. Supply deterministic props and providers.
4. Interact through accessible labels and roles.
5. Assert visible outcomes and callback payloads.
6. Do not add module mocks.

Run a focused component test:

```bash
npm test -- --run src/<feature>/components/<name>/__tests__/<name>.test.tsx
```

## Container Tests

1. Render the container with its real presentational component.
2. Mock only external hooks, services, navigation, storage, or notifications
   required to isolate orchestration.
3. Cover success, pending, empty, and failure states owned by the container.
4. Assert user-visible outcomes and external-boundary calls.

Run a focused container test with the same Vitest command used for components.

## Page-Owned Tests and Stories

Private page parts and containers use the component/container test boundaries
above. Place their tests in `pages/<page>/__tests__/parts/`, hook tests in
`pages/<page>/hooks/__tests__/`, and helper tests in
`pages/<page>/__tests__/helper.test.ts`. Import private modules through explicit
implementation paths. Pure part stories mirror `parts/` under the page owner's
`__stories__/`; page entries and containers are exempt from required stories.
Keep page composition and state transitions in Playwright within one
page/dialog boundary.

## Browser Integration Tests

### Decide whether a case is warranted

Apply the admission, consolidation, assertion, and execution-cost requirements
in [Testing Rules](../rules/testing-rules.md#browser-integration) before writing
or retaining browser coverage in an audit.

1. Name the owning page/dialog, interacting components, and rendered state or
   transition that needs protection. Inspect the route, page/dialog, API
   contract, and existing lower-level tests; do not infer value from a title.
2. Find an existing case within that owner that can naturally include the
   check. Prefer extending lower-level coverage when page/dialog composition
   is not material. Reject cross-page cases before considering consolidation.
3. Add a separate browser case only when it passes the admission requirements.
   Record the regression, lower-level gap, and reason it cannot reasonably
   join an existing case for that owner in the change summary. Do not create a separate
   justification document or boilerplate comments for each assertion.
4. For an audit, account for every case in the requested scope, including
   expanded matrix variants. Give a reasoned keep/consolidate/move/remove
   disposition and identify the destination case, lower-level owner, or E2E
   coverage need. Call out routing coverage gaps that fit neither suite.
   Flag weak assertions even when the case should remain. Apply edits only
   within the user's requested scope.

### Build the page/dialog case

1. Extend the owning spec under
   `playwright/tests/<feature>/<user-outcome>.spec.ts`; create a file only when
   no appropriate owner exists.
2. Group naturally connected state transitions with `test.step`, such as
   submission, pending controls, and success; or submission, settled error,
   and retained input. Include dismissal/reopening only when their composed
   behavior is under test. Do not force failure, success, and reset sequences
   into one case to save setup.
3. Keep distinct outcomes or dependencies separate when they cannot share a
   coherent lifecycle. Do not combine unrelated work into a giant CRUD test.
4. Import `test` and `expect` from `@integration/fixtures/test`.
5. Register deterministic first-party API routes before navigation or the
   interaction that can issue them.
6. Use fixtures for prerequisites and navigate directly to the owner's public
   route. Open the dialog from its host page if applicable. Do not complete
   another page's workflow to reach the owner.
7. Use the real page, dialog, forms, providers, router, and portal behavior.
8. Interact through accessible roles, labels, and visible text.
9. Assert the owner's completed visible outcome. Assert relevant frontend
   requests only where they support that composed outcome.
   Make mocks distinguish query states, hold each relevant pending request,
   and exercise actual same-page history/focus/scrolling behavior where claimed.
   Stop at the owner's outcome; do not follow navigation to assert another
   page's state or continue a business journey.
10. Review each assertion against a plausible regression: could it still pass
    if submission did nothing, the error never settled, stale data remained,
    or the request used the wrong scope? Strengthen or remove ineffective
    checks before treating the case as coverage.

Do not call live first-party services. Integration mode points
`VITE_API_URL` at the local Vite origin so a missed intercept cannot reach a
developer, staging, or production API.

### Test support extraction

- Keep one-off locators and API responses in the owning spec.
- Add a feature mock when multiple scenarios or specs repeat material route
  registration or response data.
- Add a factory when multiple tests need deterministic variants of the same
  entity.
- Add a fixture when setup is reusable and belongs in the Playwright lifecycle.
- Add a page object only when a locator group or page/dialog interaction has
  more than one consumer. Keep its methods within that owner; do not encode
  cross-page journeys.
- Do not add a base page class or generic helper bucket.

### Locators and waiting

Prefer role, label, text, placeholder, alt text, and title locators. Use a test
ID only when no user-facing contract is stable. Use awaited web-first
assertions and Playwright auto-waiting. Do not use fixed sleeps.

Run browser integration tests:

```bash
npm run test:integration -- playwright/tests/<feature>/<name>.spec.ts --project=chromium
npm run test:integration
npm run test:integration:ui
npm run test:integration:debug
npm run typecheck:integration
npm run test:integration:report
```

### Code coverage

Generate Chromium runtime coverage for application modules exercised by the
page/dialog integration cases:

```bash
npm run test:integration:coverage
```

Open `coverage/playwright/index.html` for the navigable source report. The same
run writes `coverage/playwright/lcov.info`,
`coverage/playwright/coverage-final.json`, and a terminal summary.

Coverage collection is opt-in and does not run during the normal integration
command. It includes Vite-served modules under `src/` that were loaded during
the tested cases. Keep this report separate from Vitest coverage because the
two suites exercise different boundaries.

## CI Requirements

The CI environment must run:

```bash
npm ci
npm run typecheck:integration
npm run test:integration
```

CI uses the Google Chrome installation provided by the GitHub-hosted runner.
Configure the Playwright Chromium project with `channel: 'chrome'` in CI rather
than installing a separate Playwright browser and operating-system dependencies
for every workflow run. Local integration tests continue to use Playwright's
bundled Chromium.

Publish `playwright-report/` and `test-results/` when the integration job fails
so traces and failure artifacts remain available. If CI is owned outside this
repository, record these exact requirements with the owning pipeline.

## Final Verification

Match local verification to the change; the commands below are available
checks, not a requirement to run every command for every task.

- For guidance-only edits, review consistency and validate the changed
  Markdown/skill files. Do not start the browser suite or build the app.
- For test changes, run integration typechecking and the affected specs. Use
  focused scenario/spec runs and an affected group where needed to verify
  independence and expose ordering assumptions; avoid automatically running
  every case twice. Run relevant lower-level tests when relying on them to
  replace removed browser coverage.
- Broaden to the full suite when shared fixtures, routing, configuration, or
  unresolved failures create wider risk. Rerun after relevant edits or to
  investigate failures; stop repeating successful checks without new evidence.
  Preserve the required CI checks above.
- Keep files stable during browser runs to avoid development-server reloads
  contaminating results. Inspect failure diagnostics before changing or
  weakening an assertion.
- Report what ran, failures and their resolution, and what remains unverified.
  For consolidation, report the coverage retained and removed duplication.
  Distinguish a measured duration change from a reduction in case count;
  performance comparisons need comparable runner conditions and retry counts.

Run applicable checks:

```bash
npm test -- --run
npm run typecheck:integration
npm run test:integration
npm run check:structure
npm run check-stories
npm run lint
npm run build
```

When test inventory or runner configuration changes, verify discovery with
`npx playwright test --list`: Playwright should list only
`playwright/**/*.spec.ts`, and Vitest should not discover those specs. Report
checks that cannot run because the required browser binary or environment
capability is unavailable.

## Dialog-Owned Support

Apply the page-owned support layout to `dialogs/<dialog>/`: private UI tests
under `__tests__/parts/`, hook tests under `hooks/__tests__/`, and helper tests
under `__tests__/helper.test.ts`. Test dialog composition and state transitions
through Playwright within the page/dialog boundary.
