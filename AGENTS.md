# Agent Guide

This repository uses `.agents/rules/` as the source of truth for AI task execution.

Before making changes, follow the rules in:

- `.agents/rules/folder-structure.md`
- `.agents/rules/dependency-rules.md`
- `.agents/rules/file-responsibility-rules.md`
- `.agents/rules/type-naming-rules.md`
- `.agents/rules/mapper-rules.md` when creating or updating mappers
- `.agents/rules/testing-rules.md` when creating or updating tests
- `.agents/rules/i18n-rules.md` when working with translations
- `.agents/rules/shadcn-rules.md` when working with shadcn-generated code
- `.agents/rules/commit-message-rules.md` before committing or writing PR titles

## Working Principles

- Keep changes aligned with the existing feature-first structure.
- Prefer the smallest file and folder change that satisfies the task.
- Preserve dependency direction and file responsibility boundaries.
- Use the shared button's `loading` prop for pending actions and component
  skeletons for loading content. Never substitute manual loading text or
  hand-inserted button spinners. Every skeleton must represent a component:
  export it from that component's barrel, or define and export it in the same
  file as its `*/parts/*` component. Follow the loading UI and skeleton rules in
  `.agents/rules/file-responsibility-rules.md`.
- Map form values directly to generated DTOs through explicit, validation-free
  mappers.
- Prefer native `<output>` over `role="status"` for status messages and loading
  announcements where appropriate. Keep skeleton layout containers intact and
  use a screen-reader-only `<output>` for their announcement. Follow the native
  status semantics rules in `.agents/rules/file-responsibility-rules.md`.
- Never introduce plain-text user-facing errors; route validation messages,
  toast copy, dialog errors, and error fallbacks through i18n instead.
- Do not add custom application retry logic, automatic retry overrides, retry
  buttons, or handlers that replay failed requests or resume failed workflows.
  This is a web app: show the existing translated error state and let the user
  refresh the browser. Preserve the existing auth token refresh/replay mechanism
  and Playwright test retries. See `.agents/rules/file-responsibility-rules.md`.
- If a task appears to conflict with the rules, update the rules first or call out the conflict before proceeding.
- For UI component tasks, follow `.agents/skills/create-ui-components/SKILL.md`.
- For shadcn tasks, use `.agents/skills/add-shadcn-ui/SKILL.md` and `.agents/workflow/shadcn-ui.md`.
- For test selection and placement, follow `.agents/workflow/testing.md`.
- For Playwright browser integration tasks, follow
  `.agents/skills/write-playwright-integration-tests/SKILL.md`.
