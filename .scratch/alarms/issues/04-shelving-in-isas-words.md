# 04 - Shelving, in ISA's words

Status: ready-for-agent
Type: task
Size: M

Blocked by: `03-four-priorities-and-the-priority-mark.md`
Spec: `.scratch/alarms/spec.md`

## What to build

The tracer slice for the special states, end to end. The screen says what an operator was trained in. The
shelve panel offers the application's reasons. A shelve that runs out brings its alarm back to be seen.

- **The words.** Every text of the package says ISA's words, in English and German, as the spec's table
  gives them:
  - Shelved / Shelve / Unshelve, and "Shelved until 14:05 by M. Weber: valve being replaced";
  - Suppressed by design; Out of service;
  - "Suppressed or shelved: 3" for the count of hidden alarms;
  - the four states: In alarm, unacknowledged · In alarm, acknowledged · Returned, unacknowledged ·
    Returned, acknowledged;
  - "Alarms" / "Alarme" for the list's name.

  Only texts change. The keys keep their names from ticket 02, and the API keeps `snooze`, `disabled`,
  `suppressed`, active and resolved. The JSDoc of each exported name says the word the screen uses for it.
- **Reasons from the application.**
  - `snoozeReasons?: readonly string[]`: the reasons the panel offers as choices, above a free-text field for
    a reason not on the list.
  - With `snoozeReason="required"`, one of the two must be given before "Shelve" reports. With `"optional"`,
    neither need be.
  - `onSnooze(ids, until, reason)` reports the chosen or typed reason, trimmed, or none.
  - Without `snoozeReasons` the panel is the restored one.
  - The durations stay the caller's (`snoozeDurations`), with no default.
- **Re-annunciation** (A6.4):
  - An alarm whose shelve ended at or before the as-of time, and which is still active, is projected as
    active and unacknowledged, whatever its stored lifecycle says.
  - It counts in the list's number and is acknowledgeable. `acknowledge(alarms, ids, time)` acknowledges it
    when its shelve ended at or before `time`, and clears the ended shelve record.
  - One derived reading of "the lifecycle at a time" serves the projection, `countAcknowledgeable` and
    `acknowledge`, so the number named and the action cannot drift.
  - A shelve ended by hand (`unsnooze`) keeps the lifecycle underneath.
  - A resolved alarm whose shelve ended keeps its lifecycle as well: there is nothing to see again.
  - The model's comment says why: a shelve exists so that the alarm is not forgotten, and one vendor
    (Elipse) returns an expired shelve the same way; no standard settles it.
- **Visible while shelved** (A2). A shelved alarm that is still active shows its "Shelved" badge with its
  return time in the row, not only in the tip.
- **The demo.**
  - The restored snooze examples say "shelve" in their titles, leads and prose.
  - One example shows the reasons list.
  - One example ticks the as-of time past a shelve's end and shows the alarm return.
  - The page's about text names ISA's words and the API's.

## Acceptance criteria

- [ ] No English text of the package says "snooze", "disabled", "hidden" or "resolved", and no German text
      says "Deaktiviert", "Ausgeblendet" or "Behoben"; a test over the package's keys in both wordings holds
      it.
- [ ] With `snoozeReasons` and `"required"`, "Shelve" stays disabled until a reason is chosen or typed, and
      reports exactly that reason.
- [ ] At an as-of time one millisecond before `until` the alarm is shelved. At `until` it is active and
      unacknowledged, counted, and acknowledged by `acknowledge`. These are model tests with literal times.
- [ ] After `unsnooze`, an alarm that was acknowledged before its shelve is still acknowledged.
- [ ] A resolved alarm whose shelve ended keeps its stored lifecycle.
- [ ] `pnpm check alarms`, `pnpm check core`, `pnpm check:site` and `pnpm test:visual:quick alarms` pass.
