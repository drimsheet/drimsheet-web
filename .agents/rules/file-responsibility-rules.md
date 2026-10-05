# File Responsibility Rules

## Goal

Make each file easy to understand, safe to change, and obvious for an AI agent to place correctly.

## `*.tsx` Component Files

- Pure component files must contain presentation logic only.
- Pure component files must not fetch data, read local storage, trigger navigation, or mutate global state.
- Pure component files may accept props, render UI, and emit callbacks.
- Keep trivial render helpers inline, but move coherent UI sections with their
  own props, hooks, handlers, or meaningful conditional rendering into the
  owner's `parts/` directory.
- Give a callback a `handle*` name when its body contains branching, lookup,
  transformation, or multiple statements. A short single-expression adapter
  may remain inline.
- Do not use nested ternaries. Prefer guard clauses, `if`/`else`, nullish
  coalescing when it preserves semantics, or a named resolver.
- Render simple conditional UI directly in JSX with `&&` and named boolean
  predicates when useful. Do not assign JSX to a mutable `let` variable through
  `if`/`else` merely to insert that variable into the returned markup.
- Keep loading and content conditions mutually exclusive, and retain TypeScript
  narrowing with a local immutable value when a predicate checks optional data.
  For complex render branches, use guard returns or a focused presentation part.

## Statement Spacing

- Separate logical groups with one blank line: hooks, derived values, handlers,
  guard clauses, and returned UI. Keep related simple declarations together.
- Put a blank line around multiline declarations and function declarations, and
  after block-like statements or `if` guard clauses when another statement
  follows in the same block.
- Put a blank line before a return that follows another statement in the same
  block. Do not add padding at the start or end of a block.
- Run ESLint fixes before Prettier. ESLint enforces statement separation;
  Prettier handles indentation, wrapping, and ordinary whitespace.
- When asked to format staged changes, apply fixes only to staged files and
  preserve unstaged work. Do not run a codebase-wide formatting command.

## `parts/`

- Use `parts/` only for UI subcomponents owned by and private to one component
  or page/dialog directory.
- Keep each part focused on one recognizable section of the owning UI.
- Do not use `parts/` as a general bucket for hooks, services, utilities, or
  reusable components.
- Do not add a `parts/index.ts` barrel or expose parts through the owner's public
  API.
- Promote a part when it gains a consumer outside its owner.
- Keep part tests and stories out of `parts/`; mirror them under the component
  or page/dialog owner's `__tests__/parts/` and `__stories__/parts/` directories.

## Component `helper.ts`

- Use one root-level `helper.ts` for deterministic non-UI logic
  owned exclusively by that component.
- Extract initial-value factories, value normalizers, serializers, error
  projections, and reusable predicates from the primary UI `.tsx` file.
- Keep each helper function local to the module, collect the functions in a
  frozen `<componentName>Helpers` object, and expose only that default object.
- Use concise operation names on the helper object, such as
  `inflowFormHelpers.createInitialValues`, because the owning component is
  already explicit in the object name and file path.
- Add one matching `__tests__/helper.test.ts` that imports the default object
  and tests each method's deterministic contract directly.
- Do not create a component `helpers/` directory, operation-named helper
  modules, named helper exports, a helper barrel, or a public `index.ts`
  re-export.
- Promote logic to the feature or shared `lib/` responsibility directory when
  it gains a consumer outside the component directory.
- Do not use the component helper module as a bucket for UI parts, hooks,
  services, validation, or reusable feature logic.

## `*.container.tsx` Files

- Use container files when the UI needs side effects or orchestration.
- Containers may connect hooks, services, dialogs, loaders, and page-level state to a pure component.
- Containers should keep business logic thin and delegate reusable logic to hooks or `lib/`.

## Component `skeleton.tsx`

- Use `skeleton.tsx` for a single loading skeleton owned by one component
  directory; the owner is already clear from the path.
- Keep the exported React symbol descriptive, such as
  `CashTransferFormSkeleton`, so imports remain self-explanatory.
- Name dedicated support artifacts `__tests__/skeleton.test.tsx` and
  `__stories__/skeleton.stories.tsx`.
