# 03 — The value channel and the cell

Status: done

Spec: `.scratch/plant-at-a-glance/spec.md`
Blocked by: `judging-values` issue 01 (the verdict)

## Scope

The sixth series kind's foundations. Write ADR-0011 first.

- **`MaterializedSeries` gains an optional value channel**: a named third
  `Float64Array`, null for every kind that does not use it. **Not the baseline
  channel overloaded.** The codebase's rule — a property meaningful to only some
  kinds belongs in their members, not in the base with a comment — applies to the
  materialised form too, and a baseline channel holding a colour value is what
  someone finds while debugging an area chart at midnight.
- **The matrix is a sixth kind.** x is the column position, y the row position, the
  value channel decides the colour. Both are ordinary numeric axes with ordinary
  `tickFormat` labels, so rows and columns are labelled by the machinery that
  already labels everything else.
- **Cell size comes from the grid spacing of both axes.** ADR-0002's reasoning in
  two dimensions: the existing spacing measurement is one-dimensional and this needs
  it on y as well. Where no spacing is measurable — a single row or column — the
  axis' domain span is used, exactly as the bar geometry already does.
- **A missing cell is a hole.** `NaN` in the value channel, not painted.
- **A hit is the cell containing the pointer, in both dimensions** — a separate pure
  function, because the answer is a pair of indices.

## Acceptance

Unit tests in charts. Prior art: `balken.test.ts`, same shape.

- **The value channel is null for every kind that does not use it.** Assert this
  explicitly for line, area, bar, scatter and the state band. It is the assertion
  that keeps ADR-0011 honest, and without it the channel becomes general-purpose
  within a release.
- Cell size from measurable spacing in both dimensions, and from the domain span in
  the single-row and single-column cases.
- The cell hit at the centre, at the far edge and one step beyond the far edge of a
  cell; outside the grid entirely.
- A `NaN` value produces a hole, and its neighbours are unaffected.
- Every existing materialisation test passes unchanged. The channel is optional; if
  a test needs editing, it was not.

## Notes

The overload is the trap. `y0` is right there, it is already nullable, and reusing
it saves a field. It also makes the type stop describing what it holds, which in a
package whose entire performance argument rests on the reader trusting the channel
layout is a poor trade for one field.

Cell size in two dimensions is ADR-0002 again. Read it before generalising the
spacing measurement — the reasoning about why a single point still gets a visible
bar applies unchanged to a single row.
