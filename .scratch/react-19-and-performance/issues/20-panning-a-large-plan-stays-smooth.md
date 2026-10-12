# 20 - Panning a large plan stays smooth

Status: done
Type: task
Size: S

Blocked by: 11
Spec: `.scratch/react-19-and-performance/spec.md`, "The schedule", third and fourth fix; user stories 34, 36

## What to build

Moving through a plan of several thousand subtasks and dependencies costs
what the visible part costs.

- A **Dependency** outside the view is not stroked: dependencies are culled to
  the view before they are drawn, as subtasks already are. One that crosses
  the view with both ends outside it is still drawn.
- Pan and wheel are coalesced per frame in the layout, as they already are in
  the draw: several events in one frame lay the plan out once.

## Acceptance

- [ ] In the browser suite: a dependency whose **Route** crosses the view with
      both ends outside is drawn; the picture of a view with dependencies is
      pixel-identical to before.
- [ ] The existing tests of panning, zooming and the keyboard walk past the
      view pass unchanged.
- [ ] The benchmark page's pan and wheel figures at the three plan sizes,
      before and after, are in the capability record.
- [ ] No screenshot moves.
- [ ] `pnpm check schedule` passes.
