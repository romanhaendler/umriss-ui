# Pinning any column

Status: ready-for-agent
Date:   2026-09-24
Origin: the library comparison of 24 Sep 2026 (notes in `docs/research/library-comparison-2026-09/`); order in `.scratch/comparison-roadmap/spec.md`.

## Problem

Only the first column can stick (`stickyRowHeader`); every other grid pins any
column left or right (free in AG Grid and TanStack, Pro in MUI X). Wide plant
tables need the key column left and the verdict or the actions right.

## Decisions

Taken on the user's standing trust ("I trust you fully to work out the topics
we really need"); each can be challenged before its ticket starts.

| # | Question | Decision |
| --- | --- | --- |
| N1 | API | `pin: "start" | "end"` on a column, and in the view state (so the column menu can change it); `stickyRowHeader` becomes the same as `pin: "start"` on the row header. |
| N2 | Menu | The column menu gets "Pin to start / Pin to end / Unpin". |
| N3 | Shadows | The existing sticky shadow (gradient `::after`) on the inner edge of each pinned block, shown only while content scrolls under it. |

## Solution

| Ticket | Scope | Size |
| --- | --- | --- |
| 01 | Pinned columns | M |
| 02 | Pinning in the column menu | S |
| 03 | Final polish round | S |

## Testing

View-state unit tests; screenshots scrolled left and right; interaction test.

## Out of scope

Pinned rows (top/bottom).