- When one owner genuinely needs multiple loading skeletons, distinguish them
  by UI role, such as `table-skeleton.tsx`, instead of repeating the owner name.

## `*.stories.tsx` Files

- Put stories under the owning component's `__stories__/` directory. Mirror a
  private part's path under `__stories__/parts/`.
- Stories must document the component in realistic states.
- Stories should focus on visual variants and interaction states.
- Stories should not hide required props behind complex setup unless that setup is part of the story’s purpose.

## `*.test.tsx` Files

- Put tests under `__tests__/` in the narrowest production owner. Mirror a
  private part's path under a component owner's `__tests__/parts/`.
- Test pure components, containers, hooks, and validation logic when behavior matters.
- Keep tests focused on one behavior or one user outcome per test.
- Tests should verify the contract of the file, not implementation details.

## `types.ts`

- Put public component or feature types here. Do not declare or re-export public
  types from component, container, page, or dialog implementation files.
- Keep types small, explicit, and local to the owning folder.

## `validation.ts`

- Put field and form validation logic here.
- Keep validation code deterministic and side-effect free.
- Share validation only when multiple components need the exact same rules.

## `index.ts`

- Export only the folder’s public API.
- Barrel files should re-export the component, types, and validation entry points that are meant for consumption.
- Re-export public types directly from `./types` with `export type`; do not
  forward them through an implementation file.
- Do not export private components from `parts/`.
- Avoid exporting internal helpers from the barrel.

## `lib/`

- Use `lib/` as a container for reusable non-UI logic.
- Put generated API clients and their transport configuration in `lib/api/`.
- Put static configuration data in `lib/configs/`.
- Put deterministic data transformations in `lib/mappers/`.
- Put reusable business operations and side-effect boundaries in
  `lib/services/`.
- Put cross-file contracts owned by the feature or shared layer in
  `lib/types/`.
- Put small, deterministic, general-purpose functions in `lib/utils/`.
- Do not place implementation files directly in `lib/`.
- Avoid a generic feature or shared `helpers/` directory; classify reusable
  logic precisely. The root-level component `helper.ts` module is the scoped
  exception described above.
- `lib/` should contain reusable logic that is not tied to a single UI component.
- Keep `lib/` free of page-specific orchestration.

## `hooks/`

- Put reusable UI and API hooks here.
- Hooks may coordinate state and side effects, but they should still remain reusable within the feature or shared scope.

## `pages/`

- Each page lives in `pages/<page>/<page>.page.tsx` and orchestrates feature
  pieces and page composition. Its `index.ts` exports only the page component.
- Private UI belongs in `parts/`; effects belong in the page entry, private
  `.container.tsx` parts, or page-owned hooks under `hooks/`.
- Page helpers follow the component `helper.ts` contract: one root module,
  one frozen `<pageName>Helpers` default object, and a matching
  `__tests__/helper.test.ts`.
- Keep page types in `types.ts` when shared by files in that owner. Private
  modules must not be exported through the page API.
- Presentation parts require mirrored stories; entries and containers do not.
- Pages should not contain reusable business logic that belongs in `lib/` or hooks.

## `dialogs/`

- Each dialog lives in `dialogs/<dialog>/<dialog>.dialog.tsx` and orchestrates
  feature pieces and dialog composition. Its `index.ts` exports the dialog
  component and optional public props types.
- Private UI belongs in `parts/`; effects belong in the dialog entry, private
  `.container.tsx` parts, or dialog-owned hooks under `hooks/`.
- Dialog helpers follow the component `helper.ts` contract: one root module,
  one frozen `<dialogName>Helpers` default object, and a matching
  `__tests__/helper.test.ts`.
- Keep dialog types in `types.ts` when shared by files in that owner. Private
  modules must not be exported through the dialog API.
- Presentation parts require mirrored stories; entries and containers do not.
- Dialogs should not contain reusable business logic that belongs in `lib/` or hooks.

## `routes/`

- Route files should only map paths to pages.
- Routes should not contain UI implementation details.

## Documentation

- Use `__docs__/` for feature decisions, workflows, usage notes, and diagrams.
- Keep documentation close to the feature it describes.
