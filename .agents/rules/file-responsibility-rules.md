# File Responsibility Rules

## Goal

Make each file easy to understand, safe to change, and obvious for an AI agent to place correctly.

## Design Philosophy

- Organize by responsibility and domain, not by where code was first used.
  Moving files alone does not establish a reusable boundary.
- Compose capabilities rather than accumulating responsibilities. A caller
  decides how pieces fit together; each piece owns how it fulfills its role.
- Keep contextual decisions with the owner that understands them. Components
  should not assume their caller's layout, hierarchy, wording, or workflow;
  neither should callers manage a component's internal presentation and states.
- Design contracts around what a component actually needs. Expose meaningful
  choices, not implementation details or irrelevant requirements inherited
  from one consumer.
- Judge abstractions by whether they simplify their callers. More files,
  wrappers, props, or configurable labels are not inherently more modular.
  Share stable responsibilities without forcing different use cases together.
- Refactor incrementally and preserve observable behavior. Compare existing
  contracts before consolidating implementations; make behavior changes explicit.

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

## Loading UI

- Pending button actions MUST use the shared `Button`'s `loading` prop, or the
  equivalent prop forwarded by `AlertDialogAction` or `ConfirmationDialog`.
  Keep the translated action label stable. Do not manually insert a spinner,
  swap the label to "Saving…"/"Deleting…", or use `disabled` alone as the loading
  indicator. Preserve unrelated reasons to disable the action.
- Loading content MUST use the skeleton of the component being loaded. This
  includes forms, tables, sections, and controls awaiting options or eligibility
  checks. Do not render visible "Loading…"/"Checking…" paragraphs, placeholders,
  or descriptions in place of a component skeleton.
- Render skeletons only while the relevant request is loading. A disabled query
  awaiting user input must not hide the control needed to enable that query.
  Keep loading, loaded, empty, and error states distinct.
- Translated accessible names and screen-reader-only loading announcements are
  allowed alongside the loading UI. Preserve the existing profile preferences
  autosave feedback; it describes saving already-loaded content.
- ESLint's `local/prefer-loading-ui` rule rejects rendered progress copy and
  hand-inserted button spinners. It checks literal text, progress translation
  keys, local aliases/assignments, conditional labels, visible text props, and
  spinner imports or `animate-spin` children. It runs during lint, staged-file
  linting, pre-push, and CI; test/story fixtures are excluded.
- The autosave exception is restricted to the existing
  `profile_preferences_saving_text` translation rendered in an output by
  `ProfilePreferences` in `src/user/pages/profile/parts/profile-preferences.tsx`.
  It does not exempt other loading text or button spinners in that file.
  Screen-reader-only outputs, accessible names, the shared `FullPageLoader`'s
  screen-reader label, and the shared Button's internal spinner remain allowed.
- These static checks recognize progress wording and translation-key
  conventions; they cannot infer arbitrary runtime text or loading behavior
  across component boundaries. Keep reviewing loading states and component
  stories alongside the automated checks.

## Native Status Semantics

- Prefer native `<output>` for status messages, operation results, autosave
  feedback, and loading announcements when its HTML content model fits. Do not
  use a `div`, `span`, or `p` with `role="status"` when `<output>` serves the
  same purpose. `<output>` already has an implicit status role; do not add a
  redundant `role="status"` to it.
- Keep structural elements such as sections, cards, lists, definition lists,
  and form groups intact. For skeletons, put the translated announcement in an
  `<output className="sr-only">` within the appropriate container instead of
  assigning the status role to the whole layout. `<output>` accepts phrasing
  content; do not wrap block elements or entire skeleton layouts in it.
- Preserve translated accessible names, relevant `aria-busy` state, and
  existing announcement behavior. Avoid duplicate announcements. Apply
  display utilities such as `block` or `flex` when replacing a block element
  directly so the layout stays unchanged.
- Retain explicit `role="status"` only when native `<output>` is unsuitable,
  such as an SVG status indicator that must retain its SVG element contract.
  Do not use this exception for ordinary HTML message containers.
- ESLint's `local/prefer-native-status` rule enforces this for explicit status
  roles in JSX, including literal expressions and conditional branches. It
  also checks component wrappers such as `AppSection`, `Card`, and `Field`.
  Native `<svg>` elements and bindings imported from `lucide-react` are allowed.
  Other necessary SVG exceptions require a narrowly scoped ESLint disable
  comment explaining the element contract. The rule runs in `npm run lint`,
  staged-file linting, and CI; it does not automatically rewrite markup.

```tsx
// A visible operation result.
<output className="block text-sm">{save_status}</output>

// Inside a component-owned skeleton, alongside its visual placeholders.
<output className="sr-only" aria-label={loading_label}>
  {loading_label}
</output>
```

## Component Skeleton Ownership and Exports

- Every skeleton MUST represent a specific rendered component and mirror its
  layout, field/row structure, spacing, and responsive behavior. Compose it from
  the shared `Skeleton` primitive. Do not create generic page placeholders or
  scatter bare skeleton primitives through orchestration files.
- For a component with its own directory, put its skeleton in `skeleton.tsx`,
  name it `<ComponentName>Skeleton`, and explicitly export it from that
  component's `index.ts`. External consumers import the component barrel;
  files inside the owner may import `./skeleton` directly.
