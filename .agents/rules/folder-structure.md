# Folder Structure Rules

## Goal

Keep the codebase feature-first, predictable, and easy for an AI agent to extend without introducing layout drift.

## Required Top-Level Shape

- `src/` contains all application source code.
- `src/_app/` contains app bootstrap, providers, global styles, and root route wiring.
- `src/<feature>/` contains one major business domain or product feature, such as `auth`, `accounting`, or `ledger-accounts`.
- `src/shared/` contains reusable code that is not owned by a single feature.
- `playwright/` contains frontend-owned browser integration tests and their
  test-only support code.

## Playwright Integration Layout

Organize browser integration specs by product feature:

```text
playwright/
  tests/
    <feature>/
      <user-outcome>.spec.ts
  fixtures/
  mocks/
  factories/
  pages/
  reporters/
```

- `tests/` contains executable `*.spec.ts` files grouped by feature.
- `fixtures/` contains reusable Playwright fixture extensions.
- `mocks/` contains feature-specific network route registration and
  representative API responses.
- `factories/` contains deterministic test-data builders.
- `pages/` contains repeated locator groups or user workflows.
- `reporters/` contains Playwright reporter integrations such as coverage
  aggregation.
- Create a support directory only when it has a real consumer.
- Keep simple locators and one-off API responses in the owning spec.
- Do not create generic `helpers/` or `utils/` buckets.
- Keep Playwright reports, results, traces, screenshots, cache, and
  authentication state out of version control.

## Feature Folder Layout

Each feature should follow this structure when the concern exists:

```text
src/<feature>/
  __docs__/
  components/
  hooks/
  pages/
  layouts/
  dialogs/
  lib/
    configs/
    mappers/
    services/
    types/
    utils/
  routes/
```

- `__docs__/` contains feature-specific documentation, decisions, examples, and diagrams.
- `components/` contains pure presentation components with no external side effects.
- `hooks/` contains feature-scoped hooks for UI behavior, data access, and API integration.
- `pages/` contains named page owners for composition, orchestration, and private support files.
- `layouts/` contains reusable layout wrappers for that feature.
- `dialogs/` contains dialog orchestrators and dialog-specific composition.
- `lib/` is the container for reusable feature logic. Group files into
  responsibility-based subdirectories such as `configs/`, `mappers/`,
  `services/`, `types/`, and `utils/` when those concerns exist.
- Do not place implementation files directly in `lib/`.
- Do not create empty responsibility directories or a feature-level generic
  `helpers/` directory; use the narrowest descriptive responsibility.
- `routes/` contains route definitions that render pages only.

## Page Folder Layout

Every application page lives in `pages/<page>/<page>.page.tsx`. Its directory
owns all UI and logic consumed exclusively by that page:

```text
pages/<page>/
  <page>.page.tsx
  index.ts
  parts/
    <part>.tsx
    <part>.container.tsx
  hooks/
    use-<behavior>.ts
    __tests__/
      use-<behavior>.test.ts
  helper.ts
  types.ts
  __tests__/
    helper.test.ts
    parts/
      <part>.container.test.tsx
  __stories__/
    parts/
      <part>.stories.tsx
```

- Export only the page component through `index.ts`, using an explicit named
  re-export from `./<page>.page`. Consumers import the page directory.
- Keep private UI in `parts/`, including error views, skeletons, and containers.
  Use `skeleton.tsx` for one page-owned skeleton, with a descriptive React name.
  Skeletons owned by reusable components stay with those components.
- Pure parts remain presentation-only; `.container.tsx` parts may orchestrate
  hooks, services, navigation, dialogs, and errors with page permissions.
- Page-only hooks belong in `hooks/`; deterministic non-UI helpers belong in one
  root `helper.ts`, following the component helper contract below with a frozen
  `<pageName>Helpers` default object (for example, `accountDashboardHelpers`).
  Types belong in `types.ts` when shared within the owner.
- Mirror part tests and stories under `__tests__/parts/` and `__stories__/parts/`.
  Hook tests belong in `hooks/__tests__/`; helper tests in `__tests__/helper.test.ts`.
