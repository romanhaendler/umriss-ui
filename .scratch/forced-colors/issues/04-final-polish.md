# 04 - Final polish round

Status: ready-for-human
Type: task

Spec: `.scratch/forced-colors/spec.md`

## Scope

The visible result goes to the user as a rendered before/after page (the
review page pattern of visuelle-wertigkeit 05): every surface of this spec in
light and dark, each decision a card. Spacing, tracking and optical corrections
are settled by the agent; new tokens or visibly new colours go as a card first.

## Acceptance

- The user has taken every card on the review page.
- Every moved screenshot baseline looked at individually, never rebuilt in bulk.

## Comments

**Schedule part (2026-09-25), as taken on the review page.**

- fc-schedule-colours: under forced colours the selection colour is the
  **Active subtask**'s alone (its outline). Overlaps and late transports are
  drawn in `CanvasText` and dashed - the overlap's band and a folded group's
  mark as a dashed 3px line, the late transport's line as before - and the
  now line in `GrayText`, told from the grid by its 2px. The mapping is
  `canvasTokens` in `packages/schedule/src/sceneDraw.ts`, tested as a pure
  mapping (`palette.test.ts`).
- fc-tasks: tasks keep losing their own colours under forced colours - lane
  and label tell them apart. Unchanged, by decision.
- Pictures moved, each looked at in light and dark, nothing else moved (the
  unforced screenshots are identical to the pixel): the forced first examples
  of `schedule`, `findings`, `demonstration`, `tooltip`, `linked-schedules`,
  `overlap`, `now-line`, `move-and-lane`, `selection`, and the focused
  schedule with an active subtask - the overlap's `Highlight` band and wash to
  a dashed `CanvasText` band over a grey wash, the late transport `Highlight`
  to `CanvasText`, the now line `Highlight` to `GrayText`; the focused one
  also by the ring's rounder corners (schedule-a11y 06).
