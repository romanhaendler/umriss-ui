# 05 — `<Stat>`, the tile that reads a limit

Status: done

Spec: `.scratch/judging-values/spec.md`
Blocked by: 01

## Scope

The commonest object on a plant dashboard, as one component.

- **The name is `<Stat>`.** Not `Metric`: this package already exports `Meter`,
  and two exported names one letter apart, both about numbers, both appearing in
  the same import, is a defect waiting for a tired reader.
- **Props**: a value, a unit, a label, an optional target, an optional limit set,
  an optional series for the sparkline.
- **With a limit set it derives its verdict and colours itself.** Without one it is
  neutral — the honest rendering of a number nobody has given a rule for. The
  caller never passes a tone.
- **The verdict is carried in text as well as in colour.** A short marker beside
  the value, from `wortlaut`, and in the tile's accessible name. Colour alone
  fails the accessibility suite and would rightly do so.
- **An unknown verdict renders as unknown**: a placeholder in the value slot and
  the reason in text. Not an empty tile, not a zero, not a dash that could be
  mistaken for a value.
- **No trend arrow.** A direction computed from two points of a noisy signal is
  noise with an arrowhead and reads as information. Where a target exists the tile
  shows the deviation from it, which is a fact. A caller who wants the shape passes
  the series and gets the sparkline.
- **No row or group component.** `<Stat>` uses a fixed internal grid so tiles of
  equal width align their labels, values and units with no wrapper. A row of tiles
  is a layout problem this package already solves.
- The value uses the monospaced face with tabular figures, so a value updating in
  place does not shift its neighbours.
- New `wortlaut` entries: the four verdicts, the unknown placeholder, the target
  label, the deviation phrasing. Parameterised entries are functions, per the
  module's existing convention.

## Acceptance

- jsdom: the accessible name carries the label and the verdict, for all four
  outcomes.
- jsdom: the unknown rendering shows the placeholder and the reason, and does not
  show a number.
- jsdom: the unit is present in the text; the sparkline is absent when no series
  is given.
- jsdom: passing a limit set and a value beyond an actionable limit produces the
  alarm rendering — assert the observable text and role, never the class name that
  produced the colour.
- A screenshot tile shows a row of `<Stat>` in all four verdicts, with and without
  a sparkline, in both themes.
- axe passes at WCAG 2.1 AA in both themes with **no new suppression entry**. If a
  verdict colour pair fails contrast, the colour changes.
- Any new token pair is added to the existing token contrast test.

## Notes

The `tone` prop is the thing to leave out, and it will be asked for. The whole
point of the tile is that the rule moved out of the call site; a tone prop puts it
back and does it in a way that looks like flexibility.

The unknown state is the reason this component exists rather than being a `Card`
with a number in it. Build it first and the rest of the tile arranges itself
around it.
