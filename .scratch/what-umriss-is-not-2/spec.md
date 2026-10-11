# What umriss is not, second part

Status: ready-for-agent
Date:   2026-10-11
Origin: `.scratch/open-points-roadmap/spec.md`, rows C6, C7, C8 (the chart kinds)
and X4, X5 (time zones, form validation, a dashboard a user arranges); the facts
in `docs/research/open-points-2026-10/five_topics.md`.

## Problem Statement

ADR-0032 answers "not yet, or never?" for the questions a reader brings from a
comparison table. Three things have moved since it was written in September.

The charts' set of kinds was called closed: "there is no renderer interface for
third parties", and horizontal bars, pie, donut, radar and candlestick all stood
under one "never". The maintainer reopened it on 11 October for horizontal bars
(a ranking with long names), Sankey, a bullet graph and a treemap. ADR-0032
still says "closed", `capabilities.md` still lists horizontal bars under "Out",
and the charts' README still lists them among what the charts "deliberately
cannot do". A reader finds the library saying the opposite of its plan.

The second gap is the reverse: three questions are asked that no document
answers. "Does it validate forms?" - `FormField` says so in one code comment.
"Can a user arrange the tiles of a dashboard?" - `CONTEXT.md` says there is no
layout grid, about a date picker's month. "Can I show the plant's time zone?" -
three `limits` lines in core's demo outline say "No time zones other than the
browser's", and the charts say nothing. Not one of them is where a reader looks.

## Decisions

Carried out from the roadmap, not argued: C6 to C8 and X4 and X5 (the text of
each is in `.scratch/open-points-roadmap/spec.md`).

| # | Question | Decision |
| --- | --- | --- |
| W1 | Two ADRs, not one | The kinds are a *change of mind* about a sentence of ADR-0032; the three others are *additions* to its list. The first supersedes, the second only extends and says so. |
| W2 | How ADR-0032 learns of them | Its status line only, as ADR-0052 did, and nothing in the body: the first ADR is "superseded in two points" (the sentence "the set of kinds is closed", and the exclusion of horizontal bars); the second is named in a closing pointer on the status line, "extended by". ADR-0032 is otherwise unchanged, as the README of the ADRs requires. |
| W3 | Horizontal bars | The exclusion in ADR-0032 ("bars grow along the y axis") is superseded as well, not only the sentence of the roadmap: a kind named as the first to come cannot also stand under "never". It moves from "never" to "not yet, and first". |
| W4 | "Not yet" in an ADR | ADR-0032 said that "not yet" lives in the packages' records and the specs. The second ADR is the first to hold one (time zones), because a reader who asks "never, or not yet?" must get both answers in one place. The status of the entry says which: *never* or *not yet*. |
| W5 | Where a reader finds them | Both ADRs are added to `DOCUMENTS` in `packages/demo/src/tooling/documents.ts` (ADR-0046) as pages of the site beside ADR-0032, and to the map in `docs/README.md` in the row that names ADR-0032. |
| W6 | The kinds' questions | Each kind that is named has to answer, in its own ADR when it is built, the questions the first ADR lists for it. The first ADR does not decide the kind, it decides what the deciding must show. |

## The two ADRs

1. **The set of chart kinds is open, by the question each one answers.**
   Supersedes ADR-0032 in "the set of kinds is closed" and in horizontal
   bars. Ticket 01.
2. **Validation and a layout editor are never, time zones are not yet.**
   Extends ADR-0032. Ticket 02.

Each ticket carries the ADR's title as a sentence, its bold decision sentence,
the alternatives that were real and the consequences, so that writing it is
transcription. Numbers are "the next free number at the time"; neither ticket
quotes one.

## The documents that follow

Ticket 03, after both ADRs have numbers: where each sentence must also stand.

| Sentence | Also stands in |
| --- | --- |
| The test for a new kind; the six exclusions that stand | `packages/charts/docs/capabilities.md` ("Out" and "Later"); the charts' `demo/outline.ts` `limits` |
| Horizontal bars first; Sankey, bullet graph, treemap named | `capabilities.md` "Later"; the charts' README under "Seven series kinds" (a sentence after the list) |
| "Validation is the caller's" | the comment of `FormField`; core's `demo/outline.ts` `limits` of `FormField`; core's README next to its link to ADR-0032 |
| "A dashboard a user arranges is never" | core's `demo/outline.ts` `limits` of `Grid`/`Stack`/`Splitter`; core's README |
| "umriss shows the reader's time" | `capabilities.md` ("Known limits"); the three `limits` lines of core's outline that say it already; the charts' time-axis `limits`; the schedule's README beside its dates |
| The pointers | `docs/README.md` map; `docs/adr/README.md` index; ADR-0032's status line |

## Solution

| Ticket | Scope | Size | Blocked by |
| --- | --- | --- | --- |
| 01 | ADR: the set of chart kinds is open; `capabilities.md`, the charts' README and ADR-0032's status line brought into line | S | - |
| 02 | ADR: validation and a layout editor are never, time zones not yet | S | 01 |
| 03 | The documents that follow, from the table above | S | 01, 02 |

02 waits for 01 only so that the two do not both edit the ADR index and the
count of decisions in `docs/adr/README.md` ("Fifty-eight") at once.

## Testing

Reading, as in `non-goals-and-honest-docs`: each sentence of the table found at
its place, each reference to an ADR resolving to a file. The one machine check
that exists is `documentFaults` in `packages/demo/src/tooling/site.ts`, which the
page build runs over the two new entries of `DOCUMENTS`.

## Out of scope

Building any of the kinds (each has a spec of its own, in the order of the
roadmap's package C), a `timeZone` option, a validation helper, and a layout
editor. The unrelated "Out" entries - WebGL, smoothing, animation, export,
stacked lines, jitter - are not touched.

## Decided while writing

- The first ADR also supersedes the horizontal-bars exclusion (W3), which the roadmap names only as "first to come".
- The second ADR extends ADR-0032 and does not supersede it (W1, W2); it is the first ADR to hold a "not yet" (W4).
- Both ADRs become pages of the site (W5), with a line in `DOCUMENTS` each.
- A kind's own ADR answers the questions the first ADR lists; the first decides no kind (W6).
- The table cell's `validate` stays and is named as the one exception to "validation is the caller's", with its reason: a cell editor has no form of the caller's around it.
- What an application does today for time is two real things - set the machine's zone, send instants with an offset - and one it should not do: shift timestamps.
- Ticket 02 waits for 01 so the index is edited once at a time.
