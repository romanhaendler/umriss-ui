# The active node and the checked set are two states, not one

Status: accepted
Date:   2026-08

> **Status:** accepted, but its Consequences section is superseded in part by
> [ADR-0005](./0005-what-cannot-be-checked.md). The separation of the two states
> stands. The exclusion of disabled nodes and of lazily-loaded children does
> not: it rested on a rule we never needed.

A tree answers two questions that look alike and are not. "Where am I" has
exactly one answer — the **active node**, which carries focus, drives the
detail pane and moves under the arrow keys. "What have I picked" has any number
of answers — the **checked set**, which drives bulk actions. We keep them as
separate state and never derive one from the other.

Most tree components conflate them behind a single `selected` prop, which is why
this ADR exists: a future reader will see two states where they expected one.
The conflation cannot be undone later without breaking every call site, because
by then callers depend on whichever meaning they happened to need.

## Consequences

Checking cascades: checking a branch checks every descendant, unchecking
unchecks them, and a branch whose descendants are partly checked is
**indeterminate** — derived from them, never stored. Moving the active node
checks nothing.

**This is why children are never loaded on demand.** A cascading check has to be
able to reach every descendant of the node it is applied to. Children that have
not arrived yet cannot be reached, so a lazily-loaded tree would need a third
check state — "checked, extent unknown" — that no checkbox can render and no
caller can act on. Lazy loading and cascading checks are not both available; we
chose the cascade, and a lazily-loaded tree would have to revisit this decision
rather than extend it.

Disabled nodes are excluded for the same reason in miniature: a branch whose
descendants include one that may not be checked can never reach the fully-checked
state, which turns a two-value question into a three-value one.
