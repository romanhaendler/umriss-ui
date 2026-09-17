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
