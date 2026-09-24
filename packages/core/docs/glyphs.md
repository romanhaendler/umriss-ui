# Glyphs

The shared character set lives in `src/lib/glyphs/`. The specification stands as
a comment above the module – here it is in short form, followed by the list of
glyphs that deviate from it, which is empty.

## The specification in six points

| # | Rule |
|---|---|
| 1 | Nominal size `0 0 10 10`. A glyph flatter or narrower than a square crops one side (`0 0 10 6`); the longer side stays 10. |
| 2 | Stroke width `1.4` at the nominal size. |
| 3 | `currentColor` – never a colour of its own. |
| 4 | `fill="none"` – it is drawn with the stroke. |
| 5 | `strokeLinecap="round"`, and `strokeLinejoin="round"` where there are bends. |
| 6 | `aria-hidden` – a glyph is decoration. |

**Compliance is checked, not recorded:** the `glyphs.test.ts` of core, table,
schedule and calculation read every component source through `?raw` and hold
each inline `<svg>` to points 1–4 and 6, with the rules once in
`scripts/glyphs.ts`.

The width 1.4 was not chosen because it is the prettiest but because it is the
most frequent: six of the eight crosses in the codebase already carried it.
Since `visuelle-wertigkeit` 03 it is **relative** to the nominal size: a glyph
set at 12 pixels draws a stroke of 1.68 pixels, one set at 9 pixels one of
1.26, and both have the same weight for their size. That is also why the date
pickers' calendar leaf and clock are set at 12 pixels, not the 13 they had: at
13 the relative stroke read heavier than the field's text beside them, and a
pixel less keeps them at the weight of the Modal's close cross and the Toast's
tone symbol, which stand at 12 as well.

Point 1 was sharpened by the same ticket. A chevron that needs six units of
height draws in `0 0 10 6` rather than in its own box of six: the unit stays one
tenth of the nominal size, so its stroke is still 1.4. A box whose longer side
is not 10 is what the check refuses.

The glyph names are English since `english-and-umriss-ui` 15: `CrossGlyph`,
`GripGlyph`, `MeasureGlyph`, `GridGlyph`, `AngleGlyph`, beside `PlusGlyph` and
`MinusGlyph`; `CalendarGlyph` and `ClockGlyph` joined with
`visuelle-wertigkeit` 03. `GridGlyph` depicts a grid, which is a picture and not
the layout grid the **Month grid** entry in `CONTEXT.md` forbids, and
`MeasureGlyph` follows **Measure**.

## What stands in the set

| Glyph | Places |
|---|---|
| `CrossGlyph` | Input, Select, Combobox, DatePicker, DateTimePicker, RangeTrigger (the clearing cross); Alert, Modal, Toast (closing); Tag, MultiSelect chip (removing) |
| `PlusGlyph`, `MinusGlyph` | NumberInput |
| `AngleGlyph` | TreeView; the table's row expander, the schedule's lane-group fold and the calculation's disclosure, through core's public entry |
| `CalendarGlyph` | DatePicker; DateRangePicker with `range` |
| `ClockGlyph` | DateTimePicker, DateTimeRangePicker |
| `GripGlyph` | Dock |
| `GridGlyph`, `MeasureGlyph` | the demo's dock page |

A glyph drawn in more than one place stands here once. The four crosses (Alert
at width 1.5, Tag at 1.6, MultiSelect in a box of 8, Modal and Toast in a box of
12) are one `CrossGlyph` at the size of their place; the calendar leaf and the
clock, each drawn twice at nominal size 14, are one module each. The range
picker's leaf carries a bar across the sheet where it had a small arrow at width
1.1 – at the one stroke width an arrow of that size closes into a blot.

A glyph drawn in **one** place may stay inline in its component, as long as it
keeps the specification – the check reads it there as well: the calendar's
paging arrows, the TimeField's and the ButtonGroup's arrows, the Combobox's
tick, the Toast's tone symbols (whose dots are strokes of no length: a round cap
alone is a dot as wide as the stem), and in `@umriss-ui/table` the sort arrow,
the sortable indicator, the column reordering's arrows and the group fold. The
bar of two places decides whether **moving** something into the set is worth
it, not where a **new** character belongs.

Two notes on the drawing. `GripGlyph` carries its ridges the same way in both of
the dock's orientations, although turning them with it would be prettier: the
acceptance of ADR-0014 rules out a `rotate()` in that component, and a character
that has to be rotated to be right would be rotated along on a change of
orientation. `GripGlyph` is also deliberately not dotted – dots would be fill,
and point 4 draws with the stroke.

## What is not a glyph

These drawings stand in the checks' exception lists by name, each with its
reason; they are not deviations but something else.

| Place | Drawing | Why it is not a glyph |
|---|---|---|
| `Spinner.tsx` | loading ring | Animated, `role="status"`, carries an accessible name. |
| `Sparkline.tsx` | history | A chart: the `viewBox` is the data's extent, with a gradient fill. |
| `Checkbox.tsx` | tick | Carries `pathLength` for the drawing animation and is sized by CSS on a filled box. |
| table, `filter.tsx` | funnel | `fill` switches to `currentColor` when the filter is active – a depiction of state. |

The demo shell's code toggle (`packages/demo/src/Example.tsx`) is outside the
check: the shell is never published, and its chevron stands in every example
picture of all five demos.

## What was **not** taken over

Every character that deviates from the specification, with the reason:

| Place | Character | Deviation |
|---|---|---|

Until `visuelle-wertigkeit` 03 this table had eighteen rows, and the decision
was to write deviations down rather than align them – under the goal of
demonstrable consistency the right trade. Under the goal of a surface that
looks finished it was the wrong one, and the ticket reversed it: the standard
is enforced instead of documented, and the table is empty because nothing is
left to list. It stays, empty, as the place a deviation would have to be
argued for.

## When a new character arrives

Take it from the set. If it is not there, draw it to the specification – in the
set once a second place needs it. A drawing that cannot keep to the
specification fails the check; it passes only by name in its package's
exception list, with its reason – and if it is a character rather than
something that is not a glyph, it goes into the table above as well. Then the
deviation is a decision and not an accident.
