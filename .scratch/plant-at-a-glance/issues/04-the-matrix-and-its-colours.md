# 04 — The matrix and its colours

Status: done

Spec: `.scratch/plant-at-a-glance/spec.md`
Blocked by: 03

## Scope

Making the grid readable.

- **Two colouring modes.** By verdict: discrete, reusing bundle A's model, so the
  same thresholds colour the tile and the grid, and accessible by construction
  because it is the same small palette that already passes contrast. By continuous
  ramp: an array of stops the caller supplies, with one library default.
- **A cell's value is reachable as text.** This is the answer to the continuous
  mode's accessibility problem, and it is the only answer — colour cannot carry a
  number to a reader who cannot compare two blues, and no ramp fixes that.
- **Rows and columns are labelled by the axes**, so a matrix needs no legend to say
  which row is which machine.

## Acceptance

- A screenshot tile showing both colouring modes and holes, in both themes.
- axe passes at WCAG 2.1 AA in both themes with **no new suppression entry**. If the
  default ramp fails against the cell text or the background, the ramp changes.
- A browser test: pointing at a cell reports that cell's value, and pointing at an
  adjacent cell reports a different one. Count the reports.
- Verdict mode and the tile from `judging-values` agree: the same value with the
  same limits produces the same verdict in both. This is the conformance idea
  applied at the surface, and it is one assertion.

## Notes

The continuous ramp will tempt an accessibility fix that is really a colour choice —
a better ramp, more contrast between stops, a colourblind-safe scheme. All of that
is worth doing and none of it makes a colour field readable to someone who needs
the number. The text path is the requirement; the ramp is quality of life.

Do not build a ramp legend here. It is needed eventually and it is a chart
decoration in its own right, which does not fit in the same package as the kind it
describes.
