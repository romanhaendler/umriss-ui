# Alarm management: where it lives and which ADR carries it

Type:   grilling
Status: open

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
