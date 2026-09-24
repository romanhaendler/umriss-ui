# What umriss deliberately is not, and docs that match

Status: done
Date:   2026-09-24
Origin: the library comparison of 24 Sep 2026 (notes in `docs/research/library-comparison-2026-09/`); order in `.scratch/comparison-roadmap/spec.md`.

## Problem

The comparison lists what umriss should deliberately not build - pivot, range
selection, undo in the table; pie, radar, candlestick, log scale, WebGL in the
charts; dependency types and critical path in the schedule; rich text,
carousel; more languages and RTL. Today these are scattered "Out" lists or
silent gaps. And two small contradictions undercut a library whose argument is
honesty: core's README still lists the danger text tone as open (shipped in
core 0.7.0), and the benchmark figures differ between the charts README and
`capabilities.md`.

## Decisions

Taken on the user's standing trust ("I trust you fully to work out the topics
we really need"); each can be challenged before its ticket starts.

| # | Question | Decision |
| --- | --- | --- |
| H1 | One ADR for the non-goals | ADR-0032 "What umriss is not": each non-goal with the domain reason and what a caller does instead (e.g. pivot: the application's; RTL: not for a DE/EN plant library). |
| H2 | One source for figures | The benchmark figures stand once, in `capabilities.md`; the README links there instead of repeating them. |
| H3 | Stale roadmap lines | Every README roadmap checked against the specs' statuses; a lint-free test is not worth it, a checklist in `docs/releasing.md` is. |

## Solution

| Ticket | Scope | Size |
| --- | --- | --- |
| 01 | ADR-0032: what umriss is not | S |
| 02 | README truth | S |

## Testing

Reading, not tests: the ADR and the READMEs reviewed against the specs.

## Out of scope

Rewriting the capabilities documents.
