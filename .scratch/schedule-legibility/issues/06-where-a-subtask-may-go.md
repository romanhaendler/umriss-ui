# 06 — Where a subtask may go

Status: done
Type: task

Blocked by: 02
Spec: `.scratch/schedule-legibility/spec.md` (user stories 25–31, "Where a subtask may go")

## Scope

- `canMoveTo?: (subtask, lane) => boolean`, asked while dragging and at the drop, for drags from outside as well.
- The ghost stays on the last allowed lane; a **Refusal** stands in the snapshot and at the ghost; a refused drop reports nothing.

## Acceptance

- Browser tests: a drag across a forbidden lane, the refusal, no intent; the same for a drag from outside. An example whose subtasks are bound to their machines.

## Comments

**Delivered.**

- `canMoveTo?: (subtask, lane) => boolean` on `Schedule`, asked while a drag
  runs and again at the drop. The ghost stays on the last lane that was
  allowed; the snapshot carries `refused`, the label says "Not this lane"
  (`scheduleLaneRefused`, both wordings), and a refused drop reports nothing.
- Asked for a drag from outside as well, with the caller's key and task - not
  with the internal sentinel the ghost carries.
- **The glossary corrected the drawing.** The refusal was first drawn in the
  danger colour; `CONTEXT.md` says a **Refusal** is not an error and wears no
  warning colour, which is why the dock's wears none. The entry now names both
  the dock's and the schedule's, as **Grip** names both.
- Example `Intent/05-where-it-may-go` (a mould that fits two presses and not
  the welding bay), two pictures; browser tests for the refusal and for the
  move that is still allowed - in time as well as onto a lane that fits.
- **Roman's finding during delivery:** with `anchor="nearest"` the line sat a
  pixel beside the bar. A bar drawn from `y` over `height` fills the rows
  `y … y + height - 1`, so a line centred on `y + height` lies below the last
  of them. Both edges are a pixel inside the bar now, and a test holds every
  end within its bar's rows.

**Documents.** The schedule's changelog leads the delivery, core's names the
new wording entry, `docs/testing.md` gained the check and three pure modules,
`CONTEXT.md` widened **Refusal**, the README gained "What a bar says", and the
journal carries the delivery entry.
