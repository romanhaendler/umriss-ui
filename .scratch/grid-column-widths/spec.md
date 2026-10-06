# Grid columns of their own widths

Status: done

## Problem Statement

A screen often needs columns that are not equally wide: a column of labels
beside a column of values, a list of tours beside the chosen tour. `Grid` cannot
say that. `columns={n}` gives n equal columns, `minItemWidth` as many equal
columns as fit - every column is as wide as every other.

`style={{ gridTemplateColumns: "140px 1fr" }}` works, since `style` is spread
last, and the page says so ("for the rest of flexbox and grid, set `style`").
But it is the one place where a caller has to write CSS of their own to lay out
a screen, raw CSS beside props that are otherwise all words. And a bare `1fr`
is not what `Grid` itself writes: `Grid` writes `minmax(0, 1fr)`, so that a long
line cannot push its column wider than its share. A caller who copies `1fr`
loses that guard without knowing it existed.

## Solution

`columns` takes, besides a count, a list with one width per column:

```tsx
<Grid columns={[140, "fill"]} gap={3}>
  <Text tone="muted">Owner</Text>
  <Text>Rafael Ortiz</Text>
  ...
</Grid>
```

A number is a width in pixels; `"fill"` is a share of what the fixed columns
leave. The length of the list is the number of columns.

## User Stories

1. As an application developer, I want to give each column of a `Grid` its own width, so that labels and values, or a list and its detail, stand side by side without CSS of my own.
2. As an application developer, I want a number in the list to be a width in pixels, so that a column of labels stays as wide as I set it, whatever the grid's width.
3. As an application developer, I want `"fill"` in the list to take a share of what the fixed columns leave, so that the remaining space goes to the content.
4. As an application developer, I want several `"fill"` columns to share the rest equally, so that `[240, "fill", "fill"]` gives one fixed and two equal columns.
5. As an application developer, I want a `"fill"` column never pushed wider than its share by a long line, so that one value does not break the layout (ADR-0041).
6. As an application developer, I want the length of the list to be the number of columns, so that count and widths can never contradict each other.
7. As an application developer, I want `minItemWidth` to win over a list as it wins over a count, so that one rule holds without an exception.
8. As an application developer who passes a number or nothing, I want `Grid` to behave exactly as in 0.27, so that no existing screen changes.
9. As an application developer, I want the page to show a grid of its own widths, so that I find the way without reading the source.
10. As a reader of the page, I want "fixed columns" to keep meaning a fixed count, so that one word does not stand for two things on one page.

## Implementation Decisions

- **One prop, not two.** `columns?: number | readonly GridColumnWidth[]`. A
  separate `widths` prop beside `columns` would raise the question what
  `columns={3} widths={[140, "fill"]}` means; a list answers count and width
  at once.
- **A closed vocabulary.** `type GridColumnWidth = number | "fill"`, exported
  and listed under "Types on this page". A number becomes `<n>px`, `"fill"`
  becomes `minmax(0, 1fr)` - the same track `Grid` writes for a count today.
  No CSS strings (`"1fr"`, `"12rem"`, `"auto"`): they would let a bare `1fr`
  through without its guard and bring raw CSS back inside a prop. `"fill"`
  follows `Sparkline`'s `width?: number | "fill"`; it is the library's word for
  "take the place you are given".
- **The name** is `GridColumnWidth`, not `ColumnWidth`, which would read as the
  table column's `width` - pixels only, without `"fill"`.
- **`minItemWidth` still wins**, over a list as over a count. No union type
  excludes the combination; the doc comment says it.
- **No shrinking.** A fixed column stays fixed on a narrow screen; there are no
  breakpoints (the page's known limit stands). Whoever wants columns to wrap
  takes `minItemWidth` or their own stylesheet.
- **An empty list** is not caught; it behaves as `columns={0}` does today.
- **Doc comments.** `columns`: "How many columns, all of one width - or a list
  with one width per column: a number in pixels, or `"fill"` for a share of
  what is left. Overridden by minItemWidth." `minItemWidth`: "...; wins over
  `columns`, a list included." The component's header comment names both
  forms.
- **Demo.** A new example on the Stack and Grid page after "Columns by width":
  **"Columns of their own widths"** - a cost centre's key figures, a `140` px
  column of labels beside a `"fill"` column of values. Its lead sentence says
  that a number is pixels, `"fill"` the rest, and that `minItemWidth` wins over
  the list. The existing example "Fixed columns" keeps its name and meaning
  (a fixed count). The page's intro sentence "for the rest of flexbox and grid,
  set `style`" stays: it still holds for everything else.
- **Glossary and ADR:** none. `"fill"` already lives in `Sparkline` without an
  entry, and the vocabulary can be widened later (ratios, `auto`) without
  breaking anything.
- **Changelog:** an "Added" entry in core's changelog; the release (core
  0.28.0) runs separately.

## Testing Decisions

A good test checks what a caller can observe - boxes on the page - never the
style string that produces them.

- **Layout seam (Playwright, the Sizes behaviour spec `features-sizes.spec.ts`)**,
  on the new example: the label column is 140 px wide; the value column's left
  edge lies one gap to the right of it and its right edge on the grid's; at
  320 px viewport the label column is still 140 px and no value cell reaches
  past the grid's right edge (the `minmax(0, …)` guard). Prior art: the field
  and segmented control width tests in the same spec (ADR-0041).
- **Unchanged behaviour:** the existing examples "Fixed columns" and "Columns
  by width" keep their screenshot baselines unchanged - that is the 0.27
  promise.
- **Screenshots:** the new example in the light and the dark theme joins the
  screenshot baselines, the page baselines are redrawn for the added example.
- **Forced colours:** the page's forced-colours baselines are redrawn if the
  added example moves them; the grid draws nothing of its own.
- **Types:** the typecheck covers `columns={[140, "fill"]}` through the
  example; a `columns={["1fr"]}` would not compile.

## Out of Scope

- Ratios (`2fr 1fr`), `auto`/`max-content` columns, CSS lengths other than
  pixels - added to `GridColumnWidth` when a screen asks for them.
- Breakpoints, or fixed columns that shrink on narrow screens.
- Widths for rows (`gridTemplateRows`).
- A configurator for Stack and Grid; the page has none today.
- The table's column `width` - a different thing in a different package.

## Further Notes

Decided in a grilling session on 2026-10-06. The phrase "feste Spaltenbreiten"
from the request became "columns of their own widths" on purpose: "fixed" on
this page already means a fixed count.
