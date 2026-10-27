# The alarm list offers snoozing and reports it, and the application decides

Status: superseded by ADR-0078. The alarm list was removed from `@umriss-ui/table`, so this decision no longer applies to any code.
Date:   2026-10

`alarmModel` has `snooze`, `unsnooze`, `disable` and `enable`, but the
`AlarmList` offered only acknowledgement. The comment at the top of the list
said that to hide an alarm from a human is a safety decision and does not
belong in a user-interface library, and so an operator could not ask for a
snooze from the list. The maintainer decided on 10 October 2026 that offering
is not hiding: the list offers snoozing as an intent it reports, as the
schedule does (ADR-0023), and applies nothing.

**The alarm list offers snoozing and reports what the operator asked for; the
application calls `snooze()` on its own data, or refuses.** The rule is
ADR-0023's, and the comment of the list now says so. It is also the boundary of
ADR-0009: the library owns a lifecycle and the plant owns the decision.

- **`onSnooze(ids, until)` and `onUnsnooze(ids)`,** in the shape of
  `onAcknowledge(ids)`. An action appears only with its handler, and both need
  `selection`, as acknowledging does.
- **The durations are the caller's.** `snoozeDurations` in milliseconds, no
  default list; empty or missing, no snooze action. The choice is core's
  `Menu` on a `Button`; no new core component.
- **The actions stand in the bar beside "Acknowledge",** on the ticked alarms.
  Acknowledging has no place per row, so no column was added.
- **`until` is the view's as-of time plus the duration;** the list has no clock
  of its own.
- **Only the alarms `snooze()` would change are reported:** those in service or
  already snoozed. Unsnooze reports the snoozed ones. The button names that
  count and is disabled with nothing to act on.

## Considered Options

- **No snooze in the list,** the earlier comment. An operator then needed a
  second place to ask for what the model already does.
- **The list applies the snooze.** That is the decision of hiding an alarm,
  and the library does not take it (ADR-0009); the application can refuse or
  recompute.
- **A reason field and "who".** Left out at first, as what the application
  knows. A day later the reason was let in on request: `snoozeReason`,
  `"optional"` or `"required"`, turns the menu into a small panel with the
  durations and a field, and `onSnooze` reports the reason as a third
  argument. Without the prop nothing changes; the list still applies nothing
  and shows no stored reason. "Who" stays the application's.
- **Disable and enable from the list, a per-row action or column, limits on
  duration, authorisation and an audit trail** (`docs/standards.md`). Not built.
- **A filter component on the list.** Its columns are not filterable;
  `alarmModel`'s `filter` already filters by state and priority, and an example
  shows it with controls of the caller.

## Consequences

- Four new wordings in core, English and German: `snoozeAlarm`,
  `snoozeAlarms(count)`, `unsnoozeAlarm` and `unsnoozeAlarms(count)`.
- Ticked alarms that `snooze()` would leave alone - disabled, suppressed - are
  silently left out of the report.
- A stale `asOf` in the model gives a stale `until`.
- The bar may now hold three buttons.
