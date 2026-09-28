---
name: create-ui-components
description: Create, refactor, or review React components under this repository's src/**/components directories and private page or dialog parts directories. Use for component folders, pure presentation components, side-effect containers, forms, component types, validation, Storybook stories, Vitest tests, and index.ts public exports, including when deciding whether UI belongs to a page, a dialog, a feature, or src/shared.
---

# Create UI Components

Create components that preserve the repository's feature-first architecture, public
API boundaries, and presentation/container split.

## Read the rules

Before editing component code:

1. Read `.agents/rules/folder-structure.md`,
   `.agents/rules/dependency-rules.md`,
   `.agents/rules/file-responsibility-rules.md`,
   `.agents/rules/type-naming-rules.md`,
   `.agents/rules/mapper-rules.md`, and
   `.agents/rules/testing-rules.md`.
2. Read every rule bundled with this skill:
   - [Structure and public API](rules/structure-and-public-api.md)
   - [Purity and containers](rules/purity-and-containers.md)
   - [Component anatomy](rules/component-anatomy.md)
   - [Forms, stories, and tests](rules/forms-stories-and-tests.md)
3. If the task adds or updates a shadcn registry item, also use
   `$add-shadcn-ui` and follow its generation workflow before normalizing the
   result with these rules.

Treat these rules as authoritative for new and modified code. Existing components
are useful examples, but some predate the current rules.

## Workflow

1. Inspect `git status` and preserve unrelated work.
2. Inspect the nearest component examples in the same ownership layer and
   identify their conventions for naming, styling, translations, stories, and
   tests.
3. Choose the owner:
   - Put UI private to a page in `src/<feature>/pages/<page>/parts` and keep
     page-only hooks, helpers, and types with that page owner.
   - Put independently reusable feature-specific UI in `src/<feature>/components`.
   - Put genuinely feature-agnostic UI in `src/shared/components`.
   - Do not move code to shared merely because it has one possible reuse.
4. Define the component contract before implementation. Pass data, status, and
   callbacks into the pure component.
5. Classify every operation as presentation or orchestration. Add
   `<component>.container.tsx` when orchestration or side effects are required.
6. Assess the primary UI file for substantial internal components. Keep trivial
   render helpers inline, but move private UI sections with their own contract,
   hooks, handlers, or meaningful conditional rendering into `parts/`.
7. Inspect the primary UI file for deterministic value helpers, substantial
   callback bodies, and nested ternaries. Apply the linked helper and handler
   rules before adding new logic.
8. Create the smallest applicable owner-scoped file set, organize tests and
   stories in the component's support directories, and expose only its public
   contract from `index.ts`.
9. Add realistic stories and focused behavior tests. Use real owned components
   and hooks in component tests. For containers, mock external systems only when
   necessary. For forms, keep all types and validation outside the component
   file.
   If the task requires dialog, page, route, or other browser integration
   coverage, also use `$write-playwright-integration-tests`.
10. Verify the focused change, then inspect the final diff for architecture
    drift and readability-rule violations.

## Verification

Run checks in proportion to the change, including:

```bash
npm run check:structure
npm run check-stories
npm test -- --run <component-test-file>
npm run lint
npm run build
```

Use focused tests first. Run broader lint and build checks when the change's scope
or risk warrants them. Report any check that could not be run.

## Completion checklist

- The component has one owning directory and one `index.ts` public entry point.
- The UI file remains presentation-only.
- Side effects and orchestration live in a container, hook, page, dialog, or
  `lib`, according to ownership.
- Every presentation UI `.tsx` file has a mirrored story in the owner's
  `__stories__/` directory; page/dialog entries and containers are exempt.
- A single owner-local loading skeleton uses `skeleton.tsx` with a descriptive
  exported symbol and matching `skeleton.*` support filenames.
- Behavior and user outcomes have focused tests.
- Component tests do not mock owned components or hooks.
- Container tests render the real presentational component and mock only
  necessary external boundaries.
- Form types live in `types.ts`; form validation lives in `validation.ts`.
- Types follow the repository prefix convention; only `*Props` omit a prefix.
- Imports obey feature-to-shared dependency direction.
- Substantial private UI sections live in `parts/`, remain owner-private, and
  are not re-exported.
- Deterministic component helpers live together in one root-level
  `helper.ts`, expose only a frozen `<componentName>Helpers` default object,
  have one matching `__tests__/helper.test.ts`, and are not re-exported.
- Callbacks with branching, lookup, transformation, or multiple statements use
  named handlers; short single-expression adapters may remain inline.
- Component code contains no nested ternaries.
- No internal helper is exported accidentally.

## Dialog Owners

Choose `src/<feature>/dialogs/<dialog>/parts/` for dialog-private UI and keep
private hooks, helpers, and types with that owner. Follow the dialog folder
layout in `.agents/rules/folder-structure.md`. The `.dialog.tsx` entry may
orchestrate effects directly without a separate container.
