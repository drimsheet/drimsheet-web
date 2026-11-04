# Dependency Rules

## Goal

Make imports predictable so the agent can change one part of the app without causing accidental coupling.

## Capability Ownership

- A feature owns a business capability, not every workflow that consumes it.
  Other features may reuse its public APIs under the responsibility rules below;
  individual feature or page allowlists are not required.
- The consumer owns composition: inputs, workflow-specific queries and data
  selection, presentation adapters, continuation, and navigation callbacks.
- The provider owns its domain operations, reusable query definitions, data
  access, transport, and internal presentation and states. Compose these
  capabilities without duplicating their implementation in the consumer.
- A reusable capability must not depend on its consumers' workflow-specific
  types, mappers, helpers, or translations. Keep those adaptations with the
  consumer and pass inputs through the provider's contract.
- Dependencies between modules must remain acyclic, including type-only imports
  and re-exports. Different capabilities in two features may depend in opposite
  directions only when neither acquires a dependency on its own consumer.

## Import Permissions by Responsibility

These permissions apply within a feature and across features. All imports must
also respect public entry points, private ownership, and side-effect placement.
Feature code may consume shared code; shared code must remain feature-agnostic.

| Importing responsibility                          | Allowed dependencies                                                                                                                                                                                      |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/_app/`                                       | Public feature and shared APIs for bootstrap, providers, layouts, and root route wiring.                                                                                                                  |
| Pages and dialogs                                 | Public components, containers, layouts, dialogs, hooks, and reusable `lib/` APIs for composition and orchestration.                                                                                       |
| Reusable component containers (`*.container.tsx`) | Public presentation APIs, dialogs, hooks, and reusable `lib/` APIs needed to fulfill the container's capability.                                                                                          |
| Pure components, presentation parts, and layouts  | Public presentation components/layouts, presentation-only hooks, public types, and deterministic config, mappers, validation, and utilities. No services, effectful hooks, containers, dialogs, or pages. |
| Feature hooks                                     | Public hooks, services, and reusable non-UI contracts and logic. No components, layouts, dialogs, or pages.                                                                                               |
| Feature services                                  | Public services, reusable non-UI contracts and logic, and their own transport boundary (including shared API infrastructure). No UI modules or hooks.                                                     |
| Deterministic `lib/` modules                      | Public types and deterministic non-UI logic/config. No UI modules, hooks, services, or transport.                                                                                                         |
| Feature routes                                    | Public page entry points only, plus routing-library imports needed to declare routes.                                                                                                                     |
| `src/shared/`                                     | Shared modules and external dependencies appropriate to the importing responsibility; no feature or `_app` imports.                                                                                       |

- Feature code must not import from `src/_app/`.
- A hook used by a pure view must itself be presentation-only: it may coordinate
  local rendering or interaction state, but must not perform external side
  effects or introduce data access through another hook.
- Containers own reusable orchestration for their capability. Workflow-specific
  orchestration belongs in the consuming page/dialog or its private containers
  and hooks; do not expose it as a reusable component container.
- Private support files inherit their owner's dependency scope, not permission
  to change responsibility. A pure page/dialog part or helper remains pure even
  though its owner may orchestrate side effects.

## Public Capability Entry Points

- Consume components, layouts with directory APIs, dialogs, and pages through
  their public `index.ts`. Public UI contracts and existing skeleton/error/state
  exports belong to that API. Do not deep-import UI implementations, containers,
  `types.ts`, or `state.tsx` from outside their owner.
- Reusable feature hooks and `lib/` modules may expose their contracts through
  explicit module paths, such as `hooks/use-<capability>` or
  `lib/services/<capability>.service`. These paths do not require new barrels or
  a feature-wide `index.ts`.
- An exported symbol is not automatically a public capability. Page/dialog
  support files, component parts/helpers, and other owner-private modules stay
  private regardless of their exports or import alias.
- Cross-feature data access uses the owning feature's public hooks or services.
  Generated clients and transport configuration remain behind the owning service
  boundary; generated DTOs may be consumed as type-only contracts.
- Do not widen a barrel just to bypass privacy. When another owner needs private
  code, extract a reusable component, hook, or `lib/` module in its owning feature
  with a consumer-independent contract.

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
  including parts, hooks, helpers, and internal types. Public dialog props live
  in `types.ts` and are exported directly from there with `export type` through
  the barrel. Other owners import the dialog through its public `index.ts`; do
  not import its implementation file directly.
- Pure feature components must not import dialogs. Orchestration containers may
  compose public dialog APIs under the responsibility rules above, but must
  never import private dialog modules.
- Import private parts and owner types explicitly and relatively from production
  files; support files may use explicit aliased implementation paths.
- Do not add barrels inside private dialog directories or re-export private files
  from the dialog barrel. Promote support code when another owner needs it.

## Dependency Boundaries

- Shared code must stay feature-agnostic.
- Feature code may depend on shared code, but not the other way around.
- A component's `parts/` files share the dependency permissions of their owner
  subject to their own responsibility, and may be imported only from within that
  owning component directory.
- A component's root-level `helper.ts` shares the dependency
  scope of its owner, remains deterministic, and may be imported only from
  within that owning component directory.
- Import the component helper through its explicit sibling `./helper` path. Do
  not create a `helpers/` directory, add another helper module, or re-export the
  helper from the owner's public `index.ts`.
- A component's `__tests__/` and `__stories__/` files inherit the dependency
  permissions of that component owner. Other `__tests__/` files inherit the
  permissions of their nearest production responsibility directory.
- Support directories are organizational boundaries, not public APIs. Within
  the owning directory, import private helpers or parts through explicit
  implementation paths without adding public exports for them.
- UI components must not reach into infrastructure concerns directly.
- Pages and dialogs may orchestrate side effects, but they should not own reusable business logic.
- Route files must remain thin and only wire URLs to pages.

## Side-Effect Placement

- Network transport belongs in the owning services. Hooks, pages, dialogs, and
  containers may coordinate data access through those services or public hooks,
  never through another feature's transport internals. Pure components must not
  perform network access.
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
