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

**Review follow-up** (two-axis review after 06):

- **Standards:** the German refusal said "Nicht diese Zeile" - `Zeile` is on the
  **Lane**'s _Avoid_ list - and reads "Nicht hierher" now. `anchor` became
  `attach`, so that the word keeps meaning what a transport connects. The
  glossary gained **Bar label**, **Appearance** and **Route**. `placeGhost` is a
  query again, not a query with a hidden command. `channels()` reads a resolved
  colour once for both readers, `inView` culls in one place, `HATCH_STEP`,
  `FADE_SPAN` and `DARK_BELOW` are named with their reasons, `resolveAppearance`
  names its fourth case instead of falling into it, and `separatorsOf` is
  exported where ADR-0024 points at it.
- **Tests that restated the implementation** now carry the fixture's geometry
  written out - lane 1 holds its bar over the rows 50 to 68, and a line
  attaches to the last row, not to the boundary beneath it - and the label rule
  is checked at 63 and 64 pixels with the constant asserted beside them.
- **Spec:** a drag from outside keeps its ghost on the last lane that allowed
  it and shows the refusal there, instead of losing the ghost; the muted bar's
  label is the slim bar it lies on (`barRect`, shared by the drawing and the
  label); the stale German examples in the `Formats` interface are English.
- **The one place the reviewers and the code disagreed on purpose** is written
  into the spec's deviations: a refused drop lands where the ghost stands.
- 160 browser tests, 1,950 unit tests, lint and typecheck green.
