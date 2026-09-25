# 03 - Final polish round

Status: done
Type: task

Spec: `.scratch/control-room-demo/spec.md`

## Scope

The visible result goes to the user as a rendered before/after page (the
review page pattern of visuelle-wertigkeit 05): every surface of this spec in
light and dark, each decision a card. Spacing, tracking and optical corrections
are settled by the agent; new tokens or visibly new colours go as a card first.

## Acceptance

- The user has taken every card on the review page.
- Every moved screenshot baseline looked at individually, never rebuilt in bulk.

## Comments

Delivered on the user's decisions from the review page (every card taken as recommended):

- **cr-title**: the Alarms region is still a landmark named "Alarms" (`aria-label`, so the skip link and the landmark list keep it), but it has no card header; the alarm list's own heading is the one the eye reads. `Region` takes `quiet` for this.
- **cr-batches**: the room's schedule writes the batch number (B-4121 ...) into every bar through `label`, as the schedule's "Bar labels" example writes the order.

Baselines moved: `example-control-room--demonstration`, light and dark - the Alarms card lost its header row (everything below moves up by that height) and the plan's bars carry their batch numbers. Looked at; nothing else moved. `features-control-room.spec.ts` (a landmark per region, the skip links) stays green.
