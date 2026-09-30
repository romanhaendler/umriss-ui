# Tighter buttons, and a button that shows only an icon

Status: done
Date:   2026-09-29
Origin: grilling session on `@umriss-ui/core` 0.16.0 ("too much room left and
right inside a button; a pure icon button may be missing"). The terms are in
`CONTEXT.md`: **Icon** (new, the wider set) and **Glyph** (one kind of icon).

## Problem Statement

A button stands 32 px high with 16 px of room on each side, 26 px with 12 px at
`sm` — generous for a library made for data-dense applications (ADR-0035). And
a button that shows only an icon has no form of its own: callers put an
`aria-label` on a `Button` and get a 38 × 26 px oblong, the name is optional,
and a tooltip is theirs to remember. Inside the library about a dozen
components draw such a button by hand, each at its own size (20, 22, 24, 28,
30 px).

## Solution

1. **Room.** `md` keeps 32 px and takes 12 px a side (`--u-space-3`); `sm`
   keeps 26 px and takes 8 px (`--u-space-2`). The gap between icon and label
   stays 8 px. Symmetric, also beside a leading icon.
2. **Icon size.** The button decides the size of an icon among its children:
   14 px at `md`, 12 px at `sm` — a direct `svg` child is set to that box, and
   in an `IconButton` an icon font takes the same size through `font-size`.
   Identical in `Button` and `IconButton`, so an icon beside a label and an
   icon alone are one size.
3. **`plain`**, a fifth variant for both: no ground, secondary text colour;
   hover gives the sunken surface and the text colour, press the pressed
   surface. It is the quiet neutral button every hand-drawn icon button in the
   library already was. `ghost` keeps its accent.
4. **`IconButton`**: square (32 or 26 px), a required `aria-label` that is the
   accessible name and always shows as a tooltip (principle 6 of core's README:
   the name of a root element is spelled `aria-label`), the icon as children, the
   variants and sizes of `Button` with `plain` as default, `loading` replacing
   the icon with the spinner. It is a `Button` underneath — same stylesheet,
   same states, same forced-colours outline.
5. **Tooltip**, fixes in the shared place:
   - it keeps its child's ref instead of replacing it, so a trigger that forwards
     a ref (a menu's anchor through an `IconButton`) still receives its element -
     and `Menu`, which clones its trigger the same way, keeps it too;
   - it does not describe its trigger with the words that already name it (the
     dock announced every tool twice);
   - it opens for keyboard focus only (`:focus-visible`): the Modal's close and a
     menu's trigger take focus after a pointer's action, and a tip there would
     stand over what the pointer had started.
6. **Adopted where a button stands on its own**: the Modal's close, the
   calendar's month paging, the table's row-actions trigger, and the demos.
   Field parts keep their own geometry (clear crosses, steppers, the tag's
   remove, fold carets), and so do the Alert's dismiss (tinted by its tone), the
   Toast's close (sized to its line), the table's header filter and column
   picker tools (a hint that differs from the name), the Breadcrumb's "…" and
   the Dock's tool (its own token, `aria-pressed`, roving focus, measured
   layout).

## User Stories

1. As a developer, I write `<IconButton aria-label="Export CSV"><DownloadIcon /></IconButton>`
   and get a square button with a name, a tooltip and an icon the right size —
   whether the icon is mine, Font Awesome's or lucide's.
2. As a developer, I cannot forget the name: without `aria-label` it does not type-check.
3. As a developer, `IconButton` works as a `Menu` trigger — the menu anchors
   to it, the tooltip gives way while the menu is open.
4. As a screen-reader user, an icon button is announced by its name once.
5. As a user, buttons in a toolbar are compact, and a row of icon buttons is a
   row of equal squares.

## Implementation Decisions

- `IconButton` lives beside `Button` (`components/Button/`), sharing its
  stylesheet; `ButtonVariant` gains `plain`.
- No `xs` size, no `aria-labelledby` or `title` on `IconButton` (either would
  part the name from the tooltip), no way to switch the tooltip off.
- The table's row-actions trigger stays `ghost`: every other action in its row
  is, and the table recolours them together.
- `Button` imports `Tooltip` now, which moves the tooltip's module styles ahead
  in the bundle. They style only the tooltip's own panel, so no rule of equal
  specificity changes places (docs/testing.md, "The order of exports").
- The SplitButton's menu trigger stays a narrow segment of its group (8 px a
  side around its arrow), not a square: it is part of the split button, not
  an icon button beside it. Its arrow keeps its 9 × 6 box.

## Testing Decisions

- Unit: `IconButton` names itself, shows its name as tooltip without
  describing itself twice, forwards its ref through the tooltip, locks and
  replaces the icon while loading, works as a `Menu` trigger. Tooltip: keeps the
  child's ref; no `aria-describedby` when the content equals the name.
- Visual: every moved baseline looked at on its own; a new demo page.

## Out of Scope

- The field parts and the stand-alone exceptions above.
- Icons shipped by the library beyond the glyph set.

## Comments

Delivered on 2026-09-29 (`@umriss-ui/core` 0.17.0, with table 0.7.4, schedule
0.3.8 and calculation 0.4.1 moving their core peer range).

- The review found the first draft's `label` against principle 6 of core's
  README (ADR-0015): the name is `aria-label`, required as `Tag` requires it.
  It found `Menu` replacing its trigger's ref as the tooltip had; both now keep
  it through one helper, `lib/elementRef.ts`.
- The icon size became two tokens (`--u-icon-size`, `--u-icon-size-sm`), which
  the loading spinner takes as well; the numbers in `Button.tsx` are gone.
- Opening a tooltip for keyboard focus only (`:focus-visible`) was added during
  the work, not grilled: without it the Modal's close showed its tip whenever a
  pointer opened the dialog, and a menu's trigger whenever the menu closed.

Follow-up on 2026-09-30: the user still found 12/8 px roomy. A rendered
comparison of 12/8, 10/6 and 8/6 px (the published buttons, only the padding
overridden) was put before them; they chose 10/6. It ships as the tokens
`--u-button-padding` and `--u-button-padding-sm` in core 0.18.0, read by the
two hangs that had repeated the number.