- Pure UI parts require stories. Page entries and containers are exempt.
  Test complete page journeys with Playwright, and private modules with Vitest.
- Only files within the page owner may import its private implementations. Do
  not create private barrels or export private support files from the page API.
- Promote UI to feature `components/` and logic to feature `hooks/` or `lib/`
  when another owner needs it. Create support files and directories only as needed.

## Dialog Folder Layout

Every application dialog lives in `dialogs/<dialog>/<dialog>.dialog.tsx`.
Its directory owns all UI and logic consumed exclusively by that dialog:

```text
dialogs/<dialog>/
  <dialog>.dialog.tsx
  index.ts
  parts/
    <part>.tsx
    <part>.container.tsx
  hooks/
    use-<behavior>.ts
    __tests__/
      use-<behavior>.test.ts
  helper.ts
  types.ts
  __tests__/
    helper.test.ts
    parts/
      <part>.container.test.tsx
  __stories__/
    parts/
      <part>.stories.tsx
```

- Export the dialog component through `index.ts`, using an explicit named
  re-export from `./<dialog>.dialog`. Public dialog props may be re-exported
  with `export type` from the entry or `types.ts`; all other support code stays
  private. Consumers import the dialog directory.
- Keep private UI in `parts/`, including error views, skeletons, and containers.
  Use `skeleton.tsx` for one dialog-owned skeleton, with a descriptive React name.
  Skeletons owned by reusable components stay with those components.
- The `.dialog.tsx` entry may orchestrate effects directly and does not require
  a separate container. Pure parts remain presentation-only; `.container.tsx`
  parts may orchestrate hooks, services, navigation, dialogs, and errors with
  dialog permissions.
- Dialog-only hooks belong in `hooks/`; deterministic non-UI helpers belong in one
  root `helper.ts`, following the component helper contract below with a frozen
  `<dialogName>Helpers` default object (for example, `accountCreationHelpers`).
  Types belong in `types.ts` when shared within the owner.
- Mirror part tests and stories under `__tests__/parts/` and `__stories__/parts/`.
  Hook tests belong in `hooks/__tests__/`; helper tests in `__tests__/helper.test.ts`.
- Pure UI parts require stories. Dialog entries and containers are exempt.
  Test complete dialog journeys with Playwright, and private modules with Vitest.
- Only files within the dialog owner may import its private implementations. Do
  not create private barrels or export private support files from the dialog API.
- Promote UI to feature `components/` and logic to feature `hooks/` or `lib/`
  when another owner needs it. Create support files and directories only as needed.

## Component Folder Layout

Every public or independently reusable component must live in its own directory.
Private UI subcomponents may live in the owning component's optional `parts/`
directory.

```text
components/<name>/
  <ui>.tsx
  <ui>.container.tsx
  skeleton.tsx
  helper.ts
  parts/
    <part>.tsx
  __tests__/
    <ui>.test.tsx
    skeleton.test.tsx
    helper.test.ts
    parts/
      <part>.test.tsx
  __stories__/
    <ui>.stories.tsx
    skeleton.stories.tsx
    parts/
      <part>.stories.tsx
  types.ts
  validation.ts
  index.ts
```

- Use `<ui>.tsx` for the pure component.
- Put `<ui>.stories.tsx` in the owner's `__stories__/` directory for Storybook
  documentation.
- Put `<ui>.test.tsx` in the owner's `__tests__/` directory for Jest or Vitest
  UI tests.
- Use `<ui>.container.tsx` only when the component requires side effects or orchestration.
- Use `skeleton.tsx` for one owner-local loading skeleton. Keep its exported
  React symbol descriptive, such as `<ComponentName>Skeleton`, and use
  role-based filenames such as `table-skeleton.tsx` only when the owner has
  multiple distinct skeletons.
- Name dedicated skeleton support files `__tests__/skeleton.test.tsx` and
  `__stories__/skeleton.stories.tsx`.
- Use `parts/` only for substantial UI subcomponents consumed exclusively by
  the owning component directory.
