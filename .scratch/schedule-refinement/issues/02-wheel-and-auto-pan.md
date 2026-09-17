# 02 — Wheel, zoom and auto-pan

Status: done
Type: task

Blocked by: 01
Spec: `.scratch/schedule-refinement/spec.md` (user stories 9–16, "Wheel", "Auto-pan during a drag")

## Scope

- The plain wheel scrolls the lanes and releases the page at their end; Ctrl/⌘ and pinch zoom; horizontal or Shift pans.
- Auto-pan in an edge zone during every drag, speed from a pure function; the ghost follows.

## Acceptance

- `autoPan.test.ts`; browser tests for wheel scrolling and page release, Ctrl-wheel zoom, auto-pan during a move; existing wheel tests updated to the new gesture.

## Comments

**Delivered.**

- `autoPan.ts` with `autoPanSpeed` (quadratic in the 32-pixel edge zone, 18
  pixels per frame at most); `autoPan.test.ts`, 5 cases, written first.
- The wheel: Ctrl or ⌘ zooms (a small delta, as a pinch sends, zooms faster
  per unit), horizontal or Shift pans, vertical scrolls the lanes and is not
  prevented where they cannot scroll further - the page scrolls.
- Auto-pan runs a frame loop while an edit drag is near an edge and moves the
  ghost with the view. A drag now anchors on the operating time it took hold
  at instead of the pixel, since the scale moves under it.
- Browser: both zoom tests take Ctrl; new "the plain wheel does not zoom, and
  scrolls the page where the lanes fit", "the wheel scrolls the lanes, and lets
  the page scroll on at their end", "a drag held at the edge pans the plot
  along". 113 green.
- **Baselines moved, named here:** `example-intent--stretch-setup-teardown`
  (both themes). Its setup grip test dragged to 07:05, ten pixels from the
  plot's edge - into the new auto-pan zone. The example now starts at 06:00.
