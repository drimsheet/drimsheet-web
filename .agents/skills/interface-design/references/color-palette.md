# Drimsheet color palette

Status: approved by the user for application CSS and component color mappings.
Keep implementation scoped to the user's current request.

## Palette construction

Six reusable families define the available colors, independent of components.
Use names such as `butter-400` and `neutral-900`, not `button-yellow` or
`secondary-500`. Primary and secondary are semantic roles, not hue families.

- Every chromatic family has shades 50 through 950 as listed below. Higher
  numbers are darker. Matching numbers across families do not guarantee equal
  lightness or accessible contrast.
- Neutral adds 0 and 1000 for the warm near-white and deepest charcoal endpoints.
  Light shades retain the warm paper character; dark shades become nearly
  achromatic, without an olive cast.
- Butter retains the approved brand yellow at 400. Neutral retains the approved
  near-white at 0, Ramp charcoal at 950, and sidebar charcoal at 1000.
- Green and terracotta retain the existing financial anchors at 300 and 600.
  Blue is muted steel blue; amber is warmer and more orange than Butter so
  warnings do not reuse the brand yellow.
- Chromatic steps were interpolated in OKLab between selected anchors, with
  chroma reduced where needed to fit sRGB. Neutral steps were tuned separately.
  All six ramps have strictly descending OKLab lightness. This hex table is the
  canonical specification; do not regenerate it at runtime.
- These are custom Drimsheet scales, not an imported MUI or Tailwind palette.

## Canonical shade values

| Shade | Neutral   | Butter    | Green     | Terracotta | Blue      | Amber     |
| ----- | --------- | --------- | --------- | ---------- | --------- | --------- |
| 0     | `#FFFEFA` | —         | —         | —          | —         | —         |
| 50    | `#F8F7F2` | `#FFFCED` | `#F0F8F2` | `#FCF3EF`  | `#F0F6FB` | `#FFF8E9` |
| 100   | `#EFEEE8` | `#FDF8DD` | `#DBEBE0` | `#F5DFD7`  | `#DCEAF4` | `#FBEDD1` |
| 200   | `#E4E3DC` | `#FAEEBC` | `#B0D2BD` | `#E6B7A9`  | `#B5D1E6` | `#F2D59F` |
| 300   | `#C3C1BA` | `#F7E599` | `#86B99B` | `#D58F7C`  | `#8EB9D8` | `#E9BE6A` |
| 400   | `#999790` | `#F4DB72` | `#6AA183` | `#C87E6A`  | `#709DBE` | `#CEA04F` |
| 500   | `#77756F` | `#D2B34E` | `#4F8A6B` | `#BA6C59`  | `#5281A5` | `#B48334` |
| 600   | `#5F5E58` | `#B08C28` | `#327354` | `#AD5B48`  | `#35668C` | `#9A6714` |
| 700   | `#45433F` | `#896D24` | `#285D44` | `#884739`  | `#2B5272` | `#7B5314` |
| 800   | `#302E2B` | `#63501F` | `#1E4835` | `#65342A`  | `#214059` | `#5E3F13` |
| 900   | `#252323` | `#403418` | `#153527` | `#45221C`  | `#182E41` | `#422D10` |
| 950   | `#1A1919` | `#302714` | `#102B20` | `#351A15`  | `#132536` | `#35240E` |
| 1000  | `#121111` | —         | —         | —          | —         | —         |

## Selection and theme aliases

Primitive values stay identical in both themes. Theme aliases select shades;
they introduce no additional hex values. Components consume these shared aliases
for common roles. Direct primitive selection is appropriate for a specific data
series or documented local role; do not scatter raw hex literals or independently
reimplement theme switching.

Use opaque shades for normal, hover, and pressed states. An opacity modifier
creates a new composite color whose contrast depends on the underlying surface;
it is not a substitute for choosing a tested shade.

These mappings consolidate near-identical surfaces and text colors into the
shared palette.

