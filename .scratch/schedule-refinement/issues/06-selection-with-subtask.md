# 06 — Selection with its subtask

Status: done
Type: task

Blocked by: 01
Spec: `.scratch/schedule-refinement/spec.md` (user stories 37–38, 51)

## Scope

- `onSelectedTaskChange(task, subtask)`, also called for another subtask of the same task.

## Acceptance

- Browser test through the examples.

## Comments

**Delivered.** `onSelectedTaskChange(task, subtask)`; called whenever either
changes, so a click on another stop of the same order reports again. The subtask
is null for a click on a transport or on nothing, and only the task stays
controlled. The selection example shows the stop, and its browser test clicks a
second stop of the same order. 127 green; no picture moved - the example's text
only changes once something is clicked.
