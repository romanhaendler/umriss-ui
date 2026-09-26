# The grid: edit on the first click, save a row on purpose, add and delete rows

Status: ready-for-agent
Date:   2026-09-26
Origin: the user, 26 Sep 2026: "Der Editiermodus der Tabelle ist so unbrauchbar" -
a click opens nothing, nothing shows a cell edits, and every cell is saved on
its own. Grilled the same day; ADR-0036, **Row draft** in `CONTEXT.md`.

## Problem

ADR-0034's grid opens an editor on Enter, F2 or a typed key only; a click just
makes the cell active. Nothing under the pointer tells a cell edits. Every
edit is reported the moment its cell is left, so fields that belong together
are written one by one, and a row can be neither added nor deleted.

## Decisions

| # | Question | Decision |
| --- | --- | --- |
| R1 | Click | The first click on a cell that edits makes it active and opens its editor, every kind: a select opens its list, a date its calendar. Arrows and Tab walk without editing. |
| R2 | Pointer | `cursor: text` over a text or number, `pointer` over select, date, own editor; the hover tint of the interaction-state canon. No mark at rest. |
| R3 | Modes | `editMode?: "cell" \| "row"`, default `"cell"` (ADR-0034's behaviour, with R1/R2). |
| R4 | Grid only | All of it needs `<Table grid>`, as before. |
| R5 | Row opens whole | In row mode a click (or Enter/F2/typing) on an editable cell opens every editable cell of the row; the focus lands in the one clicked; Tab walks the row's editors. |
| R6 | Save column | A column the table adds, pinned at the end: Save ✓ and Discard ✕ (labelled) on the draft row, empty elsewhere (or the delete button, R12). Enter saves, Escape discards; a column's own editor may keep Enter. |
| R7 | One draft | At most one **Row draft**. A click, focus or button into another row is refused: the draft stays, its Save shows a hint ("Save or discard this row first"). |
| R8 | Validation | Save runs every open cell's `validate`; all messages at once; the draft stays open. No row-wide validate. |
| R9 | Report | `onRowSave({ rowKey, changes, row })`, `changes` the changed columns only; unchanged save reports nothing and closes. The table applies nothing. |
| R10 | Rows change | The draft row keeps its place (sort/filter by the stored values); new `rows` leave the draft; a row gone from `rows` drops its draft silently. |
| R11 | New row | `onRowAdd` shows "New row" in the toolbar (footer without a toolbar); an empty **Row draft** above the body's rows, independent of sort, filter, page; `newRow?: () => Partial<T>` for defaults; Save validates all, reports `onRowAdd({ values })`; it appears once the application puts it into `rows`. A draft elsewhere refuses the button (R7). Both modes. |
| R12 | Delete | `onRowDelete` puts 🗑 into the action column on every row without a draft; a click turns it into "Delete? ✓ ✕" in the row; ✓ reports `onRowDelete({ rowKey, row })`. Both modes. |
| R13 | Keys | No Delete key, no shortcut for a new row. |

## Solution

| Ticket | Scope | Size |
| --- | --- | --- |
| 01 | First click edits; the pointer shows it | S |
| 02 | Row mode: the Row draft, the action column, `onRowSave` | L |
| 03 | New row and delete | M |
| 04 | Examples | S |
| 05 | Final polish round | S |

## Testing

At the table's public interface (the existing grid tests are the pattern):
click opens, the row opens whole, refusal, validate on save, the reports'
payloads, the new row, the delete's ask. Playwright for the pointer and the
pinned column; axe over row mode.

## Out of scope

A row-wide `validateRow`; undo; several drafts; inline create in sort order.

## Comments

**01-04 done (2026-09-26)** on branch `worktree-table-row-editing`; 05 waits for the user on the rendered pages.
