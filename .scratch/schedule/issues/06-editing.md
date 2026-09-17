# 06 — Controlled editing: ghost, intents, grips, snapping

Status: done
Type: task

Blocked by: 05
Spec: user stories 14–17, 19, 20, 29 · ADR-0023

## Scope

- `intents` lists what the caller handles (`move`, `lane`, `stretch`,
  `setup`, `teardown`); none means read-only. `onIntent` reports.
- Body drag moves in time and across lanes; edges stretch the main time; grips
  for setup and teardown appear on the selected subtask.
- The ghost is drawn beside the unchanged data and assessed like data; a DOM
  label on it names the new times and the findings. Escape cancels.
- `snap`: `"ticks"` (default), a step in milliseconds, or `false`.

## Acceptance

- A browser test drags a subtask onto an occupied lane, sees the finding on the
  ghost before the drop and the reported intent after it; the data does not
  move unless the demo applies it.

## Comments

**Delivered** (d452d68; browser suite 39d766b).

- A body drag with `move` and/or `lane`; edges (5 px) with `stretch`; grips in
  DOM (`data-grip`) on the selected subtask with `setup`/`teardown`. One intent
  per changed property; nothing when nothing changed.
- The ghost label (`data-ghost`) carries the times and the finding words from
  core's wording (`scheduleOverlap`, `scheduleLateTransport`,
  `scheduleGhostTimes`, English and German), and `data-findings`.
- `features-editing.spec.ts`, 7 tests, including the demonstration.
- Not done: a snap raster with an offset of its own (06:00/14:00/22:00 shifts).
  `snap` lies on local multiples of the step; the snapping example says so.

**Review follow-up** (two-axis review after 08):

- The demonstration lost the move when one drop reported a move and a lane:
  its handler applied both to the plan of the same render. Plan and log are now
  one state, updated functionally.
- A drag straight across the lanes reported a move as well, because the
  unmoved start was snapped onto the raster. Below the click slop horizontally,
  the time stays.
- A snapped time could land in removed time; it now moves on to the seam where
  time counts again.
- A finger on a subtask started an edit although touch editing is out of scope;
  touch now only pans and pinches.
- `snap.ts` claimed a 06:00/14:00/22:00 raster it cannot give; corrected.
- Standards: `View` → `Viewport` (the glossary's **View** is the table's);
  charts' new exports moved to the end of its `index.ts`; the probe shared by
  `readTheme` and `resolveColours`; one registration hook; `occupied()` used
  where it was written out; snapping's tests in `snap.test.ts`.
- Left as they are: the word **grip** for the setup and teardown handles comes
  from the spec itself ("grips for setup and teardown") and collides with the
  dock's **Grip** in `CONTEXT.md` - a vocabulary decision for the glossary, not
  for this ticket. `scene.ts` is long; splitting drawing from gestures is a
  refactoring of its own.
