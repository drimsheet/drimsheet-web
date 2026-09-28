# Structure and Public API Rules

## Ownership

- Put independently reusable feature UI in `src/<feature>/components/<component-name>/`.
- Put page-private UI in `src/<feature>/pages/<page>/parts/`; use
  `<page>.page.tsx` for the page entry and export only that component from the
  page's `index.ts`. Page parts inherit page dependency permissions.
- Keep page-only hooks in the page's `hooks/`, helpers in its root `helper.ts`,
  and shared private types in its `types.ts`. Apply the same helper contract as
  components. These modules are private to the page directory.
- Mirror page part tests and stories under the page's `__tests__/parts/` and
  `__stories__/parts/`. Hook tests belong in `hooks/__tests__/`.
- Page entries and containers do not require stories; pure page parts do.
- The component file set below applies to component owners. Page owners follow
  the page folder layout in `.agents/rules/folder-structure.md`.
- Put reusable, feature-agnostic UI in
  `src/shared/components/<component-name>/`.
- Use kebab-case for the component directory and owner-scoped file names.
- Keep component-only helpers, hooks, contexts, types, variants, validation,
  stories, and tests in the component directory.
- Put extracted UI subcomponents that are private to one component in that
  component's `parts/` directory.
- Move logic to feature `lib` or `hooks` only when it has consumers outside the
  component directory.
- Never import a feature from `src/shared`.

## File set

Create only applicable files, using this shape:

```text
components/<component-name>/
  <component-name>.tsx
  <component-name>.container.tsx
  skeleton.tsx
  helper.ts
  parts/
    <part-name>.tsx
  __tests__/
    <component-name>.test.tsx
    skeleton.test.tsx
    helper.test.ts
    parts/
      <part-name>.test.tsx
  __stories__/
    <component-name>.stories.tsx
    skeleton.stories.tsx
    parts/
      <part-name>.stories.tsx
  types.ts
  validation.ts
  index.ts
```

Requirements:

- `<component-name>.tsx`: required for rendered UI.
- `__stories__/<component-name>.stories.tsx`: required for every root-level UI
  `.tsx` file.
- `index.ts`: required and is the directory's only public entry point.
- `__tests__/<component-name>.test.tsx`: required when behavior, interaction,
  validation, accessibility, or meaningful conditional rendering needs a
  contract.
- `types.ts`: required for forms; otherwise use it when types are shared by more
  than one file in the component directory.
- `validation.ts`: required when the component owns validation.
- `<component-name>.container.tsx`: required when the UI needs side effects or
  orchestration.
- `skeleton.tsx`: optional for a single owner-local loading skeleton. Keep the
  exported symbol descriptive, use matching `skeleton.test.tsx` and
  `skeleton.stories.tsx` support names, and use role-based filenames only when
  the owner has multiple distinct skeletons.
- `parts/`: optional and reserved for extracted UI subcomponents used only by
  the owning component.
- `helper.ts`: required when the component owns deterministic non-UI helpers;
  group all such functions in one frozen default helper object and add one
  matching `__tests__/helper.test.ts`.

## Private parts

Keep small render helpers and short, declarative fragments in the primary
`.tsx` file. Do not let that permission accumulate multiple substantial React
components in one file.

Extract a subcomponent into `parts/` when it represents a coherent UI section
and one or more of these signals apply:

- it has a meaningful props contract;
- it owns hooks, local state, or event handlers;
- it contains meaningful conditional rendering or repeated UI;
- it is a recognizable section whose implementation obscures the parent
  component's composition;
- it benefits from a focused story or behavior test.

Do not extract a trivial wrapper or a few lines of JSX merely to reduce a line
count. A part should make the parent's composition easier to scan and remain
cohesive on its own.

Private parts follow these ownership rules:

- Only files within the owning component, page, or dialog directory may import them.
- Import them through explicit relative paths such as `./parts/header-actions`;
  do not create `parts/index.ts`.
- A part that needs an owner-level type imports it relatively, such as
  `../types`, rather than through the owner's public alias.
- Do not export parts from the owner's `index.ts`.
- Name parts for their UI role. Ordinal names are acceptable only when order is
  the actual role, such as steps in a fixed wizard.
- Promote a part to its own `components/<component-name>/` directory when it
  gains a consumer outside the owner.
- Apply the same purity, story, test, and accessibility rules to parts as to
  other UI component files.
- Put part tests and stories in the mirrored `__tests__/parts/` and
  `__stories__/parts/` paths rather than in `parts/`.

## Imports and exports

- Import another component through its directory public API, for example
  `@/shared/components/button`.
- Use direct sibling imports from the component implementation and container.
  They must not import their own directory's `index.ts`.
- Use explicit relative imports for private parts from production files. From
  support directories, use the explicit aliased implementation path.
- Import the private helper object through its explicit `./helper` path. Do not
  create a `helpers/` directory, add operation-named helper modules, import the
  helper outside its owner, or re-export it from the owner's public `index.ts`.
- Keep helper functions local, expose only a frozen
  `<componentName>Helpers` default object, and use concise operation names on
  that object, such as `inflowFormHelpers.createInitialValues`.
- Import through the public alias in stories and consumer-facing tests so they
  also verify the barrel contract. Use an explicit aliased implementation path
  only when a support artifact intentionally targets a non-public module such
  as validation, `helper.ts`, or a private part.
- Prefer `import type` and `export type` for type-only contracts.
- Export only public components, containers, types, variants, and validation
  intended for consumers.
- Do not export tests, stories, private helpers, or implementation-only types.
- Avoid wildcard exports when they would leak an internal symbol; otherwise
  follow the nearest established barrel style.

## Component contract

- Keep the component's responsibility narrow and make required data explicit in
  props.
- Accept callbacks for user intent instead of owning application workflows.
- Use `Readonly<Props>` for component parameters.
- Preserve native element props when that improves composition, and omit or
  override conflicting fields explicitly.

## Dialog Ownership

Apply the page ownership and private support conventions to
`dialogs/<dialog>/<dialog>.dialog.tsx`, using dialog dependency permissions.
The public barrel exports the dialog component and optional public props types
only. Other owners must not import private dialog implementations.
