# Shadcn Rules

## Goal

Keep shadcn generation subordinate to the repository architecture.

## Invariants

- Treat generated shadcn code as application-owned source code.
- Treat `components.json` aliases as landing directories only.
- Do not consider a shadcn command complete until generated files have been normalized.
- Place every generated file at the narrowest scope that owns all of its consumers.
- Put component-specific hooks, contexts, types, variants, validation, and utilities in the owning component directory.
- Put only genuinely shared logic in `src/shared/hooks` or `src/shared/lib`.
- Do not create `src/shared/components/ui` or `src/shared/components/lib` buckets.
- Do not leave component implementations directly under `src/shared/components`.
- Do not overwrite an owned component without reviewing the generated diff.
- Preserve the shared dependency boundary after generation.
- Preserve this repository's shared `Button` `loading` prop. Pending actions
  must use it instead of upstream examples that manually compose `Spinner`
  and loading text. Component skeletons must follow the ownership and export
  contract in `file-responsibility-rules.md`.
- Use local, pinned project tooling rather than fetching an arbitrary latest CLI version.
