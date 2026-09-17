# 02 — The check: nothing in its own way

Status: ready-for-agent
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
