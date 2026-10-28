---
name: interface-design
description: Design, build, review, or refine Drimsheet product interfaces using its approved Butter brand accent, light and Ramp charcoal themes, navigation hierarchy, and semantic financial charts. Use for dashboards, forms, settings, data interfaces, layout, tokens, states, and visual consistency. Not for marketing pages, campaigns, or brand-only work.
---

# Interface Design

This is the design contract for Drimsheet. The navigation and hybrid chart
system and referenced color palette are approved decisions. Apply them without
reopening color exploration on each task. New explicit user direction can revise
this contract; incidental preview selections do not replace an explicit choice.

Use this skill for product UI design, implementation, and review. A request for a
preview or a skill update does not authorize changing application code. Preserve
the requested scope and the existing accounting workflows.

## Design philosophy

Drimsheet should feel like a calm bookkeeping desk: readable records, precise
amounts, familiar financial signals, and a small, intentional brand highlight.
Its domain is accounts, income, expenses, categories, counterparties, balances,
periods, and reconciliation. The interface should make recording and inspecting
money straightforward.

- Let the user's current task lead. Use typography, alignment, and whitespace to
  establish hierarchy before adding containers, borders, or color.
- Keep most of the screen neutral. Butter identifies actions and selection;
  financial colors communicate the meaning of data. These are separate roles.
- Make sidebar navigation distinct. Each page composes its own breadcrumbs,
  headings, and content on one continuous surface, without a global top bar.
- Favor flat surfaces, quiet hairlines, and modest tonal steps. Avoid decorative
  gradients, dramatic shadows, oversized icons, and a card around every section.
- Retain recognizable workflows and useful information density. Do not invent
  metrics, controls, or features merely to fill a composition.
- Consistency matters more than novelty. Reuse established patterns; adapt their
  layout to the task rather than generating a different visual identity per page.

## Color palette and theme roles

Use the documented palette in [Color palette](references/color-palette.md) for
color selection, theme mapping, component styling, and color reviews. Read that
reference before those tasks; it is the single source of shade values, approved
role mappings, and contrast pairs.

**Status:** the user approved the shade scales and theme mappings for application
implementation. Preserve these palette choices and the established Butter brand
and Ramp charcoal anchors in subsequent interface work.

- Define colors as reusable primitives independent of components. Use the
  documented numbered scales and the approved olive and mauve financial anchors.
- Semantic aliases such as primary, secondary, background, and financial-income
  select palette shades for each theme. They must not introduce new hex values.
  Primary and secondary are roles, not separate shade families.
- Components consume the shared role pairs or an explicitly chosen palette
  shade for a documented local role. Do not invent colors per component.
- Use Butter sparingly for the main action and intentional selection, with
  dark text. Secondary actions use charcoal with off-white text in light mode
  and light neutral with charcoal text in dark mode.
- The brand accent is Butter (primary). The CSS accent token is a neutral
  interaction surface; do not confuse these two uses of the word accent.
- Link text uses darker Butter in light mode and primary Butter in dark mode,
  through the shared `link` role (`text-link`). Follow the palette reference's
  theme mapping; do not substitute blue or use `text-primary` for light-mode
  links. Standalone entity-name links may omit the resting underline, but must
  show it on hover and keyboard focus and retain a visible focus indicator.
- Keep panel surfaces separate from secondary action fills, and essential
  control borders separate from quiet decorative dividers.
- Financial income/inflow uses olive `#92916F` and financial expense/outflow
  uses mauve `#806C6D`, with the same opaque values in light and dark themes.
  Butter remains the brand accent for actions and selection. Success badges
  and feedback retain green; error and destructive feedback retain terracotta.
  Keep these semantic roles separate and financial meaning distinct from
  validation and operation outcomes. An expense increase is not automatically
  good, and every reversal is not an error.
- Inspect consumers when changing role mappings. Existing opacity modifiers,
  foreground overrides, and gradients can invalidate otherwise accessible pairs.

## Navigation and page composition

- **App layout:** provides the sidebar and main content area. Do not introduce
  a global top bar or reserve a persistent header row above every page.