- Mirror private part support files under `__tests__/parts/` and
  `__stories__/parts/`; keep production part files in `parts/` only.
- Use one optional root-level `helper.ts` for all deterministic non-UI
  helpers consumed exclusively by the owning component directory.
- Keep helper functions local, collect them in one frozen
  `<componentName>Helpers` object, and make that object the module's only
  default export. Use concise operation names for its members.
- Add one matching `__tests__/helper.test.ts` that imports the default object
  and tests each method's deterministic contract.
- Do not create a component `helpers/` directory or operation-named helper
  modules.
- Use `types.ts` for component-specific types.
- Use `validation.ts` for validation logic related to the component.
- Use `index.ts` as the public barrel for the component directory.
- Do not add a barrel to `parts/` or re-export parts from the owner's
  `index.ts`.
- Do not re-export component helpers from the owner's `index.ts`.
- Promote a part to its own component directory when another owner needs it.
- Do not add barrels to `__tests__/`, `__stories__/`, or `parts/`.
- Create a support directory only when it contains an artifact.

## Source Support Layout

Tests outside component owners belong in a `__tests__/` directory under the
narrowest production responsibility that owns them:

```text
hooks/
  <hook>.ts
  __tests__/
    <hook>.test.ts
layouts/
  <layout>.tsx
  __tests__/
    <layout>.test.tsx
lib/
  mappers/
    <mapper>.ts
    __tests__/
      <mapper>.test.ts
  services/
    <service>.ts
    __tests__/
      <service>.test.ts
```

- Apply the same convention to other responsibility directories such as
  `lib/api/`, `lib/configs/`, and `lib/utils/`.
- A named container directory owns its own `__tests__/` directory.
- Do not put production implementation files or barrels in support directories.
- Do not move Playwright specs into `src/`; they retain their dedicated layout.

## Shared Folder Layout

Shared code should stay generic and reusable.

```text
src/shared/
  assets/
  components/
  hooks/
  i18n/
  layouts/
  lib/
    api/
    configs/
    mappers/
    services/
    types/
    utils/
  configs/
```

- `components/` contains reusable presentational building blocks.
- `hooks/` contains reusable hooks shared across multiple features.
- `layouts/` contains reusable layout primitives.
- `lib/` is the container for shared non-UI logic, grouped into descriptive
  responsibility directories such as `api/`, `configs/`, `mappers/`,
  `services/`, `types/`, and `utils/`.
- `configs/` contains shared configuration data such as currencies, country lists, and fiscal-year settings.
- `assets/` contains reusable static assets consumed by multiple independent owners.
- `i18n/` contains only genuinely shared locale resources. Feature locale resources belong in the owning feature, and i18n composition/initialization belongs in `_app/`.
- Component-specific support files, including hooks, contexts, types, variants, validation, helpers, stories, and tests, belong in the narrowest component directory that owns all of their consumers.

## Shared Component Layout

Shared components also live in dedicated directories.

```text
components/<name>/
  <ui>.tsx
  skeleton.tsx
  helper.ts
  parts/
    <part>.tsx
  __tests__/
    <ui>.test.tsx
    skeleton.test.tsx
    helper.test.ts
    parts/
      <part>.test.tsx
  __stories__/
    <ui>.stories.tsx
    skeleton.stories.tsx
    parts/
      <part>.stories.tsx
  types.ts
  index.ts
```

- `icons/` is a shared exception for icon components.
- `__stories__/icons.stories.tsx` documents the full icon set.
- Shared component parts remain private to their owning shared component and
  must not import feature code.

## Naming Rules

- Use feature names that match the business domain.
- Use directory names that are stable and descriptive.
- Keep file names consistent with the exported component or hook name.
- Prefer one responsibility per file and one public entry point per folder.
- Use `<page>.page.tsx` for page entries to distinguish them from page support files. Use `<dialog>.dialog.tsx` for dialog entries. Do not add `.route.tsx` suffixes in `routes/`. Keep role suffixes for cohabiting files such as `.container.tsx`, `.stories.tsx`, and `.test.tsx`.
