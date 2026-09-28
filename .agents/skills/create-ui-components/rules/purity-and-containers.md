# Purity and Container Rules

## Pure component boundary

A component in `<component-name>.tsx` must be render-pure: rendering it must not
read from, write to, subscribe to, or command an external system.

Pure components may:

- render from props;
- manage local UI state;
- derive values with plain expressions or `useMemo`;
- use deterministic helpers;
- use presentation hooks such as translations or local form state;
- update local UI state in event handlers;
- emit callbacks such as `onSubmit`, `onChange`, `onOpenChange`, or
  `onNavigate`.

Pure components must not:

- fetch or mutate remote data;
- call API/service methods with observable external effects;
- read or write local storage, session storage, cookies, or global state;
- show toasts, send analytics, or perform logging as application behavior;
- start timers or subscriptions;
- imperatively navigate;
- mutate the DOM, browser globals, or third-party systems;
- use an effect to synchronize one piece of React state from another.

Judge a dependency by its behavior, not its name. A deterministic formatter may
remain in a pure component; a hook that fetches data may not.

## Navigation

Do not let a pure component decide or imperatively execute navigation. Receive an
`onNavigate`, `to`, or `href` contract from its owner. Rendering a declarative
link is acceptable when the destination is supplied as presentation data and no
workflow is triggered during render.

## Containers

When side effects or orchestration are necessary, add
`<component-name>.container.tsx`.

A container private to one page belongs in that page's `parts/`, inherits page
permissions, and is not exported from the page barrel. It may consume reusable
feature presentation components through their public APIs.

The container may:

- call query and mutation hooks;
- use services;
- read route or application state;
- navigate;
- display toasts;
- handle API errors;
- coordinate dialogs, loading states, and success flows.

Keep the container thin:

1. obtain data and external state;
2. translate them into pure-component props;
3. implement workflow handlers;
4. render the pure component.

Move reusable business logic to the owning feature's hooks or `lib`. Export both
the pure component and container from `index.ts` only when both are intended for
consumers. Prefer stories for the pure component; test the container separately
when its orchestration contract matters.

`src/account/components/accounts-table/accounts-table.container.tsx`
demonstrates the intended split, but the rules in this skill take precedence
over incidental legacy details in any example.

## Effects

Avoid `useEffect`. First try:

- derive values during render;
- use `useMemo` for expensive derivation;
- perform user-driven work in its event handler;
- reset state by changing component identity with a `key`;
- move external synchronization to an existing hook or owner.

A genuine effect synchronizes with an external system. That makes it
orchestration for this project, so place it in the container or an appropriately
owned hook. Add a short comment only when the external synchronization purpose
is not obvious.

## Dialog Orchestration

A `.dialog.tsx` entry may orchestrate effects directly without an additional
container. Dialog-private containers belong in the owner's `parts/`, inherit
dialog permissions, and remain absent from the public barrel.
