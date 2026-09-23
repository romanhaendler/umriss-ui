# 01 - Zoom and pan

Status: done
Type: task

Spec: `.scratch/charts-long-series/spec.md` - row 01 of the table under "Solution" is the scope; "Testing" is the acceptance.

## Delivery

- `XAxis onDomainChange?: (domain: [number, number]) => void`. The gestures
  live in the scene (`scene.ts`, "Zoom and pan"): Ctrl/⌘ + wheel zooms around
  the pointer (a trackpad pinch arrives as exactly that; small deltas get the
  finer rate, as in the schedule), a horizontal wheel or Shift + wheel pans, a
  mouse drag pans, two touch pointers pinch, a double click proposes the axis'
  extent. The plain wheel is never taken - the page scrolls. Every x axis with
  a handler gets its own proposal.
- Controlled: the scene changes no domain. A proposal is remembered until the
  next layout, so a second wheel step within one frame builds on the first
  rather than on the domain still drawn. No zoom limits: a proposal only has
  to be a finite, positive span; clamping is the caller's.
- A zoomable plot sets `touch-action: pan-y` - a horizontal drag and a pinch
  are the chart's, the vertical scroll stays the page's. The wheel listener is
  native and not passive (React's is).
- Interaction tests (5): zoom around the pointer and back by double click,
  drag pans later/earlier, the plain wheel changes nothing, an axis without a
  handler does not zoom, a pinch through CDP touches zooms in.
- Example `Axis/05-zoom-and-pan.tsx` over a new generator `kiln(seed, step)` in
  `data.ts` (a week of a kiln, `kilnData` one reading a minute); 2 new
  screenshots.
