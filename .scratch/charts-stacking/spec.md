# Stacked bars and areas

Status: done
Date:   2026-09-24
Origin: the library comparison of 24 Sep 2026 (notes in `docs/research/library-comparison-2026-09/`); order in `.scratch/comparison-roadmap/spec.md`.

## Problem

Shares over time - output by line per shift, downtime by reason per day - need
stacking. `capabilities.md` lists it under "Later"; the comparison sets it to
"should".

## Decisions

Taken on the user's standing trust ("I trust you fully to work out the topics
we really need"); each can be challenged before its ticket starts.

| # | Question | Decision |
| --- | --- | --- |
| K1 | API | `stack="<group id>"` on `Bar` and `Area`: series with the same id stack in registration order, on their shared x and y axis. |
| K2 | Model | The materialised series gets its baseline from the stack below (the existing baseline channel, ADR-0011) - no second drawing path. |
| K3 | Gaps and negatives | A gap stacks as zero for the series above it and is no hit; negative values stack downward from zero separately (the common convention). |
| K4 | Tooltip and readout | Each series' own value, and the stack's total as a last row (wording). |
| K5 | Percent | `stack` with `normalize` for 100 % stacks, the y axis in percent. |

## Solution

| Ticket | Scope | Size |
| --- | --- | --- |
| 01 | Stacking in the materialisation | M |
| 02 | Drawing, hit and tooltip | M |
| 03 | Percent stacks | S |
| 04 | Final polish round | S |

## Testing

Pure stacking tests first; jsdom tooltip; screenshots of each example.

## Out of scope

Stacked lines (a line is a course, not a share); streamgraphs.
