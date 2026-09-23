# 10 - Hit testing

Status: done
Type: task

Spec: `.scratch/charts-fixes/spec.md` (bug 13)

## Scope

- `"nearest"`: a band or cell hit counts only when no point lies within the snap distance; points win.
- A chart of bands or cells only: crosshair and tooltip anchor at the pointer's x, not the segment start.
- `"nearest"` over a Scatter measures the pixel distance in x **and** y.

## Acceptance

- Unit tests (hit, scene) first for each; interaction test for the scatter case.

## Delivery

Finding confirmed on all three counts; every test below failed first.

- Points win: `sceneFrame.jsdom.test.ts` - a pointer 3 px off a line point
  inside a state band's lane named the band. `scene.ts`: under `"nearest"` the
  nearest point is taken first; an area wins only when no point is within
  `SNAP_DISTANCE` (12 px, new - the spec named a snap distance and the code had
  none). A second test holds that the band still answers away from points.
- Anchor: same file - a chart of one state band put `hit.xPx` at the section's
  start (204.5) instead of the pointer (279.5). An areal primary now anchors at
  `mouseX`. Within one section the hover snapshot is not re-pushed, so its
  `xPx` is that of the first move; the overlay and the tooltip position read
  the live hover and follow the pointer.
- Scatter: `hit.test.ts` (`nearestPoint`, new in `hit.ts`: walks outwards from
  the nearest x until the x distance alone exceeds the best) and the scene
  test; `hitIn` uses it for a scatter under `"nearest"` only. Interaction test
  in `features-interaction.spec.ts` on `Scatter/01-measurements`: moving the
  pointer up and down one column, the named sample must change somewhere - 0
  columns before (checked by reverting the branch), passing after.

No picture affected (hover is not photographed); interaction suite 14/14.
