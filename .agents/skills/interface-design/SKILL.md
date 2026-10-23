---
name: interface-design
description: Design, build, review, or refine Drimsheet product interfaces using its approved Butter brand accent, light and Ramp charcoal themes, navigation hierarchy, and semantic financial charts. Use for dashboards, forms, settings, data interfaces, layout, tokens, states, and visual consistency. Not for marketing pages, campaigns, or brand-only work.
---

# Interface Design

This is the self-contained design contract for Drimsheet. The theme, navigation,
and hybrid chart system below are approved decisions. Apply them without
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
- Make navigation distinct, while allowing the header and main content to read
  as one continuous page.
- Favor flat surfaces, quiet hairlines, and modest tonal steps. Avoid decorative
  gradients, dramatic shadows, oversized icons, and a card around every section.
- Retain recognizable workflows and useful information density. Do not invent
  metrics, controls, or features merely to fill a composition.
- Consistency matters more than novelty. Reuse established patterns; adapt their
  layout to the task rather than generating a different visual identity per page.

## Approved theme tokens

Butter is **`#F4DB72`**. The dark main page is **Ramp charcoal `#1A1919`**.
Keep the dark neutral surfaces free of an olive or green cast. The financial
income green belongs in data marks, not in page backgrounds.

These values define semantic roles. When implementing, bind them to the existing
shared theme and component tokens; do not scatter literal colors through JSX or
create a parallel styling system. Inspect current token consumers before mapping
roles, especially where brand, financial data, and destructive actions currently
share a variable.

| Role                           | Light     | Dark      |
| ------------------------------ | --------- | --------- |
| Page and top header            | `#FFFEFA` | `#1A1919` |
| Sidebar                        | `#EFEEE8` | `#121111` |
| Supporting panel               | `#F4F3ED` | `#252323` |
| Inset input surface            | `#F8F7F2` | `#161515` |
| Primary text                   | `#282923` | `#F1EFED` |
| Secondary text                 | `#70716A` | `#B3B0AE` |
| Inactive navigation text/icons | `#5F6059` | `#C3C1C0` |
| Quiet divider/gridline         | `#E4E3DC` | `#3B3737` |
| Secondary control border       | `#D5D5CB` | `#4A4545` |
| Brand / primary action fill    | `#F4DB72` | `#F4DB72` |
| Text/icon on primary action    | `#282923` | `#252323` |
| Active navigation fill         | `#F4DB72` | `#332E24` |
| Active navigation text/icon    | `#282923` | `#F4DB72` |
| Financial income / money in    | `#327354` | `#86B99B` |
| Financial expense / money out  | `#AD5B48` | `#D58F7C` |
| Neutral comparison / reversal  | `#79736C` | `#A19C97` |
| Chart track                    | `#EAE7DE` | `#343131` |
| Subtle row hover               | `#F2EFE5` | `#292626` |

Use Butter sparingly on the main action, active navigation, and deliberate
selection cues. Use dark text on Butter-filled controls, not white. It is not a
large page wash or the default color for financial chart series.

Financial expense is a data role, not an error state. Keep destructive actions,
validation errors, and financial expense independently named even if a future
theme shares some primitives. Positive and negative changes need context: an
expense increase is not automatically good, and every reversal is not an error.

## Navigation and page composition

- **Sidebar:** use its distinct surface in both themes. Do not make it the same
  color as the page. Use small monochrome icons, aligned labels, and quiet group
  captions; preserve the application's information architecture.
- **Active navigation:** Butter fill with dark text in light mode. In dark mode,
  use the muted warm selection fill with Butter text/icon so the navigation does
  not compete with the main action. Include a non-color indication such as
  weight and `aria-current`.
- **Top header:** exactly the same surface as the main application page. No
  contrasting header band, bottom border, shadow, or outline under breadcrumbs.
  Spacing separates breadcrumbs from the page title.
- **Tabs:** a quiet baseline and short active underline may remain where they
  explain a real tab group. The removed breadcrumb divider is not a ban on
  functional separators elsewhere.
- **Content:** title and purpose first, then the task. Keep secondary upload/help
  panels quieter than the working form. Present related metrics as an aligned
  group rather than an obligatory grid of separate cards.
- **Tables:** restrained row separators, aligned amounts, and understated hover
  feedback. Keep essential actions available without hover.
- **Responsive layout:** reflow controls and panels before shrinking text. Collapse
  the sidebar through the existing accessible navigation pattern. Contain wide
  table scrolling without introducing horizontal page overflow.

## Typography, spacing, and depth

Retain **Figtree** for UI and headings. Use regular body text, medium labels and
headings, and selective semibold emphasis. Hierarchy comes from size, weight,
contrast, and space together; do not apply a marketing-style single-weight rule.
Use tabular numerals for amounts and other aligned or changing numbers.

Starting points from the approved direction, adaptable to the component:

- Body and controls: 13–14px; supporting labels: 11–12px; section titles: 16px;
  page titles: 28–32px. Keep supporting text readable and support zoom.
- Use a 4px spacing base, typically 8–12px within controls, 16–24px within groups,
  and 28–32px between major sections. Give related fields tighter spacing than
  unrelated sections.
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

## Hybrid financial charts

The approved system combines **Butter for UI identity** with **muted green for
income** and **terracotta for expenses**. Neutral gray is for comparisons,
inactive data, and reversals. Do not revert financial series to the earlier
Butter/graphite exploration or assign a decorative color to every category.

### Meaning and encoding

- Revenue, income, money in, and shares of an income category use the income
  token. Expense categories and money out use the expense token.
- Preserve the series identity across charts, legends, tooltips, and themes.
  Light and dark variants adjust contrast, not financial meaning.
- Counterparty shares inherit the owning category's income/expense role. Names
  and direct labels distinguish counterparties; a rainbow is unnecessary.
- Keep ordinary amounts, axis labels, and summary numbers in neutral text.
  Colored marks and small legend swatches carry the financial signal.
- For paired cash flow, use solid income bars and hatched expense bars, with
  explicit labels. Color alone must not carry the distinction.
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
axis. Retain solid-versus-hatched encoding, named legends, and exact amounts in
tooltips or an accessible data view. Do not draw ordinary money out below zero
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
  Verify color contrast against the actual theme; patterns and text remain
  necessary even when both colors individually contrast well with the page.

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
- Is the sidebar distinct while the header and page remain continuous?
- Is there no divider or shadow beneath the breadcrumbs?
- Is Butter intentional and sparse, with dark text on filled controls?
- Is the dark page exactly Ramp charcoal, without a green cast?
- Do charts retain income/expense semantics, labels, signs, patterns, and honest
  scales in both themes?
- Do whitespace, Figtree hierarchy, aligned numbers, and quiet surfaces provide
  structure without excessive boxes, shadows, or borders?
- Do controls and data remain usable at narrow widths and with keyboard access?
- Are changes limited to the user's requested scope?

For `/interface-design:design-review`, apply this checklist and report actionable
visual or behavioral findings. For `/interface-design:design-deslop`, refine the
requested scope toward this contract while preserving useful functionality.