- **Sidebar:** use its distinct surface in both themes. Do not make it the same
  color as the page. Use small monochrome icons, aligned labels, and quiet group
  captions; preserve the application's information architecture.
- **Global controls:** place account/entity switching, the user menu, logout,
  and any existing notification control in the sidebar. Keep them accessible
  when the sidebar is collapsed and through its mobile navigation pattern.
- **Active navigation:** Butter fill with dark text in light mode. In dark mode,
  use the muted warm selection fill with Butter text/icon so the navigation does
  not compete with the main action. Include a non-color indication such as
  weight and `aria-current`.
- **Page composition:** each page owns its breadcrumbs, heading, description,
  and relevant actions, composing shared primitives for consistent typography
  and spacing. Breadcrumbs, where useful, flow directly into the page on its
  background, with no contrasting band, bottom border, shadow, or outline.
  Use spacing to separate breadcrumbs from the page title.
- **Tabs:** a quiet baseline and short active underline may remain where they
  explain a real tab group. The removed breadcrumb divider is not a ban on
  functional separators elsewhere.
- **Content:** title and purpose first, then the task. Keep secondary upload/help
  panels quieter than the working form. Present related metrics as an aligned
  group rather than an obligatory grid of separate cards.
- **Responsive layout:** reflow controls and panels before shrinking text. Collapse
  the sidebar through the existing accessible navigation pattern. Keep a visible,
  accessible menu trigger available within the page composition when the sidebar
  is hidden; this does not require a global top bar. Contain wide table scrolling
  without introducing horizontal page overflow.

## Typography, spacing, and depth

Use **Inter** for UI and headings. Use regular body text, medium labels and
headings, and selective semibold emphasis. Hierarchy comes from size, weight,
contrast, and space together; do not apply a marketing-style single-weight rule.
Use tabular numerals for amounts and other aligned or changing numbers.

**Page section headings:** use 12px, medium weight, uppercase text with 0.07em
letter spacing and the muted foreground token. These label the main sections
within a page, such as **OVERVIEW** and **ALL CATEGORIES**. Use concise wording
that avoids repeating context already established by the page title.

- Implementation: `m-0 text-xs font-medium uppercase tracking-[0.07em] text-muted-foreground`.
  Reset heading margins to preserve consistent section spacing.
- **Title-only headers:** page section headers must contain only the section
  title, never actions, buttons, links, filters, period selectors, help controls,
  badges, or other adornments. `AppSection` must not expose action or adornment
  slots; do not embed controls in its `title` prop to bypass this rule.
- Place section-specific controls and supporting information in the section's
  content area, alongside the relevant form, chart, or table controls. Place
  page-level actions with the page title.
- Keep semantic heading elements and sentence-case translation values; apply
  uppercase through CSS.
- Page titles retain their larger hierarchy. Nested chart labels, such as
  “Revenue by category” and “Expenses by category”, use 14px, medium weight,
  sentence case, and muted foreground (`text-sm font-medium text-muted-foreground`).

Starting points for other typography and layout, adaptable to the component:

- Body and controls: 13–14px; supporting labels: 11–12px; page titles: 28–32px.
  Keep supporting text readable and support zoom.
- **Page section spacing:** use 48px on desktop and 32px on mobile between
  major page sections, including the gap from the page title/actions to the
  first section. Implement with `gap-8 md:gap-12` on the page's section stack.
- Use a 4px spacing base, typically 8–12px within controls and 16–24px within
  groups. Keep content within a section more tightly grouped than the major
  sections themselves.
- A desktop sidebar around 192–224px serves the content. Use about 32px desktop
  content padding and 16–20px on small screens; adapt to existing layout needs.
- Controls around 40–44px tall, small 4–6px radii, and modest panel rounding keep
  the interface precise. Keep adequate touch targets and visible focus.
- Structure comes primarily from space, surface tone, and quiet borders. Do not
  add routine card shadows. Give overlays a distinct opaque surface and enough
  separation to remain legible above their parent.

