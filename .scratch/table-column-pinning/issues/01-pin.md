# 01 - Pinned columns

Status: done
Type: task

Spec: `.scratch/table-column-pinning/spec.md`

## Scope

N1, N3 including grouping spans and virtual rows.

## Acceptance

- Screenshots scrolled; unit tests of the view state.

## Comments

**Done (2026-09-25).** `pin: "start" | "end"` on `Column` and `VerdictColumn`,
`t.pinned` / `t.setPin`, `pinned` in the view (the whole choice once it deviates
from the declaration). `stickyRowHeader` is `pin: "start"` on the row header.

- Pure model in `src/model/pinning.ts`: order, declaration, choice, view, and
  `pinOf` - where a cell covering head cells `first..last` sticks. A cell that
  reaches past its block does not stick.
- The blocks count head-row cells: selection, expander and a group span join
  the start block, the row actions the end block. Offsets are measured off the
  head row into `--u-table-pin-{start,end}-N` on the table (after every render
  and on a ResizeObserver), not assumed from the control cells' 34 px.
- Grouping: a group header's label covers the span and only the pinned columns
  of its leading run (a cell without text fills the rest); a folded span's
  count likewise; the leading run stops before the end block.
- N3: the group header's stuck gradient turned on its side, as `::before` on
  each block's inner-edge cell, visible while `data-under-start` /
  `data-under-end` mark the scroll area.
- Found on the way, measured in pixels: with pinned cells Chromium left a group
  header's collapsed top border out over the pinned selection and actions
  cells. In a table with pins that line is drawn as an inset shadow; on the
  sunken tone it reads a step darker (217 against 227 in light) - a card for 03.
- Every existing baseline held; new: the example at rest and three scrolled
  states (`pinning.spec.ts`), light and dark, each looked at.

For 03: the shadow in dark (the stuck header's formula, reads as a light
glow), the verdict column's width in the example, and the line above a group
header in a pinned table.

**Review (2026-09-25, standards and spec against `main`).** Fixed: a focused
virtual group header in a pinned table lost its ring between its end cells (the
inset line above the header overrode it - now only when not focused); the
ResizeObserver kept watching the old cell when one pinned column was swapped for
another; a group header without a span over a first column with an aggregate
got a label of `colSpan` 0 (counted as one, every aggregate a column too far
right) - the label now takes that column's place, the sum stays in the footer;
a stale comment reference; `Pin` used instead of the literal where the module
may import it. Decided, not changed: a detail row scrolls with its row - its
content belongs to the row, not to a block; the compact density needs nothing
of its own, since the offsets are measured, not derived from a row height. Left
as judgement calls: the repeated `pinAt(x).className` / `.style` pair per cell,
and the 6 px / 9 % shadow copied from the stuck group header (a token for both
would be a card in 03).
