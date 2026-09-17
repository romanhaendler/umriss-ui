# The schedule is a package, and it depends on `@umriss-ui/core` and `@umriss-ui/charts`

Status: accepted
Date:   2026-09

The schedule — subtasks on lanes over time, with transports, findings and
controlled editing (`.scratch/schedule/`) — becomes `@umriss-ui/schedule`, a
fourth package with two peer dependencies: `@umriss-ui/core`, as the table has
it (ADR-0016), and `@umriss-ui/charts` — the first dependency *on* charts in
the workspace.

ADR-0020's promise stands untouched: charts depends on nothing. That promise
was always about what charts needs, never about who needs charts. What the
schedule takes from charts is the public, pure arithmetic: the affine scale
(ADR-0001), the time-tick stepping, the operating calendar, and the canvas
colour resolution that ADR-0021 made necessary. From core it takes the styling
regime — the tokens, the CSS-module discipline, the shared base classes — and
whatever components the work turns out to need, under the table's rule:
what the schedule needs becomes public in core.

## Considered Options

**Grow the schedule inside `@umriss-ui/charts`.** Charts holds the closest
machinery — `Span` on a lane is half a subtask. Rejected because the schedule
is a product of its own in the way the table was (ADR-0016): its own editing
model, its own demo, its own sequence of specs — and because charts may never
touch core, so every core-shaped interaction would stay second-class or
injected from outside forever.

**Revise ADR-0020 and let charts depend on core.** Rejected: the standalone
promise is published and guarded four ways (lint, manifest, SSR test, `files`
list). One new component is no reason to break a promise every charts consumer
was given.

**Duplicate the time machinery, as ADR-0006 did.** That precedent was
deliberately limited to one pure function of one value. Scales, tick stepping
and the operating calendar are several modules that would drift — and drift in
tick arithmetic is two packages disagreeing about what the same instant looks
like.

## Consequences

`@umriss-ui/schedule` imports only the public entries of its two peers, and
lint enforces it as it does for the table; no package imports the schedule.
Importing charts' entry loads `charts.css` — under ADR-0021 that stylesheet is
layered, selects only its own elements and is harmless beside core's.

A release of the schedule states the ranges of two peers, and a breaking
change in either is a breaking change here. Whatever the schedule uses from
charts stops being an implementation detail the day the schedule imports it:
charts' pure modules are API with two consumers now, the applications and the
schedule.
