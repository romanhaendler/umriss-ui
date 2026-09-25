# 02 - Encoding by marks

Status: done
Type: task

Spec: `.scratch/charts-alternatives/spec.md`

## Scope

C3 for lines, areas, bars, scatter, limit bands; then state bands and cells.

## Acceptance

- Unit tests of the slot → dash/marker mapping; screenshots with `encoding="marks"`.

## Comments

Delivered (2026-09-24). `Chart encoding="color" | "marks"`, default `"color"`.
The mapping is a pure module, `src/marks.ts`: a palette place gives a dash
(solid, dashed, dotted, dash-dot, long dash, dash-dot-dot), a marker shape
(circle, square, triangle, diamond, triangle down, plus) and a hatch (none,
rising, falling, horizontal, vertical, crossed), cycling with the six colours;
the first place is plain, so the first series looks as it does without marks.
A line takes dash and marker, an area its dash on the outline and its hatch
across the fill (in its own colour - the fill is faint), a bar its hatch (in
the background's colour, across the solid fill), a scatter its shape; a
caller's own `dash` wins. A state is hatched by its index in the state list, a
matrix by its bucket, a limit band by a rising hatch in its colour at half
strength. Hatches are one stroke of lines per filled path, clipped to it, on a
grid of the plane so neighbouring bars and cells continue each other. The
legend's chips become SVG drawn from the same numbers (a line with its dash
and marker, or swatches with their hatch - a matrix one per step).

A limit *line* gets no change: its role already carries a dash (ADR-0008).
The hover marker stays a circle. A gradient of more than six steps repeats
the hatches (colour still tells them apart) - the ceiling is the six hatches.

Tests: `tests-unit/marks.test.ts` (slot → dash/marker/hatch, order, cycle,
state/bucket hatch, hatch geometry, marker sub-paths), `draw.test.ts` (a
shaped marker stays one fill, a hatch is one stroke after the bars' fill),
`encoding.jsdom.test.tsx` (chips with and without marks, caller's dash, scatter,
bar, states, matrix). Three new examples on the Chart page
(`told-apart-without-colour`, `marks-on-every-kind`, `bands-limits-and-cells`),
six new baselines looked at one by one; the full charts suite passed with no
existing picture moved (181 passed).
