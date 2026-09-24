# 03 — One stroke width

Status: done

Blocked by: 01

## Delivery

- **Stock before** (recounted across core, table, schedule, calculation, the
  charts' DOM and the demo shell): 35 inline `<svg>` drawings (7 of them the set), **7 stroke
  widths** (1.1 · 1.3 · 1.4 · 1.5 · 1.6 · 1.8 · 2) in **8 viewBoxes**
  (`0 0 10 10`, `14 14`, `12 12`, `10 6`, `10 8`, `8 8`, `16 16`, `10 12`,
  plus the Sparkline's data box). Charts draw on canvas and have none;
  calculation already took `AngleGlyph` from core.
- **Stock after**: every glyph at **1.4** in a box whose longer side is 10
  (`10 10`, `10 8`, `10 6`). Outside it only the four named non-glyphs.
- **The check** – written first and red with 32 offences in core alone:
  `scripts/glyphs.ts` (the rules, once) and a `tests-unit/glyphs.test.ts` in
  core, table, schedule and calculation, each globbing its own `src/**/*.tsx`
  through `?raw` as the table's `styleGuard.test.ts` does. It checks the
  viewBox, every `strokeWidth`, `fill`, `stroke` and `aria-hidden`. Named
  exceptions with reasons: Spinner, Sparkline, Checkbox tick (core), filter
  funnel (table). Not in `stylesheets.test.ts` as the ticket said: that file
  was being changed in parallel, and a file of its own per package follows
  the guard pattern.
- **The value stays 1.4**, relative (point 1 sharpened: a glyph crops the box
  rather than shrinking the unit). It reads right on the 8–10 pixel marks that
  are nearly all glyphs. Where it did not – the date pickers' leaf and clock at
  13 pixels read heavier than the field's text at 1.82 pixels – the display
  size went to 12 rather than the width down: 11 read too small, 12 sits with
  the Modal's cross and the Toast's tone symbol.
- **Merged**: all crosses into `CrossGlyph` (Alert, Modal, Toast, Tag,
  MultiSelect); `CalendarGlyph` (`range`) and `ClockGlyph` new in the set,
  exported from core's public entry (it already exported the set) and noted
  in the CHANGELOG; the table's expander and the schedule's fold use core's
  `AngleGlyph` through the public entry. Single-place glyphs stay inline and
  pass the check. The demo shell's code chevron is left out: never published,
  and in every example picture of all five demos.
- `packages/core/docs/glyphs.md`: specification kept, divergence table empty,
  one sentence on where compliance is checked.
- **Screenshots**: at the suite's own tolerance nothing fails against the
  checked-in baselines. At zero tolerance against a reference rendered from the
  sources before this ticket, 90 pictures move, all glyph pixels: the date
  pickers' fields (core, 16), the Tag's crosses, the Alert's dismiss, the
  table's group folds, expanders, sort arrows and a date picker in a table
  (table, 66 including the 14 of the grouping matrix), the schedule's lane-group fold
  (4) - plus one dark dock picture whose `GridGlyph` did not change, noise.

Spec: `.scratch/visuelle-wertigkeit/spec.md`

**Rolls back a recorded decision: `packages/ui/GLYPHEN.md`.** See "Why this
reverses the decision made there" below. This reversal is deliberate, justified
and part of the acceptance — not a side effect.

## Scope

All glyphs of the library on **one** stroke width and a uniform nominal-size
ratio, held by a check rather than by a document.

The stock:

- **7 stroke widths** across 36 entries in 28 SVG elements: 1.1 · 1.3 · 1.4 · 1.5 · 1.6 · 1.8 · 2
- **8 nominal sizes**: `0 0 10 10` (9×), `0 0 14 14` (5×), `0 0 12 12` (3×),
  `0 0 10 6` (3×), `0 0 10 8` (2×), `0 0 8 8`, `0 0 16 16`, `0 0 10 12`

At a display size of 14 px the gap between 1.4 and 1.8 is visible.

The stroke width is expressed **relative to the nominal size**, so that a
character at 14 px has the same perceived weight as one at 10 px. The starting
value is the 1.4 from `GLYPHEN.md`, because it is already proven there to be the
most frequent; **whether it survives implementation is a visual decision and
explicitly open.**

The duplications that `GLYPHEN.md` lists as "staying where they are" are now
merged: the close cross (modal, toast), the clock (both time pickers), the
calendar leaf (DatePicker, DateRangePicker), the cross in its four versions
(alert, tag, multiselect, `KreuzGlyph`).

**What is not a glyph stays out of it.** `GLYPHEN.md` has already separated this
cleanly, and the separation stays valid:

- **Spinner** — carries an accessible name, `role="status"`, is animated
- **Funnel in the table filter** — switches to `fill` to show a state, and is
  thereby a state depiction
- **Sparkline** — a chart with a gradient fill
- **Checkbox tick** — carries `pathLength` for the drawing animation

These four stand by name with a reason in the check's exception list.

## Acceptance

- The stroke-width check lies **in the same test as ticket 01** and reads the
  component source texts via `?raw`, collects `strokeWidth` and `viewBox` and
  checks against the closed set.
- The exceptions stand by name with a reason in the test — the same pattern as
  the contrast exceptions in `kontrast.test.ts`.
- The glyphs live in `src/lib/glyphen/`, no longer inline in the components.
  Every merged character exists exactly once.
- **`GLYPHEN.md` keeps the specification in six points and loses the divergence
  table** — by it becoming empty, not by it being deleted. One sentence records
  that compliance is now checked, and where.
- Screenshot baselines **will move**, and that is the purpose. Every moved
  baseline is looked at individually and justified in the delivery. A bulk
  rebuild is ruled out.
- No character loses `aria-hidden`, `currentColor` or `fill="none"`. The
  unification concerns geometry, not semantics.

## Why this reverses the decision made there

`GLYPHEN.md` records: *"Where a component's glyph differs from the
specification, leave it and record the difference."* The reasoning there — a
standard that collects its own exceptions is no longer a standard but a drawer —
is correct and is **not disputed** here.

What is disputed is the conclusion. `GLYPHEN.md` solves the problem by protecting
the *standard* and leaving the *surface* as it is. Under the goal of
"demonstrable consistency" that is the right choice. Under the goal of "looking
high-grade" it is the wrong one: inconsistent stroke widths in a character set
are one of the most reliable signs that a surface has not been finished.

The resolution is to **enforce** the standard rather than document it. After
that there are no divergences, so no table is needed either.

It is worth noting the order in which this arose. `GLYPHEN.md` was the follow-up
to `consumable-package/issues/05-glyph-set.md`, whose acceptance criterion was to
migrate only what could be taken over **pixel-identically**. Under that criterion,
writing the divergences down was the only possible answer — the alternative would
have been to break the criterion. This ticket breaks it, explicitly and with the
opposite sign on the baselines. That is not the correction of a mistake but a
decision under a different goal.

## Notes

Independent of ticket 04; both can run in parallel.

The check matters more here than the migration. A migration without a check
establishes today's state; the divergence table in `GLYPHEN.md` is the proof of
how quickly it falls apart again.