Inspect existing primitives before building controls. Prefer native semantics and
installed accessible components; compose the repository's controls instead of
hand-rolling dropdown, dialog, date-picker, or keyboard behavior. Follow the
repository's UI component and shadcn workflows when implementation is requested.

## Tables

- **Scope:** reusable tables contain only header, body, and optional pagination.
  Compose titles, search, and page actions outside the table.
- **Appearance:** use the page surface, muted header, quiet horizontal separators,
  subtle hover, and a 6px outer radius; no shadows or vertical gridlines. Keep
  amounts neutral, right-aligned, and tabular; align their headers accordingly.
- **Typography:** uppercase headers at 11–12px, medium weight, and approximately
  0.07em tracking; body text at 13–14px, regular weight with selective emphasis.
  Configure header and body sizes separately.
- **Sizing:** default to a 42px header, 60px rows, and 16px horizontal cell padding.
  Column width/proportion and minimum width are independent of row height.
  Preserve readable minimums and contain horizontal scrolling on narrow screens.
- **Columns:** independently configure label/custom header, cell rendering,
  alignment, width/proportion, minimum width, optional help, sorting, and filtering.
  Use one configurable table, not separate layouts for density presets.
- **Controls:** sortable labels show direction; adjacent filter buttons have
  separate targets and an active count with a subtle Butter treatment. Plain
  columns show labels only. Filter popovers use Apply and Clear; opening or
  applying filters preserves sorting. Apply/Clear resets pagination and updates
  filtered counts; zero matches shows an empty state.
- **Accessibility:** keep controls visible without hover; provide named keyboard
  controls, visible focus, `aria-sort`, and filter expanded state. Popovers dismiss
  with Escape/outside click and return focus appropriately; reuse existing
  accessible primitives and prevent clipping within the table scroll area.

## Hybrid financial charts

The approved system combines **Butter for UI identity** with **solid olive
(`#92916F`) for income/inflow** and **solid mauve (`#806C6D`) for expenses/outflow**
in both light and dark themes. Neutral gray is for comparisons, inactive data,
and reversals. This pair replaces the earlier moss/clay mapping; do not use
Butter, warm graphite, or steel blue as ordinary financial series colors, or
assign a decorative color to every category.

### Meaning and encoding

- Revenue, income, money in, and shares of an income category use the income
  token. Expense categories and money out use the expense token.
- Preserve the series identity across charts, legends, tooltips, and themes.
  Keep the approved financial mark colors identical across light and dark themes;
  verify their contrast against the actual adjacent surfaces.
- Counterparty shares inherit the owning category's income/expense role. Names
  and direct labels distinguish counterparties; a rainbow is unnecessary.
- Keep ordinary amounts, axis labels, and summary numbers in neutral text.
  Colored marks and small legend swatches carry the financial signal.
- For paired cash flow, use solid olive income bars and solid mauve expense bars,
  with matching solid legend swatches. Keep income first (left) and expense
  second (right), named legends, and labeled values in keyboard/touch-accessible
  tooltips or a data view. Do not use expense hatching; color alone must not
  carry the distinction.
- A negative net amount extends below or left of zero and retains its sign.
  Use neutral hatching and a reversal label where appropriate; a negative
  revenue adjustment must not silently become an expense series.
- Butter may indicate selection through a surrounding UI cue, but must not erase
  the selected data's income/expense identity.

### Chart patterns

**Category rankings:** horizontal bars, directly labeled category names, amounts,
and shares. Use narrow tracks around 6–8px and restrained rounding. Revenue and
expense panels that invite amount comparisons share a currency, period, domain,
and scale. Label the monetary range explicitly; a percentage beside a row does
not mean its bar is percentage-scaled. Compute the range from real data, including
signed values, rather than copying a sample's fixed maximum.

**Counterparty share:** use a clearly labeled 0–100% scale when shares are valid
proportions. Show exact amounts and percentages beside the names. Do not clamp a
negative share or a share over 100% into a misleading progress bar; retain the
signed figure and use an appropriate diverging scale or textual explanation.
Unavailable shares display as unavailable, not zero.

