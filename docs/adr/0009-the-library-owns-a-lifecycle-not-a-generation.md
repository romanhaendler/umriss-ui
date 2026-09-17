# The library owns an alarm's lifecycle, not its generation

Status: accepted
Date:   2026-08

The alarm model takes alarms. It does not make them.

The caller's process layer decides that a temperature crossing a limit is an
alarm. The library owns what happens next: standing or cleared, acknowledged or
not, all four combinations, the ordering among them, repeat counts per type, and
the identification of floods.

This is the same boundary the tree draws when it reports that a branch was opened
rather than fetching its children, and it exists for the same reason. The moment a
component generates alarms it needs thresholds, deadbands, scan rates, suppression
policy and a clock — and every one of those is a plant decision with a plant's
consequences attached.

Two things follow that are worth stating outright.

**The lifecycle state is one field with four values, not two booleans.** Standing
and unacknowledged; standing and acknowledged; cleared and unacknowledged; cleared
and acknowledged. The third is the fleeting alarm — it came, it went, and nobody
saw it — and it is the state every naive implementation loses, because a boolean
pair invites the filter `if (standing)` and that filter is the bug. One field with
four values makes it impossible to lose by omission.

**Nothing is suppressed.** A flood is marked; forty alarms yield forty rows plus a
marking. Deciding that a human should not see an alarm is a safety decision, it
belongs to the plant's alarm management, and an interface library that quietly
hides alarms is a hazard.

## Consequences

Hysteresis lives here and only here. A limit (ADR-0006) is a pure function of one
value and deliberately cannot express "must come back past a different threshold
before clearing". An alarm can, because it knows what it was a moment ago. That
split is what keeps the limit model duplicable and this model honest.

Alarm **priority** is three levels. A limit's **severity** is two. They are
different scales on different objects and are not unified: a limit is either
advisory or actionable, and a third level would be a third colour on a chart for
no gain, while an operator with forty standing alarms needs an order among the
actionable ones. Mapping one to the other is a plant convention and belongs in the
plant's code.

The default ordering is priority, then acknowledgement, then time. An operator
needs the worst thing, not the newest thing. It is expressed as the table model's
existing multi-stage sort, so a caller who wants time-first replaces a value
rather than fighting a comparator.
