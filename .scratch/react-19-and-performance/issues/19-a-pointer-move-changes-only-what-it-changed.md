# 19 - On the schedule, a pointer move changes only what it changed

Status: done
Type: task
Size: M

Blocked by: 11
Spec: `.scratch/react-19-and-performance/spec.md`, "The schedule", first two fixes; user stories 33, 35

## What to build

The tooltip follows the pointer along a bar without the schedule doing the
work of a whole plan on every event.

- A pointer move along one **Hit** publishes the tooltip's place and nothing
  else. The **Lane headers**, the bars and the summary are rebuilt when the
  data, the view or the selection changes - not when the pointer moves.
- The two canvases are drawn for their own reasons: the data layer when data,
  view, colours or selection change; hover and the **Ghost** redraw the
  overlay alone.

What a planner sees is unchanged.

## Acceptance

- [ ] In the browser suite: under a hover that moves along a subtask and on to
      another, the pixels of the data canvas are untouched and those of the
      overlay change.
- [ ] The tooltip still follows the pointer along a subtask, a dependency and
      a milestone; the existing tests of hover, tooltip and ghost pass
      unchanged.
- [ ] The benchmark page's pointer-walk figures at the three plan sizes,
      before and after, are in the schedule's capability record.
- [ ] No screenshot moves.
- [ ] `pnpm check schedule` passes.
