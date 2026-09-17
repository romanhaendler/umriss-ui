# 01 — The alarm model

Status: done

Spec: `.scratch/shopfloor-instruments/spec.md`

## Scope

The lifecycle, and only the lifecycle. Write ADR-0009 first: the boundary between
taking alarms and making them is the decision that keeps this module small enough
to be pure.

- **The library takes alarms; it does not make them.** The caller's process layer
  decides a measurement is an alarm. Same boundary as the tree reporting that a
  branch was opened rather than fetching it, for the same reason: generating
  alarms drags in thresholds, scan rates, deadbands, suppression and a clock, all
  of which are plant decisions.
- **An alarm type is separate from an alarm.** The type is the condition that can
  become true; the alarm is one occurrence. Repeat counts, chatter and flood
  grouping are statements about a *type* over a window and are inexpressible
  without it.
- **Four lifecycle states, one field.** Standing/unacknowledged,
  standing/acknowledged, **cleared/unacknowledged**, cleared/acknowledged. One
  field, not two booleans — a boolean pair invites `if (standing)` and that filter
  is exactly the bug. Only the fourth leaves the list.
- **Default ordering: priority, then acknowledgement, then time.** The worst thing,
  not the newest thing. Expressed as the table model's existing multi-stage sort so
  a caller replaces a value rather than fighting a comparator.
- **Priority is three levels.** A different scale from a limit's severity, on a
  different object. Mapping between them is the caller's.
- **A return threshold on the clearing condition.** The value must come back past
  it, not merely past the limit that raised the alarm. This is the deadband, and
  this module is the only place in the library that can express it, because it is
  the only one that knows the previous state.
- **Flood and chatter are pure functions over timestamps**, with window,
  thresholds and reference time all as parameters. They **mark**; they never
  suppress.
- **Composes with `tabellenModell`**: produces rows with derived fields, hands them
  to the existing filter → sort → page pipeline. Every guarantee the table already
  makes continues to hold.
- **The reference time is a parameter.** Nothing reads a clock.

## Acceptance

Unit tests against the pure model, in the ui package.

- **The fleeting alarm, first.** An alarm that becomes true and then false while
  unacknowledged is in the model, is in the default order, and survives a filter
  for anything other than "cleared and acknowledged". Write this before the rest —
  it is the state the ordinary implementation loses.
- **All four transitions**, each asserted: raise, acknowledge, clear, and the two
  orders in which acknowledge and clear can arrive.
- **The default order** over a fixture containing all four states at three
  priorities: assert the resulting sequence, not just that it sorted.
- **The return threshold**: a value crossing back past the raising limit but not
  past the return threshold leaves the alarm standing. A value crossing the return
  threshold clears it. Both directions, upper and lower.
- **Repeat counting** groups by type, not by occurrence, and respects the window
  boundary from both sides.
- **Flood detection** at the threshold exactly, one below, and one above.
- **Age** derives from the passed reference time; no test reads a clock.
- **Nothing is suppressed.** A flood of forty alarms yields forty rows plus a
  flood marking. Assert the count.

## Notes

Two booleans is the shape everyone reaches for and it is wrong for a specific,
demonstrable reason: it makes `cleared && !acknowledged` an accident of the
filter rather than a named thing, and every consumer writes the filter that drops
it. One field with four values makes the fleeting alarm impossible to lose by
omission.

Resist adding an alarm journal, history or persistence. The model takes what it is
given each render, exactly like the table model does.

Resist making priority and limit severity the same type. It is specified in
`judging-values` issue 06 why they are not, and the reasoning belongs in
`CONTEXT.md` before anyone tries.
