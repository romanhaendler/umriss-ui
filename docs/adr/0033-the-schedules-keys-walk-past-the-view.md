# The schedule's keys walk past the view

Status: accepted
Date:   2026-09

The schedule took the charts' pattern for keyboard and screen reader
(ADR-0030): one tab stop with `role="application"`, one active position shared
by pointer and keys, a polite readout once the keys rest. Its active position
is the **Active subtask** (`.scratch/schedule-a11y/spec.md`).

It departs from one consequence of ADR-0030. There, "the walk stays inside the
visible domain", and pan by key exists only where the caller controls the
domain. **The schedule's walk covers the whole row, and the view pans and
scrolls to bring the active subtask into it.**

## Why

The charts pan only where the caller owns the domain (`onDomainChange`); a
chart without it has nothing beyond its view to reach. The schedule always
pans - by drag, by wheel, and along at the edge of a drag - and owns its view.
A walk held inside the view would leave a keyboard stranded in the span the
schedule mounted with, with no key to leave it: S2 has no pan keys, and adding
a second set of keys to do what the walk can do as it goes would be one more
thing to learn in an application role. The pan the keys make is reported
through `onDomainChange` like any other.

## Consequences

- The visible span still matters to the keys: coming in, the walk starts at
  the first subtask in view on the topmost row scrolled into view, and
  PageUp/PageDown jump a tenth of the visible span.
- The view moves only as far as the active subtask needs, with a small margin
  at the side it came in from; a subtask wider than the view shows its start.
- Everything else of ADR-0030 holds unchanged.
