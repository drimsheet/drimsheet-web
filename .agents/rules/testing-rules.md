# Testing Rules

## Goal

Test each ownership layer at the boundary it is responsible for.

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

- Test dialogs, pages, and frontend route behavior with Playwright integration
  tests.
- Exercise the running application, real composed components, browser portals,
  focus behavior, navigation, and user interaction.
- Control first-party API outcomes with Playwright network interception.
- Register network interception before navigation or the interaction that can
  issue the request.
- Cover loading, success, failure, retained input, dismissal, and reopening
  behavior when relevant.
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
