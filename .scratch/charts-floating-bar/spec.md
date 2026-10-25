# A floating bar: `baseline` on `Bar`

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket 22 "The charts' single wishes" (its Answer accepts
the Proposed answer: the waterfall and the error bars as a channel, not a kind); findings
`.scratch/shakedown/reports-bi.md` 5 and its waterfall wish, `data-science.md` (statistical views: error
bars gave up); ADR-0011, ADR-0048, ADR-0059.

## Problem Statement

A bar always stands on zero, or on the stack below it. Two things a report needs are therefore built from
helper series, and the helpers leak:

- **A waterfall** is stacked bars with an invisible base series. The tooltip, the readout and the data table
  then name values that are no reading: "Basis 1,200", "Summe 0", "Rückgang 0" (`reports-bi.md` 5).
- **Error bars** have no mark. A thin `BoxPlot` looks right, but its tooltip says "quartile" for the
  bounds of a confidence interval, and that is false.

An area can already be drawn between two values (`Area baseline`), and its data table writes such a
corridor by both edges. A bar cannot.

## Solution

**`Bar` takes `baseline`, as `Area` does: a bar from one value to another.** It is a named channel, not a
new kind, so ADR-0059's test is not run.

- The tooltip, the readout and the data table write a bar with a `baseline` by both edges, "1,200 – 1,450".
  An `Area` with a `baseline` gets the same tooltip and readout, which today name only its upper edge.
- Both edges are the series' extent; zero is not, unless an edge is zero.
- A floating bar is never in a stack: in a stack the stack below is the baseline, and the series' own is
  not read, as on `Area`.
- **A waterfall** is then a running sum, three lines of the application's, and one `Bar`.
- **Error bars** are a thin floating bar for the interval and a `Scatter` for the estimate. Range bars, a
  minimum to a maximum per hour, are the same bar.
- **Baseline** in `CONTEXT.md` widens to bars.

## User Stories

1. As a report author, I want a waterfall from one `Bar` with a `baseline`, so that no helper series exists to
   leak into the tooltip.
2. As a report author, I want each step of a waterfall to read "from – to" in the tooltip, so that the reader
   sees where the step started and where it ended.
3. As a report author, I want a fall to read from its higher to its lower edge, so that the direction of the
   step stays in the text.
4. As a report author, I want the start and end totals of a waterfall to be bars from zero in the same
   series, so that the whole waterfall is one series with one name.
5. As a reader of a waterfall, I want the readout after a key to say the same as the tooltip, so that a
   screen reader hears both edges too.
6. As a reader of a waterfall, I want the data table to list one row per step with both edges, so that no row
   names a helper value.
7. As a data scientist, I want error bars from a thin floating bar and a `Scatter`, so that an estimate and
   its interval read correctly without a box plot's words.
8. As a data scientist, I want the tooltip of an error bar to name the interval's two bounds, not
   "quartile", so that the tooltip states what was computed.
9. As an engineer, I want a range bar from the hour's minimum to its maximum, so that a spread per hour
   reads at a glance.
10. As a reader of an area corridor, I want its tooltip to name both edges, as its data table does, so that
    the tooltip and the table agree.
11. As a developer writing a tooltip `render`, I want a hit to carry the baseline's value under its own
    name, so that my own tooltip can write both edges.
12. As a developer, I want `baseline` on a bar to take a field name or a function, as `value` does, so that
    the compiler checks it.
13. As a developer, I want the y axis to show both edges of every floating bar, so that no bar is cut off,
    and not to force zero in when no bar touches it.
14. As a developer, I want a `baseline` on a bar in a stack not to be read, as on an area, so that the two
    kinds follow one rule.
15. As a reader under `encoding="marks"` or forced colours, I want a floating bar told apart as any bar is, so
    that placement changes nothing about how it is drawn.
16. As a maintainer, I want the glossary's **Baseline** to say that a bar has one too, so that the word means
    one thing across kinds.

## Implementation Decisions

- **The prop.** `baseline?: Value<T>` on `BarProps`, read like `Area`'s: a number field or a function.
  `null`, `undefined` or a value that is not finite in either edge is a gap, and the bar is left out.
- **The channel.** It fills the materialised baseline channel (`y0`), which an area's `baseline` and a
  stack's foot already fill (ADR-0011: the channel is the baseline's, on every kind that has one).
