# 02 — The check: nothing in its own way

Status: done
Type: task

Blocked by: 01
Spec: `.scratch/schedule-legibility/spec.md` (user stories 37–41, "The check")

## Scope

- A check beside `ownBase` in `@umriss-ui/demo/checks`: every DOM overlay of the schedule inside its plot or band, no bar label wider than its bar, no two labels intersecting.
- Called by the schedule's browser suite with every page; tolerated cases at the call with a reason.

## Acceptance

- It fails on the defect it was written for - the ghost label clipped in the topmost lane, reproduced by reverting the clamping in a scratch run, and the ticket says it did.
- Green over every page of the schedule demo.

## Comments

**Delivered.** `packages/demo/checks/overlays.ts`.

- Two invariants, both read off rendered boxes: every element marked
  `data-schedule-overlay` lies inside the nearest `data-schedule-clip` (plot,
  day band, time band), and no two overlays of the **same kind** in the same
  example cover each other. Different kinds may - a tooltip is meant to cover
  what it explains.
- Marked in the schedule: day label, time label, setup and teardown grip,
  tooltip, ghost label, now mark. The three clipping boxes carry
  `data-schedule-clip` with the name the offender line uses.
- **One definition, two moments.** `checkOverlays` walks every page of the
  schedule demo with nothing in flight (`tests-visual/overlays.spec.ts`), and
  `overlayOffenders(page)` is called by the feature test in the middle of a
  drag - the one moment a static page cannot reach, because that is when the
  ghost's label exists at all.
- **It fails on the defect it was written for.** The clamping was reverted in a
  scratch run (the label back to a fixed `translateY(-100%)`), and the test
  reported: `move-and-lane: ghost label "07:00–08:00OverlapLate t" leaves its
  plot (543,159 217×19 outside 448,172 788×324)`. Restored afterwards; 147
  browser tests green.
- **One invariant of the spec is not in here yet:** "no bar label is wider than
  its bar" (story 38). There are no bar labels until ticket 03, and a claim
  about a bar's width needs the bar's box, which is on the canvas; ticket 03
  brings the labels and the claim together, through the width the label is
  given.