- For a component in `*/parts/*`, define and export `<PartName>Skeleton` in the
  SAME `.tsx` file as the component it represents. Do not create a separate
  `parts/skeleton.tsx` or `<part>-skeleton.tsx`. Owner-local consumers import the
  skeleton from that part file. Do not add a `parts/index.ts` or re-export the
  private part or its skeleton from the component, page, or dialog barrel.
- Pages, dialogs, and containers compose these component skeletons. Extract a
  real presentation component first if the content needing a skeleton does not
  yet have one; a page or dialog directory alone is not a skeleton owner.
- A component's dedicated skeleton support files use
  `__stories__/skeleton.stories.tsx` and, when tests are warranted,
  `__tests__/skeleton.test.tsx`. Document an inline part skeleton in the part's
  mirrored story and test meaningful loading transitions in its mirrored tests.
- Run `npm run check:skeletons` to enforce production skeleton ownership,
  naming, placement, named runtime exports, explicit component-barrel exports,
  private-part boundaries, and use of bare primitives only inside named
  skeleton definitions. Lint, both structure commands, pre-push, and CI run it
  automatically. The checker resolves local imports and re-exports, including
  aliases and namespaces; test/story fixtures and declaration files are excluded.
- The same checker enforces native screen-reader-only loading announcements
  within skeleton definitions and around composed skeletons. Use an explicit,
  static `className="sr-only"` on `<output>`, without prop spreads or
  visibility overrides. Keep the announcement accessible to screen readers;
  do not hide it with `hidden` or `aria-hidden`. Keep layout elements and visual
  placeholders outside the output; it contains announcement text and optional
  inline text markup.
  Do not put `role="status"` or `aria-live` on the skeleton layout. Decorative
  skeletons may rely on their parent's announcement to avoid duplicates. Visible
  feedback for loaded content, including profile preferences autosave, is exempt.
- Static checks cannot establish whether a skeleton visually matches its
  component or whether a loading condition is correct. Keep those checks in
  component stories, behavior tests, and UI review. Do not treat a passing
  ownership check as a substitute for those requirements.

```tsx
// components/bank-details-form/index.ts
export { BankDetailsForm } from './bank-details-form';
export { BankDetailsFormSkeleton } from './skeleton';

// components/bank-details-form/parts/bank-selection.tsx
export function BankSelection(props: Readonly<BankSelectionProps>) {
  /* ... */
}
export function BankSelectionSkeleton() {
  /* ... */
}
```

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

- Do not add custom application retry logic: no retry loops/backoff, query or
  mutation overrides that enable retries, dedicated retry buttons/handlers, or
  checkpoint/resume machinery for failed workflows. Keep errors visible through
  i18n and rely on browser refresh for recovery. Normal form submission and data
  loading are not retry mechanisms. The existing auth token refresh/replay and
  Playwright test retries are intentional exceptions; preserve them.

- Put reusable UI and API hooks here.
- Hooks may coordinate state and side effects, but they should still remain reusable within the feature or shared scope.
- Define only one custom hook per file, including private hooks.
- Query keys use `['serviceName', 'methodName', ...arguments]`, matching the
  invoked service/method and inputs identifying cached data. Append discriminators
  only for distinct cache shapes or isolated sessions. Invalidation may use prefixes.
- `npm run check:hooks` enforces hook counts and resolvable service/method prefixes;
  lint, structure checks, pre-push, and CI run it automatically.

## `pages/`

- Each page lives in `pages/<page>/<page>.page.tsx` and orchestrates feature
  pieces and page composition. Its `index.ts` exports only the page component.
- Page rendering MUST be composition-only, following this hierarchy:

  ```text
  Page
    AppBody
      AppSection
        Components or private parts
      AppSection
        Components or private parts
  ```

- Pages MUST NOT define CSS: no `className`, inline `style`, CSS imports,
  CSS-in-JS definitions, or class-building utilities in page entries. This
  includes JSX passed through slots or render callbacks. Do not introduce
  hand-built layout wrappers in a page.
- `AppBody` owns spacing between its direct `AppSection` children.
  `AppSection` owns standard section presentation and spacing between its
  direct children. Pages compose these primitives through their supported
  props; they must not reach into or style descendants.
- `AppSection` MUST only be composed as a direct child of `AppBody`, at the
  page composition boundary. Do not nest it inside another `AppSection`, a
  layout wrapper, or a content component. Conditional rendering may choose
  which direct sections appear, but must not introduce an intervening wrapper.
- Components, private parts, containers, and their skeleton/error variants
  MUST NOT render their own `AppSection`. They render content and controls;
  the page owns the surrounding `AppSection` and its `title` prop. Move an
  existing internal section wrapper to the page rather than adding a second
  section around it. Stories and tests that render `AppSection` must compose
  it directly under `AppBody` as well.
- Components and private parts own their internal layout, typography,
  responsive behavior, and the dimensions of their loading and error states.
  Put specialized arrangements inside a component or part rather than adding
  page-level CSS or exposing arbitrary CSS through layout props.
- Use the singular name `AppSection` for the section primitive. Do not add
  a separate `AppSections` layer or make pages assemble standalone section
  title primitives.
- This is the page presentation standard; account pages are the current
  standardization scope. Existing pages are not exceptions to the standard,
  but do not migrate unrelated pages without task scope.
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
