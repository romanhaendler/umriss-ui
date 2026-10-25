# Alarm management: where it lives and which ADR carries it

Type:   grilling
Status: resolved

## Question

Decisions 1 and 2 of `.scratch/alarm-management/requirements.md` part B:

1. Model, `PriorityMark` and banner in core with the list in table (the persona's A10.1), or a new package
   `@umriss-ui/alarms` depending on core and table (the coordinator's recommendation)? The new package adds a
   seventh published package, changes the dependency map in `CLAUDE.md` ("nothing depends on the table"),
   needs a demo of its own under ADR-0020 and carries the standards claim with it. Core lost the model in 0.34
   for a reason - which one, and does it still hold?
2. ADR-0009 and ADR-0057 restored under one new ADR that keeps the boundary (generation, thresholds,
   authorisation, audit and sound are the application's) and adds first-out and the banner?

Also confirm part B.1: the first ticket restores `e027d1f7^` (model, list, tests) unchanged and green, every
change follows against that baseline. Costly to reverse: the ADR is written from this answer.

## Answer

Decided 2026-10-25 by the maintainer.

- **A new published package `@umriss-ui/alarms`**, depending on core and table. Core and table stay general;
  the control-room audience finds model, list, `PriorityMark` and banner in one place, and the package carries
  the standards claim. Costs accepted: a seventh published package, a demo of its own under ADR-0020, and
  `CLAUDE.md`'s dependency map changes ("nothing depends on the table" no longer holds).
- **One new ADR supersedes the withdrawn ADR-0009 and ADR-0057.** It keeps their boundary (generation,
  thresholds, authorisation, audit trail, persistence and sound output are the application's) and adds
  first-out and the banner. It is written as the alarms spec's first ticket.
- **Part B.1 confirmed:** the first implementation ticket restores `e027d1f7^` (model, list, tests) unchanged
  and green, moved into the new package; every change follows as its own ticket against that baseline.
- **Becomes** the spec `.scratch/alarms/`, written after "Alarm management: the standards claim and the slices
  of the first version".