**Monthly category trend:** chronological vertical bars with a zero baseline,
currency units, and readable month labels. Include negative values in the domain.
Use the category's semantic color for its ordinary series and the reversal
encoding for negative net adjustments. Small corner radii, around 2–3px, are
sufficient; avoid pill-shaped columns and decorative gradients.

**Account cash flow:** paired income/expense bars on one shared scale and date
axis. Use solid fills for both series, consistent income/expense order, named
legends, and exact amounts in tooltips or an accessible data view. Do not draw
ordinary money out below zero
unless the underlying chart explicitly represents signed cash movement.

### Readability and states

- Use subtle horizontal gridlines and a clear zero baseline. Avoid unnecessary
  vertical gridlines, heavy plot boxes, or decorative frames around every chart.
- Label units and periods. Format amounts consistently with the account currency
  and locale, respecting minor units; compact axes must retain exact values in
  labels, tooltips, or the accessible data view.
- Prefer direct values when they fit. On narrow screens, reduce optional labels
  rather than overlapping or shrinking them. Make inspection work with keyboard
  and touch as well as pointer hover.
- Preserve accurate bar proportions, complete data domains, and meaningful zero
  values. A zero total and missing data are different states. Never invent
  percentages or replace an unavailable comparison with 0%.
- Show a neutral loading skeleton, a useful no-activity state, and a distinct
  recoverable error state. Do not display fabricated bars in any of these states.
- Keep existing chart/data primitives and accessibility behavior when implementing.
  Verify color contrast against the actual theme; labels and consistent series
  order remain necessary even when both colors contrast well with the page.

## Working process

1. Inspect the actual page, its data semantics, existing tokens, and reusable
   controls. Treat this contract as the established direction. Additional notes
   must not silently override these explicit decisions.
2. Keep a compact working brief: who is using the screen, their task, focal
   element, density, and how the approved surfaces and colors support it. Do not
   repeat a generic palette-exploration exercise for settled decisions.
3. For previews, show the real screen or component with clearly identified sample
   data. Use an available inline rendering tool and follow its output contract;
   keep product styling distinct from host chrome. Keep reasoning outside the
   visual. Do not treat preview data, incidental copy, or a temporary layout as a
   new product requirement.
4. For authorized implementation, follow repository ownership, dependency, i18n,
   component, and test-placement rules. Map semantic tokens centrally and reuse
   existing components. Do not widen a local task into a full-app redesign.
5. Verify non-trivial UI visually in both themes and at desktop/mobile widths.
   Check focus, hover, selection, loading, empty, error, and disabled states where
   applicable. Run checks appropriate to actual code changes; documentation-only
   work needs documentation validation, not an application build.
6. When asked to save an agreed refinement, update this skill so future work can
   reproduce it without screenshots, conversation history, or temporary preview
   files. Keep a single authoritative definition of each design decision.

## Review checklist

- Does the task and primary action lead without making every element compete?
- Is the app layout free of a global top bar, with a distinct sidebar?
- Does each page compose its own breadcrumbs, headings, and relevant actions
  using shared primitives?
- Do page section headers contain only titles, with all actions and supporting
  controls placed outside the header?
- Are global controls in the sidebar and accessible in collapsed/mobile states?
- Is there no divider or shadow beneath the breadcrumbs?
- Do all colors come from the documented palette, with theme aliases selecting
  shades rather than introducing new colors?
- Are text and essential control boundaries contrasted against their actual
  surfaces, including hover and focus states?
- Is Butter intentional and sparse, with dark text on filled controls?
- Is the dark page exactly Ramp charcoal, without a green cast?
- Do charts retain income/expense semantics, labels, signs, patterns, and honest
  scales in both themes?
- Do whitespace, Inter hierarchy, aligned numbers, and quiet surfaces provide
  structure without excessive boxes, shadows, or borders?
- Do controls and data remain usable at narrow widths and with keyboard access?
- Are changes limited to the user's requested scope?

For `/interface-design:design-review`, apply this checklist and report actionable
visual or behavioral findings. For `/interface-design:design-deslop`, refine the
requested scope toward this contract while preserving useful functionality.
