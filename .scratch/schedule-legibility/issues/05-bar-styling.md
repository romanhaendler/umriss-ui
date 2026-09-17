# 05 — What a bar says besides its colour

Status: done
Type: task

Blocked by: 02
Spec: `.scratch/schedule-legibility/spec.md` (user stories 17–24, "Bar styling")

## Scope

- A closed list on the subtask: provisional, fixed, muted, open; progress as a share from 0 to 1.
- Each a pattern or an outline, not only a colour; the contradiction rule stated at its site.

## Acceptance

- Unit test of the resolution (which wins); one example per appearance with its pictures; the tokens-only rule holds.

## Comments

**Delivered.**

- `appearance?: readonly SubtaskAppearance[]` with a closed list -
  `provisional`, `fixed`, `muted`, `open` - and `progress?: number`.
  `resolveAppearance` settles the one contradiction (provisional against fixed:
  the later in the list wins) and `appearance.test.ts`, 6 cases, was written
  first.
- **Two of them were redrawn on Roman's objection during delivery**, and he was
  right: a faint fill already means a setup or a teardown in this picture, so
  neither "another shift" nor "65 per cent done" could be told from a run-out
  time.
  - **`muted` is now slim, not faint:** half the height at the whole colour.
  - **`progress` is now a rail** along the bottom of the bar - the done part
    solid, the rest at a third - instead of a pale remainder.
  The example carries a real setup and teardown in the same picture, beside
  both, so the distinction is visible where it has to hold.
- `fixed` hatches in the surface colour, `provisional` dashes its outline over
  a lighter fill, `open` fades into the surface **at the edge of the view**
  where the bar's own end lies beyond it - measured in the canvas pixels, which
  run from the bar's colour to the surface over sixteen points.
- Example `Subtasks/05-appearances`, two pictures; 155 browser tests green.