- **Drawing.** A bar is drawn from its baseline to its value, either way up. The width, the group and the
  hatch are those of any bar. The hit rectangle is the drawn one.
- **The extent** is both edges. A fixed foot at zero is added only for a bar without a `baseline`.
- *(agent)* **With `stack` or `normalize`** the series' own `baseline` is not read. That is `Area`'s rule,
  and its doc comment is copied. There is no compile-time exclusion: a second union beside `OneLane` would
  buy little for a misuse that draws a plain stacked bar.
- **The tooltip and the readout.** A series with its own baseline channel, an `Area` or a `Bar` outside a
  stack, is written "baseline – value" in its format: the order of reading, so a fall reads from high to
  low. The data table already writes a corridor so; the tooltip and the readout follow it.
- **`TooltipPoint`** gains `baseline?: number`. It is present only where the series has a baseline of its
  own; a stack's foot is never put there, because a stack's foot is no reading. A field of its own, as
  `level` and `box` have (ADR-0011).
- **Change detection.** The series comparison compares `baseline` on a bar as it does on an area: a field
  name by name, a function by its source text. Where `.scratch/dev-warnings/` ticket 03 has landed, its
  probe covers a bar's `baseline` as it covers an area's.
- **`CONTEXT.md`, Baseline** (the charts entry, not the screenshot one) reads:

  > **Baseline**:
  > The value a filled mark is drawn back to — zero for a bar or an area, or a second value (`baseline`) on
  > either: an area between two courses, a bar floating from one value to another. A baseline is part of
  > the series' extent, so an axis that carries a filled mark always shows it. In a **Stack** the stack
  > below is the baseline, and a series' own is not read.
  > _Avoid_: zero line, Nulllinie (which is the grid line at y = 0), floor

- **No ADR.** It is a channel a kind already has, and cheap to keep.
- **Docs.** The doc comment of `Bar` and of `baseline`, `API.md`, the capability record's Bar, Area and
  Tooltip rows, and the changelog: "Added" for `Bar baseline` and `TooltipPoint.baseline`, "Changed" for the
  area corridor's tooltip, with its migration line (a `render` that wants the old text reads `yValue`).

## Testing Decisions

- A good test asserts what a reader sees and reads: the bar's rectangle, the tooltip's and the data table's
  text, the axis' extent. It does not assert on the materialised channels' layout beyond the existing
  named-channel test.
- **Units:** materialisation (prior art: `materialize.test.ts`) fills `y0` for a bar with a baseline, takes
  both edges into the extent, and leaves zero out; the draw test (prior art: `draw.test.ts`, bars) draws a
  rise and a fall between their edges; the stacking test (prior art: `stack.test.ts`) shows a stacked bar
  ignoring its own `baseline`.
- **jsdom:** the tooltip-format test (prior art: `tooltipFormat.jsdom.test.tsx`) writes "1,200 – 1,450" for a
  floating bar and for an area corridor; the readout test (prior art: `readout.jsdom.test.tsx`) says the
  same; the data table test (prior art: `dataTable.jsdom.test.tsx`) lists both edges and no helper.
- **Types:** `useChart.test-d.tsx` accepts `baseline="field"` on `Bar` and refuses a field that is not a
  number.
- **Gates:** the props gate (`baseline` on `Bar` shown in an example), the demo smoke test, and each new
  example's screenshots in both themes, reviewed as new baselines.

## Out of Scope

- A waterfall kind, a whisker or error-bar mark of its own: each would be a kind under ADR-0059, with its
  ADR. Not proposed unless the examples fail.
- A colour per bar (rises and falls in two colours). Two bar series on one axis stand side by side, and a
  floating bar is never in a stack, so a waterfall is one colour. Its edges say which way a step goes.
- The connector lines between a waterfall's steps.
- Caps on an error bar's ends.
- A floating bar inside a stack.
- Horizontal bars (ADR-0059's first kind to come).

## Further Notes

- The first ticket builds the channel and the waterfall; the second adds the error bars, a second use of the
  same channel with a `Scatter` beside it.
- `.scratch/dev-warnings/` ticket 03 probes the series comparison, which ticket 01 here extends; 01 waits
  for it, so that the two do not edit the comparison at once.
- `.scratch/root-contract/` ticket 05 renames `ariaLabel`; new examples use the name `Chart` takes when they
  land.
- `.scratch/chart-range-selection-and-navigator/` ticket 04 adds examples to the Bar page; an example file
  takes the next free number when it lands.
