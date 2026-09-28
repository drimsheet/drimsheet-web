# Dependency Rules

## Goal

Make imports predictable so the agent can change one part of the app without causing accidental coupling.

## Import Direction

- `src/_app/` may import from any feature or shared module.
- `src/<feature>/pages/` may import from that feature’s `components/`, `hooks/`, `layouts/`, `dialogs/`, and `lib/`.
- `src/<feature>/dialogs/` may import from that feature’s `components/`, `hooks/`, `layouts/`, and `lib/`.
- `src/<feature>/components/` may import only from the same feature’s `lib/`, `types`, and shared code.
- `src/<feature>/hooks/` may import from the same feature’s `lib/` and shared code.
- `src/<feature>/routes/` may import pages only.
- `src/shared/` must not import from any feature folder.

### Counterparty detail composition exception

`src/counterparty/pages/counterparty-details/counterparty-details.page.tsx` may import the public
`TransactionsTable` from `@/journal-entries/components/transactions-table`.
The page supplies data and presentation props; it must not import the transaction
container or private helpers. This exception does not extend to feature hooks,
services, or components.

## Page Ownership Boundaries

- A page directory is an orchestration owner. Its parts, hooks, helpers, types,
  tests, and stories inherit page dependency permissions.
- Only files inside that page directory may import private implementations,
  including parts, hooks, helpers, and types. Other owners import the page through
  its page-only `index.ts`; do not import its implementation file directly.
- Feature components must not import pages or their private modules.
- Import private parts and owner types explicitly and relatively from production
  files; support files may use explicit aliased implementation paths.
- Do not add barrels inside private page directories or re-export private files
  from the page barrel. Promote support code when another owner needs it.

## Dialog Ownership Boundaries

- A dialog directory is an orchestration owner. Its parts, hooks, helpers, types,
  tests, and stories inherit dialog dependency permissions.
- Only files inside that dialog directory may import private implementations,
  including parts, hooks, helpers, and internal types. Public dialog props may
  be exported with `export type` through the barrel. Other owners import the
  dialog through its public `index.ts`; do not import its implementation file directly.
- Pure feature components must not import dialogs. Existing orchestration
  containers may compose public dialog APIs but must never import private
  dialog modules. This does not grant new cross-feature import permissions.
- Import private parts and owner types explicitly and relatively from production
  files; support files may use explicit aliased implementation paths.
- Do not add barrels inside private dialog directories or re-export private files
  from the dialog barrel. Promote support code when another owner needs it.

## Dependency Boundaries

- Shared code must stay feature-agnostic.
- Feature code may depend on shared code, but not the other way around.
- A component's `parts/` files share the dependency permissions of their owner
  and may be imported only from within that owning component directory.
- A component's root-level `helper.ts` shares the dependency
  permissions of its owner and may be imported only from within that owning
  component directory.
- Import the component helper through its explicit sibling `./helper` path. Do
  not create a `helpers/` directory, add another helper module, or re-export the
  helper from the owner's public `index.ts`.
- A component's `__tests__/` and `__stories__/` files inherit the dependency
  permissions of that component owner. Other `__tests__/` files inherit the
  permissions of their nearest production responsibility directory.
- Support directories are organizational boundaries, not public APIs. Import
  public components through their directory alias and private helpers or parts
  through explicit implementation paths without adding exports for them.
- UI components must not reach into infrastructure concerns directly.
- Pages and dialogs may orchestrate side effects, but they should not own reusable business logic.
- Route files must remain thin and only wire URLs to pages.

## Side-Effect Placement

- Network access belongs in hooks or services, not in pure components.
- Local storage, analytics, timers, subscriptions, and DOM mutation belong outside pure components.
- Reusable data shaping and mapping belong in `lib/mappers/`. Deterministic
  value shaping owned by one component belongs in that component's root-level
  helper module.
- Validation logic belongs in `validation.ts` unless it is shared across multiple features.

## Shared Imports

- Prefer shared imports for reusable primitives, helpers, and config.
- Do not duplicate shared logic in feature folders.
- Do not move a feature-specific implementation into shared code just because it is useful once.

## Playwright Integration Imports

- Playwright specs and support code may import stable application contracts,
  including generated API types.
- Use type-only imports when the test needs only a source contract.
- Application code under `src/` must not import from `playwright/`.
- Do not duplicate production business logic in Playwright fixtures, mocks,
  factories, or page objects.
- Playwright support files may depend on other test support files with a
  narrower responsibility, but executable specs should remain the composition
  boundary.

## Barrel File Rules

- Use barrels only for public entry points.
- Do not create a barrel for a private `parts/` directory or re-export a private
  part from its owner.
- Do not create barrels for `__tests__/` or `__stories__/`.
- Do not re-export a private component helper module from its owner.
- Do not create circular dependencies through barrels.
- Keep import paths explicit when a barrel would hide important dependency direction.
