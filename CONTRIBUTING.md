# Contributing to Drimsheet Web

This document provides guidelines for contributing to the web frontend project to ensure a smooth workflow and high-quality code.

## Table of Contents

- [Contributing to Drimsheet Web](#contributing-to-drimsheet-web)
  - [Table of Contents](#table-of-contents)
  - [Design Pattern](#design-pattern)
    - [Domain-Driven Features Structure](#domain-driven-features-structure)
  - [Design Principles](#design-principles)
  - [Working with Money](#working-with-money)
  - [Git Workflow](#git-workflow)
    - [Branching Strategy](#branching-strategy)
    - [Feature Branches](#feature-branches)
    - [Commit Messages \& Pull Requests](#commit-messages--pull-requests)
  - [Testing](#testing)
  - [Shadcn UI \& Component Normalization](#shadcn-ui--component-normalization)
  - [Storybook Documentation](#storybook-documentation)
  - [Reporting Bugs](#reporting-bugs)

## Design Pattern

### Domain-Driven Features Structure

We use a feature-first, domain-driven architecture to keep related code cohesive and easy to reason about. Each feature owns its UI, hooks, routing, and feature-specific business logic, while `src/shared/` holds reusable code that is not owned by one domain.

The agent rules in [`.agents/rules/folder-structure.md`](./.agents/rules/folder-structure.md), [`.agents/rules/dependency-rules.md`](./.agents/rules/dependency-rules.md), [`.agents/rules/file-responsibility-rules.md`](./.agents/rules/file-responsibility-rules.md), and [`.agents/rules/i18n-rules.md`](./.agents/rules/i18n-rules.md) are the source of truth for layout, import boundaries, and translations.

Here is the target structure under `src/`:

```text
src/
├─ _app/                     # App bootstrap, providers, root styles, and route wiring
├─ [feature]/
│  ├─ __docs__/              # Feature documentation, decisions, and diagrams
│  ├─ components/            # Pure presentation components
│  │  └─ [component]/
│  │     ├─ [component].tsx
│  │     ├─ [component].stories.tsx
│  │     ├─ [component].test.tsx
│  │     ├─ [component].container.tsx
│  │     ├─ [component].helper.ts
│  │     ├─ [component].helper.test.ts
│  │     ├─ types.ts
│  │     ├─ validation.ts
│  │     └─ index.ts
│  ├─ hooks/                 # Feature-scoped UI and API hooks
│  ├─ pages/                 # Page composition and orchestration
│  ├─ layouts/               # Feature-specific reusable layouts
│  ├─ dialogs/               # Dialog orchestration and side effects
│  ├─ lib/                   # Services, mappers, helpers, utilities, adapters
│  └─ routes/                # Route definitions that render pages only
│
└─ shared/
   ├─ assets/                # Reusable static assets (images, icons, vectors)
   ├─ components/            # Reusable design-system and UI building blocks
   │  ├─ icons/
   │  └─ [component]/
   ├─ hooks/                 # Reusable hooks shared across features
   ├─ i18n/                  # Shared translation/localization files
   ├─ layouts/               # Reusable layout primitives (optional, when concern exists)
   ├─ lib/                   # Shared services, helpers, mappers, and utilities
   └─ configs/               # Shared configuration data
```

## Design Principles

- Keep components pure unless they explicitly need side effects.
- Put orchestration in pages, dialogs, or containers, not in reusable UI components.
- Keep business logic in hooks or `lib/`, not in presentation files.
- Prefer feature-local code first, then promote to `shared/` only when reuse is real and stable.
- Keep route files thin: routes should map URLs to pages and nothing more.

## Working with Money

- **Always use minor units**: Never use fractional values for money internally. Keep calculations strictly in minor units, matching the backend entity constraints.
- Format for display only at the final presentation layer using the designated shared formatting utilities.

## Git Workflow

To maintain a clean and organized codebase, please follow these strict git workflow guidelines.

### Branching Strategy

- **`development`**: This is the main branch for development. All contributor Pull Requests (PRs) should be merged into `development`.
- **`main`**: This is the prerelease branch. Prerelease Pull Requests merge `development` into `main`, which deploys to staging for integration testing.
- **`release`**: This is the production branch. After this repository's prerelease succeeds, the approved `main` changes are promoted to `release`, which deploys to production independently from Core.

### Feature Branches

- **Source**: Every new branch must be created off the `development` branch.
- **Target**: Every update must be submitted as a PR to the `development` branch.
- **Prerelease**: Open a PR from `development` to `main` after the contributor changes are ready for staging.
- **Release**: After the prerelease succeeds, promote the approved `main` changes to `release` through a PR.
- **Naming Convention**:
  - Branches should be named using the format: `<type>/<optional-issue-id>/<description-with-hyphens>`
  - **Types**: `feat`, `fix`, `chore`, `refactor`, `test`, `doc`
  - **Examples**:
    - `feat/49494/add-accounts-endpoint`
    - `fix/49494/login-error`

### Commit Messages & Pull Requests

We enforce a specific commit message format to generate clean changelogs and track history effectively.

- **Format**:
  ```text
  <type>(<domain | ticket-id> ): <short lower case description>
  ```
- **Rules**:
  - Pull request titles should also have the commit message structure.
  - PRs must be squashed and merged.
- **Examples**:
  - `feat(accounts): add view to present account list 3442`
  - `test(auth): improves smoke test`

## Testing

Our project follows these guidelines for testing:

- **Test Proximity**: Test files must be co-located near their test subjects (e.g., inside the component directory `src/<feature>/components/[component]/[component].test.tsx`). Hook and utility tests can also be placed in localized `__tests__/` subdirectories (e.g., `src/shared/hooks/__tests__/`).
- **Component and Module Tests (`.test.tsx` / `.test.ts`)**: Vitest is used for components, containers, hooks, mappers, validation, and other module-owned contracts inside `src/`. Do not use `.spec.tsx` or `.spec.ts` inside `src/`.
- **Browser Integration Tests (`.spec.ts`)**: Playwright specs live under `playwright/tests/<feature>/`. They exercise the running frontend with controlled first-party API responses and must not require live services or credentials.
- **System End-to-End Tests**: Complete journeys across the deployed frontend, API, database, email, and other test-system boundaries live in the separate E2E repository.

Install the Chromium browser once after installing dependencies:

```bash
npx playwright install chromium
```

Run browser integration tests:

```bash
npm run typecheck:integration
npm run test:integration
npm run test:integration:ui
npm run test:integration:coverage
```

Playwright coverage is written to `coverage/playwright/` and reports Chromium
runtime coverage for application modules loaded by the integration journeys.
Keep it separate from Vitest coverage.

See [`.agents/workflow/testing.md`](./.agents/workflow/testing.md) for test
selection, placement, focused commands, and CI requirements.

## Shadcn UI & Component Normalization

We use Shadcn UI for component generation, but we require strict normalization of the generated code to preserve the repository architecture:

- **Shadcn as Source**: Treat generated shadcn code as application-owned source code. Do not keep them flat under `src/shared/components` or under landing buckets like `src/shared/components/ui`.
- **Normalization**: Move every generated component to its own directory under `src/shared/components/[component]/` (or feature-specific directories if only one feature consumes it). Ensure there is an `index.ts` public entry point.
- **Rules File**: The detailed guidelines are in [`.agents/rules/shadcn-rules.md`](./.agents/rules/shadcn-rules.md).
- **Validation**: Before committing, run `npm run check-structure` to ensure all imports and folder layouts comply with structure rules.

## Storybook Documentation

To ensure high-quality presentation components, we require Storybook documentation for all UI components:

- **Stories File**: Every UI component must have a co-located `.stories.tsx` file documenting the component in realistic states (except for components inside `icons/`, which share `icons.stories.tsx`).
- **Enforcement**: This rule is strictly enforced at the pre-push level via a husky hook that runs `yarn check-stories`.

## Reporting Bugs

If you find a bug, please create a ticket for it on our [GitHub Issues page](https://github.com/Drimsheet/drimsheet-web/issues).
Before opening a new issue, please search existing issues to see if it has already been reported.

- **Requirement**: Every bug report must have a corresponding ticket.
- **Format**: The ticket must clearly specify:
  1.  **Expected Behaviour**: What should happen.
  2.  **Current Behaviour**: What is actually happening.
