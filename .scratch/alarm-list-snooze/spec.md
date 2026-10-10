# Snooze as an operator's action in the AlarmList

Status: ready-for-human

## Problem

`alarmModel` has `snooze`, `unsnooze`, `disable`, `enable`, but the `AlarmList`
offered only acknowledgement; an operator could not ask for a snooze from the
list. The comment at the top of `AlarmList.tsx` said hiding an alarm does not
belong in a user-interface library. Maintainer decision, 2026-10-10: the list
offers snoozing as a reported intent, as the schedule does (ADR-0023); it
applies nothing.

## Decisions

| Decision | Choice | By |
|---|---|---|
| Snooze is an intent | The list reports; the application calls `snooze()` or refuses. The comment in `AlarmList.tsx` says so | maintainer |
| `onSnooze(ids, until)`, `onUnsnooze(ids)` | In the shape of `onAcknowledge(ids)`; `onSnooze` also carries `until` | maintainer |
| Action only with its handler | As `onAcknowledge`'s | maintainer |
| Durations are the caller's | `snoozeDurations?: readonly number[]` (milliseconds), no default list; empty or missing, no snooze action | maintainer |
| Control for the choice | core's `Menu` on a `Button`; no new core component | maintainer |
| No reason, no "who" | Out of scope; the application knows both | maintainer |
| Filter by state and priority | Not built. `alarmModel`'s `filter` already does it; shown in example 07 with controls of the caller | maintainer, with this finding |
| Where the actions stand | In the bar beside "Acknowledge", on the ticked alarms (acknowledge has no place per row, so no column was added) | coordinator |
| `until` | The view's as-of time (raised + age of a row) plus the duration; the list has no clock of its own | coordinator |
| Which ticked alarms are reported | Snooze: those in service or already snoozed (`snooze()` leaves disabled and suppressed alone). Unsnooze: the snoozed ones. The button names that count | mine |
| Disabled states | Both buttons are disabled with nothing to act on, as "Acknowledge" is | mine |
| Unsnooze needs a selection | Like acknowledge, both actions need `selection` | mine |
| Duration labels | Written with the list's existing `durationWord` (`hoursShort`, `minutesShort`): "15 min", "1 hr", "4 hrs" | mine |
| Wording | Four new keys in core, English and German: `snoozeAlarm`, `snoozeAlarms(count)`, `unsnoozeAlarm`, `unsnoozeAlarms(count)`; German "Zurückstellen" follows the existing `availabilitySnoozedShort` | coordinator allowed core edit |
| Examples | 06 offer snoozing, 07 filter by state and priority (page "AlarmList") | mine |

## Out of scope

- A reason field and "who" (the example hard-codes a name in the application's own call).
- Limits on duration, authorisation, audit trail (`docs/standards.md`).
- Disable and enable from the list.
- A per-row action or a column.
- A built-in filter component or a column filter on the list: its columns are not filterable, and the projection's `filter` covers it.
- No ADR number taken; no screenshot baselines.

## For the maintainer to look at

- The actions act on the ticked alarms in the bar, not per row: a single alarm is ticked, then snoozed. Is that the place you wanted?
- The four wording keys in core (`wording.ts`, `de.ts`) and the German phrasing, "Zurückstellung aufheben" in particular.
- `onSnooze` reports only the alarms that `snooze()` would change; the others ticked are silently left out.
- `until` is as-of plus duration, so a stale `asOf` in the model gives a stale end; the application may of course refuse or recompute.
- Visual: the bar now may hold three buttons; no baselines were taken (no Playwright run).
