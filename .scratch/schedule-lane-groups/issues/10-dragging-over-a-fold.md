# 10 — Dragging over a fold

Status: ready-for-agent
Type: task

Blocked by: 01, 09
Spec: `.scratch/schedule-lane-groups/spec.md` (user stories 33, 34)

## Scope

- A miniature is no drop target; 600 ms of rest over one opens it for the gesture through a transient open set in the scene; the set is dropped when the gesture ends, by drop, Escape or leaving.
- The caller's list is untouched and `onCollapsedGroupsChange` is not called. The same for a placing.
- The refused lanes of 01 are laid out again when rows change mid-gesture.

## Acceptance

- Unit: the transient set. Browser: rest opens, drop lands on a lane inside and reports `lane` with the real lane id, the group is folded again afterwards, no state callback fired; Escape closes as well.
- The timer is given to the scene like `now`, so the test does not wait.

## Comments