| Role / alias                     | Light                     | Dark                      |
| -------------------------------- | ------------------------- | ------------------------- |
| Page / background                | neutral-0                 | neutral-950               |
| Foreground                       | neutral-900               | neutral-100               |
| Sidebar                          | neutral-100               | neutral-1000              |
| Sidebar foreground               | neutral-600               | neutral-300               |
| Card / muted surface             | neutral-50                | neutral-900               |
| Card foreground                  | neutral-900               | neutral-100               |
| Popover                          | neutral-0                 | neutral-900               |
| Popover foreground               | neutral-900               | neutral-100               |
| Input surface                    | neutral-50                | neutral-1000              |
| Muted foreground                 | neutral-600               | neutral-400               |
| Quiet border / gridline          | neutral-200               | neutral-800               |
| Input / essential control border | neutral-500               | neutral-500               |
| Focus ring                       | neutral-600               | neutral-400               |
| Primary / brand-primary          | butter-400                | butter-400                |
| Primary foreground               | neutral-900               | neutral-900               |
| Primary hover / pressed          | butter-300 / butter-200   | butter-300 / butter-200   |
| Secondary                        | neutral-900               | neutral-100               |
| Secondary foreground             | neutral-0                 | neutral-900               |
| Secondary hover / pressed        | neutral-800 / neutral-700 | neutral-200 / neutral-300 |
| Accent / subtle hover surface    | neutral-100               | neutral-800               |
| Accent foreground                | neutral-900               | neutral-100               |
| Sidebar active fill              | butter-400                | butter-950                |
| Sidebar active foreground        | neutral-900               | butter-400                |
| Link text                        | neutral-900               | butter-400                |
| Financial income marks           | green-600                 | green-300                 |
| Financial expense marks          | terracotta-600            | terracotta-300            |
| Neutral comparison marks         | neutral-500               | neutral-400               |
| Chart track                      | neutral-200               | neutral-800               |

Primary hover lightens Butter to preserve dark-text contrast; secondary hover
uses a neighboring neutral shade. Secondary foreground belongs on secondary
fills, not muted surfaces. Apply this pairing rule to every foreground/background
role. A secondary button or profile avatar consumes the same role pair without
requiring an avatar-specific color.

## Feedback roles

Financial meaning and feedback meaning retain separate semantic aliases even
when drawing from one family. An expense is not an error; an income is not a
success message. Labels, icons, and patterns must preserve the distinction.

| Feedback role       | Family     | Light fill / text              | Dark fill / text                |
| ------------------- | ---------- | ------------------------------ | ------------------------------- |
| Success             | green      | green-50 / green-700           | green-950 / green-300           |
| Error / destructive | terracotta | terracotta-50 / terracotta-700 | terracotta-950 / terracotta-300 |
| Information         | blue       | blue-50 / blue-700             | blue-950 / blue-300             |
| Warning             | amber      | amber-50 / amber-700           | amber-950 / amber-300           |

For solid destructive actions, use terracotta-700 with neutral-0 text in light
mode and terracotta-300 with neutral-950 text in dark mode. Feedback borders
that identify a control use the family's 600 shade in light mode and 300 in dark
mode. Do not use terracotta-600 for small text on terracotta-50: that pair is
only 4.40:1. Its financial data-mark role has a different contrast requirement.

## Contrast guardrails and verification

Select pairs, not isolated colors. Check normal text at 4.5:1, large text at
3:1, and essential control boundaries/data marks at 3:1 against their actual
adjacent surfaces. Decorative dividers need not look like control outlines.
See [WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
and [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

Calculated sRGB contrast examples (rounded):

| Pair                                   | Ratio   |
| -------------------------------------- | ------- |
| neutral-900 on butter-400              | 11.33:1 |
| neutral-0 on neutral-900               | 15.49:1 |
| neutral-900 on neutral-100             | 13.45:1 |
| neutral-600 on neutral-100             | 5.60:1  |
| neutral-400 on neutral-900             | 5.35:1  |
| neutral-500 border against neutral-900 | 3.39:1  |

These checks cover specified pairs, not every combination or application-wide
accessibility. At implementation time, inspect all consumers of changed aliases,
especially translucent filter chips, focus rings, gradients, charts, and status
treatments. Verify rendered normal, hover, focus, and disabled states in both
themes.
