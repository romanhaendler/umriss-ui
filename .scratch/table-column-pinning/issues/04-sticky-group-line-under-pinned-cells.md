# 04 - A sticking group line lay under the pinned cells of the rows it passed

Status: done
Type: bug

Spec: `.scratch/table-column-pinning/spec.md`

## Symptom

Table demo, `grid-mode` / "the-whole-grid" (grouped, selection column and the
Parcel column pinned, virtual rows): scrolled down by about 150 px, the sticking
group line showed only its part right of the pinned block. Its label, fold and
checkbox were hidden by the pinned cells (checkbox, parcel number) of the data
row beneath. Unscrolled it looked right, so no baseline showed it.

## Cause

A group line's pinned cells and every data row's pinned cells had the same
`z-index: 2` (`.sticky tbody tr.groupHeader > .pinned`, `.pinned`). The rows
come later in the document, so at that level they paint over the line once it
sticks. The same holds for the pinned span cell of a group's first row.

## Fix

`Table.module.css`: one rule, the pinned cells of a group header and the pinned
span cell of a group's first row stand at `z-index: 3`, as the head's pinned
cells do. Affected: every sticky table with a pinned column and groups, with or
without grid mode, selection column, pinning at the end, several levels, virtual
or not. A footer does not stick vertically and is not affected.

Test: `tests-visual/pinning.spec.ts`, "a sticking group line lies over the
pinned cells of the rows it passes".
