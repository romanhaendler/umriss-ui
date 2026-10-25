# 10 - A schedule whose lanes fit lets the page scroll

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/under-a-finger/spec.md`

## What to build

On touch, a vertical swipe over a Schedule whose lanes all fit scrolls the page. The one-finger time pan
and the pinch zoom stay the schedule's.

- **The plot's `touch-action`:**
  - `pan-y` while the view has nothing to scroll vertically (its maximum scroll is 0);
  - `none` otherwise.
  - The schedule sets it from its view whenever the lanes, their folding or the size change.
- **The comment at the plot's rule** says why a gesture cannot be handed to the page halfway: the browser
  decides `touch-action` when the touch begins.
- **The README's touch sentence** adds that on a schedule whose lanes overflow, the lane names scroll the
  page.

## Acceptance criteria

- [ ] In the schedule's touch suite (`hasTouch`), the computed `touch-action` of the plot is `pan-y` on an
      example whose lanes fit, and `none` on one whose lanes overflow.
- [ ] Through the protocol, a vertical swipe over the fitting plot scrolls the page.
- [ ] The existing touch tests still pass: the pinch zooms, and a horizontal one-finger drag pans the time.
- [ ] `pnpm check schedule` and `pnpm test:visual:quick schedule` pass.
