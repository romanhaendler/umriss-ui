# 05 - Final polish round

Status: ready-for-human
Type: task
Blocked by: 04

Spec: `.scratch/table-row-editing/spec.md`

## Scope

The look of the hover tint, the action column, the draft row and the delete ask, judged on the rendered page and signed off by the user.

## Comments

Found while checking the rendered pages (2026-09-26), for this round:

- The row line stops short of the pinned actions cell.
- "Save or discard this row first" opens rightwards from the buttons and can run past the table edge.
- Save as a black primary beside a ghost Discard - loud in a dense table?
- Text buttons (Save, Discard, Delete) rather than glyphs: core exports no check/cross/bin glyph.
- The reserved width makes the actions column wide at rest (Item wraps in Edits 05 at 1100 px).
