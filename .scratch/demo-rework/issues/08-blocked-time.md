# 08 - Schedule: blocked time per lane

Status: ready-for-agent
Type: task
Blocked by: 04

Spec: `.scratch/demo-rework/spec.md` · ADR-0035

## Scope

A lane carries blocked intervals (leave, maintenance, unavailability), drawn behind the subtasks, reported as a finding when a subtask overlaps one, respected by "where a subtask may go". Milestones, stacked overlap and cross-task dependencies stay "not yet" in the schedule's record.

## Acceptance

- Model as plain data (ADR-0023); unit tests for the finding.
- Visual test; keyboard and screen-reader wording in English and German.
