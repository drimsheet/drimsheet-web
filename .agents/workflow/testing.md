# Testing Workflow

## Goal

Choose the runner and isolation boundary from the behavior under test.

## Test Matrix

| Layer                    | Runner                   | Boundary                                          | Location                       |
| ------------------------ | ------------------------ | ------------------------------------------------- | ------------------------------ |
| Component                | Vitest + Testing Library | Real owned component tree                         | Owner `__tests__/*.test.tsx`   |
| Component container      | Vitest + Testing Library | Real presentation with external boundaries mocked | Owner `__tests__/*.test.tsx`   |
| Hook, mapper, validation | Vitest                   | Deterministic module contract                     | Owner `__tests__/*.test.ts(x)` |
| Browser integration      | Playwright               | Running frontend with controlled first-party APIs | `playwright/tests/<feature>/`  |
| System end-to-end        | External E2E suite       | Deployed frontend and real test-system boundaries | Separate repository            |

## Select the Layer

- Use Vitest for components, containers, hooks, mappers, services, validation,
  and other module-owned contracts.
- Use Playwright in this repository when browser composition, routing, portals,
  focus, navigation, or browser APIs are material to the outcome.
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
Keep complete page and route journeys in Playwright.

## Browser Integration Tests

1. Identify one frontend-owned user outcome.
2. Inspect the public route, page or dialog composition, generated API
   contracts, and nearby lower-level coverage.
3. Place the spec at
   `playwright/tests/<feature>/<user-outcome>.spec.ts`.
4. Import `test` and `expect` from `@integration/fixtures/test`.
5. Register deterministic first-party API routes before navigation or the
   interaction that can issue them.
6. Navigate through the public application route.
7. Use the real page, dialog, forms, providers, router, and portal behavior.
8. Interact through accessible roles, labels, and visible text.
9. Assert visible state, URL, focus, browser behavior, and request payloads
   where they are part of the frontend contract.
10. Run each scenario independently and together to detect shared-state or
    ordering assumptions.

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
- Add a page object only when a locator group or workflow has more than one
  consumer.
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
browser journeys:

```bash
npm run test:integration:coverage
```

Open `coverage/playwright/index.html` for the navigable source report. The same
run writes `coverage/playwright/lcov.info`,
`coverage/playwright/coverage-final.json`, and a terminal summary.

Coverage collection is opt-in and does not run during the normal integration
command. It includes Vite-served modules under `src/` that were loaded during
the tested journeys. Keep this report separate from Vitest coverage because the
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

Run focused tests first, then the applicable broader checks:

```bash
npm test -- --run
npm run typecheck:integration
npm run test:integration
npm run check:structure
npm run check-stories
npm run lint
npm run build
```

Verify runner separation with `npx playwright test --list`: Playwright should
list only `playwright/**/*.spec.ts`, and Vitest should not discover those
specs. Report checks that cannot run because the required browser binary or
environment capability is unavailable.

## Dialog-Owned Support

Apply the page-owned support layout to `dialogs/<dialog>/`: private UI tests
under `__tests__/parts/`, hook tests under `hooks/__tests__/`, and helper tests
under `__tests__/helper.test.ts`. Test dialog entries through Playwright.
