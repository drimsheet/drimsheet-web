# Component Anatomy Rule

Use the following order as a readability guide, not as a reason to break data
dependencies or the Rules of Hooks:

1. third-party context, router, and translation hooks;
2. local `useState`, `useReducer`, and `useRef` hooks;
3. project hooks and other custom hooks;
4. form hooks such as `useFormik`, `useField`, and `useFormikContext`;
5. derived values and `useMemo`;
6. event handlers, including `useCallback`-wrapped handlers;
7. `useEffect` only in a container or appropriately owned hook when external
   synchronization is unavoidable;
8. early returns and guard clauses;
9. UI-only destructuring and render variables;
10. translation string extraction;
11. returned UI.

Within a group, order declarations by dependency: a value must be declared after
the hook or value it consumes. Keep all hooks unconditional and before early
returns.

This dependency-aware grouping deliberately differs from a rigid
hook-by-hook order. In particular, `useMemo` cannot always precede custom or form
hooks because its calculation may depend on their results. Likewise, whether a
hook is third-party or project-owned is less important than what data it
provides.

## Handler guidance

- Prefix local handlers with `handle`.
- Keep `useCallback` with the other handlers instead of with derived memos.
- Put user-triggered logic in the handler rather than setting state for an
  effect to observe.
- Give a callback a named handler when it contains branching, lookup,
  transformation, or multiple statements. Keep only short single-expression
  adapters inline.
- Do not use nested ternaries. Use guard clauses, explicit `if`/`else`, nullish
  coalescing when semantically equivalent, or a named resolver.
- When a handler needs a translated notification, translate inline in the
  handler or extract that one string immediately before use.
- Extract render-only translation strings near the returned UI.

## Derived state guidance

- Calculate cheap derived state directly during render.
- Keep simple conditional rendering in JSX. Use a named boolean such as
  `shouldRenderForm` for a compound condition, then render loading and content
  with mutually exclusive `&&` expressions. Do not use a mutable JSX variable
  populated by `if`/`else` as a substitute for straightforward conditional JSX.
- When a rendering predicate checks optional data, use a local immutable value
  so TypeScript can narrow it in the guarded JSX without a non-null assertion.
- Use `useMemo` only for expensive calculation or referential stability that a
  consumer actually requires.
- Do not mirror props, query results, or other state with `useState` plus
  `useEffect`.
- Keep rendering declarations close enough to the UI that their purpose remains
  obvious.
