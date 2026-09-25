# 04 - Readout and summary

Status: done
Type: task
Blocked by: 02

Spec: `.scratch/schedule-a11y/spec.md`

## Scope

S4, S6, the wording entries in English and German.

## Acceptance

- jsdom tests of the text after keys and never after the pointer.

## Comments

After the keys rest 150 ms, a polite live region (core's `VisuallyHidden`) reads: lane, task, subtask, day and times, and every finding by name (`Overlap with ...`, `Late transport, ... short`); a transport: task, duration, route, lateness. Only while the keys still hold the hover - never after the pointer. The summary (aria-describedby): lanes, subtasks in view, the visible span, the PLAN's overlaps and late transports (an overlap out of view is still one to know of), then the key help.

Wording in core, English and German: `scheduleRoleDescription` ("schedule" / "Belegungsplan" - not "Plantafel", which CONTEXT.md avoids), `scheduleSummary`, `scheduleKeyHelp`. The readout reuses the tooltip's entries. Seen on the way, not changed: the existing `hoursShort` says "1 hrs".

Tests: `readout.test.tsx` (jsdom, English and German, silent for the pointer), and the readout in `features-keyboard.spec.ts`.
