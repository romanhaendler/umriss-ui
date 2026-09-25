# 01 - The walk as a pure module

Status: done
Type: task

Spec: `.scratch/schedule-a11y/spec.md`

## Scope

S2 over the schedule's model: next/previous on a lane, lane above/below nearest in time, collapsed groups, the visible window.

## Acceptance

- Unit tests with literals at the module's seam.

## Comments

`src/walk.ts`, pure: `walkRows` (rows as the plot lays them out, a folded group one row, empty rows and group heads passed over, time order by start then end), `stepSubtask` (the eight moves; from nowhere it starts at the first subtask in view on the topmost row with one), `alongTransport` (ticket 03). `tests-unit/walk.test.ts`, 15 tests with literals.

Deviation, argued: the walk goes over the WHOLE row, not only the visible window, and the scene pans the view to bring the subtask into it (as a drag at the edge pans along). ADR-0030 kept the charts' walk inside the visible domain because the charts pan only where the caller controls the domain; the schedule always pans by gesture, and a walk held inside the view would leave a keyboard no way to the rest of the plan (S2 gives no pan keys). The window is used for the entry point and the PageUp/PageDown tenth. Recorded as ADR-0033 after the review (S7 named only S1 and S5, but ADR-0030's consequences say the opposite, and a reader of it would be misled).
