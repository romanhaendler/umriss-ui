# 05 - Final polish round

Status: done
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
- Compact (checked 2026-09-26): nothing shifts - the fields (26 px) fill the 27 px row almost edge to edge, and their text is the regular size beside the compact type of the rows.

Judged and closed on the rendered demo (2026-10-10), Chromium and WebKit, light and dark, 1280 and 390 px (Firefox would not start in the sandbox; its engine-specific risk here is nil, since nothing in these findings is engine-specific CSS). Pictures: `reports/acceptance-2026-10-10/s1/`.

- The row line stops short of the pinned actions cell: gone. Every cell of a row, the pinned actions cell included, has the same 1 px bottom rule and the same height (measured in Edits 03, 05, 06 and in Keep a list; same in both engines, at rest and with a draft open).
- "Save or discard this row first" runs past the table edge: gone. It now opens beneath the buttons and stays inside the table at 1280 px (right edge 1228 of 1236) and inside the viewport at 390 px (right edge 338 of 390).
- Save as a black primary beside a ghost Discard: taste, left. In the dense table it reads as the one action of a draft, and the draft row is tinted already; a quieter Save would make the row's only way out look optional.
- Text buttons rather than glyphs: taste, left. The words are wording, so they translate (the German subpath), and core has no check/cross/bin glyph; none added.
- The reserved width makes the actions column wide at rest: taste, left. It is the 173 px for Save and Discard side by side, so opening a draft shifts nothing. The Item wrap no longer happens: in Keep a list at 1100 px the column is 187 px and every row is one line (36 px); at 390 px the table scrolls in its own frame.
- Compact: fine. Edit a dense table keeps the row at 27 px with a draft open, the fields and buttons clear of the row lines, in both engines and both schemes.
