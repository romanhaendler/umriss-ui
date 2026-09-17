# 06 — Controlled editing: ghost, intents, grips, snapping

Status: ready-for-agent
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
