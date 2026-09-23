# Span leaves charts; occupancy is the schedule's

Status: accepted
Date:   2026-09

`@umriss-ui/charts` had a seventh series kind, `Span`: an interval with an
explicit end on a lane — jobs on machines, with idle time between them and a
double booking offset rather than packed. Since ADR-0022 the workspace has a
second place that draws exactly that, `@umriss-ui/schedule`, and it does it
better: lanes with headers, lane groups, setup and teardown, transports,
findings and controlled editing.

**`Span` is removed.** Occupancy is the schedule's.

What the span offered and the schedule does not is occupancy *in the same chart
as a process curve* — jobs under a temperature. That is the one argument for
keeping it, and it does not carry two places that draw occupancy: every rule
of the schedule (an overlap is never packed, a lane is a machine, a finding is
reported) would have to be kept twice, and the span already disagreed with it —
its overlap depth knew no lane, and its tooltip gave the lane index as a value
(`.scratch/charts-review/spec.md`, bugs 1 and 4). A job over a curve can be
hinted at with an x `LimitBand`; a plan stands in a schedule beside the chart.

## Considered Options

**Fix the span.** Rejected: it would leave two implementations of the same
thing, the smaller of them a step behind the larger one from the day it was
fixed.

**Draw the schedule's lanes inside a chart.** Rejected for now: nobody has
asked for it. It is the form a real need would take, and then this decision is
reopened — reinstated only on a real need.

## Consequences

The series union loses `span`, and the materialised series its second x
channel `x1` — the span was its only reader (ADR-0011's value channel stays).
The tooltip's `segment` loses `open`. The demo loses its `Span` page. For a
caller this is a breaking change, named as such in the changelog: the
replacement is `@umriss-ui/schedule`.
