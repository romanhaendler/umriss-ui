# 03 — One stroke width

Status: ready-for-agent

Blocked by: 01

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
