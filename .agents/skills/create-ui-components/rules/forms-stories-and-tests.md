# Forms, Stories, and Tests Rules

## Forms

Every form component must keep its types outside the component file:

```text
<form-name>/
  <form-name>.tsx
  <form-name>.container.tsx
  skeleton.tsx
  helper.ts
  parts/
    <part-name>.tsx
  __tests__/
    <form-name>.test.tsx
    skeleton.test.tsx
    helper.test.ts
  __stories__/
    <form-name>.stories.tsx
    skeleton.stories.tsx
    parts/
      <part-name>.stories.tsx
  types.ts
  validation.ts
  index.ts
```

- Put form values, component props, and types shared by form support files in
  `types.ts`.
- Import them with `import type` from `./types`.
- Re-export public form types from `index.ts` with `export type`.
- Put schemas, validation functions, and translation-aware validation hooks in
  `validation.ts`.
- Put non-trivial initial-value factories, value normalizers, serializers,
  error projections, and reusable predicates together in the form's private
  root-level `helper.ts`.
- Keep the functions local, expose only a frozen `<formName>Helpers` default
  object, and give it one matching `__tests__/helper.test.ts` that imports the
  default object directly. Do not expose helpers through the form barrel.
- Keep validation deterministic apart from translation lookup; do not fetch data
  or mutate state while validating.
- Pass option data, loading state, initial values, and submit callbacks into the
  pure form.
- Put fetching, mutations, toasts, navigation, and API error handling in the
  container.
- Let the form emit validated values through `onSubmit`; do not make the form own
  the application workflow.
- When a form owns one loading placeholder, put it in `skeleton.tsx`, retain a
  descriptive `<FormName>Skeleton` export, and use `skeleton.test.tsx` and
  `skeleton.stories.tsx` for dedicated support artifacts.

## Stories

- Add one story under the owning component, page, or dialog's `__stories__/` directory
  for every presentation UI `.tsx`; containers and page/dialog entries are exempt.
  Mirror private part stories under `__stories__/parts/`.
- Use `satisfies Meta<typeof Component>` and `StoryObj<typeof meta>`.
- Add `tags: ['autodocs']` unless the nearby Storybook convention requires
  otherwise.
- Import public components through their public alias. Import private
  `parts/` components directly from their implementation file because they are
  intentionally absent from the public barrel.
- Cover realistic visual and interaction states such as default, loading,
  disabled, empty, invalid, populated, and long-content states when relevant.
- Supply deterministic data and lightweight providers or decorators.
- Do not call live APIs or hide the component contract behind unnecessary setup.
- Use Storybook actions or inert callbacks instead of application side effects.

## Tests

- Follow `.agents/rules/testing-rules.md`.
- Use Vitest, Testing Library, and `userEvent` following nearby tests.
- Use real owned child components and hooks; do not use module mocks in
  component tests.
- Test user-visible contracts and outcomes, not hook calls or internal state.
- Keep one behavior or outcome per test.
- Prefer accessible queries by role, label, and visible text.
- Test callback payloads, important conditional states, keyboard or pointer
  interaction, and accessibility semantics when relevant.
- For forms, test required/invalid states and a successful submit payload.
- Test validation directly when rules have meaningful branches or edge cases.
- Test containers separately when their orchestration adds behavior worth
  protecting. Render the real presentational component and mock only necessary
  external boundaries.
- Test dialogs and pages under `playwright/tests/<feature>/`, not through
  component Testing Library tests. Use
  `$write-playwright-integration-tests` for that coverage.
- Page-private parts and containers follow the same Vitest contracts above;
  mirror their tests under the page's `__tests__/parts/`. Page hook tests belong
  in `hooks/__tests__/`, and helper tests in `__tests__/helper.test.ts`.

## Dialog Support Files

Dialog-private presentation parts require mirrored stories and follow the same
Vitest boundaries as page-private parts. Dialog entries and containers are
exempt from stories. Test complete dialog workflows with Playwright.
