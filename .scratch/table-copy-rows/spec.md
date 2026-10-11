# Copying rows

Status: ready-for-human
Date:   2026-10-11
Origin: roadmap `.scratch/open-points-roadmap/spec.md`, row T5 and "Taken as
agreed" 5; facts in `docs/research/open-points-2026-10/export_copy_and_wording.md`
sections 2 and 3. ADR-0032 keeps a clipboard for ranges out and names copying
rows among the "later" items; this is that item.

## Problem Statement

A user ticks rows and presses Ctrl+C. Nothing is copied - the browser copies a
text selection and there is none. The same user in grid mode stands on a cell
and presses Ctrl+C; the grid leaves the key alone (`grid.tsx` returns on
`ctrlKey`), and nothing happens. To get rows into a spreadsheet they must
export the whole filtered set and delete what they did not want. A developer
who wants a "Copy" button has no way to the text either: the selected rows can
be computed, but the visible columns and the export's values are internal, and
`asCsv()` ignores the selection.

## Solution

- **Ctrl or Cmd with C** copies the selected rows when the focus is in the table
  and no text is marked: the visible columns in the order shown, a header line,
  tab-separated, with the values the export writes.
- **Grid mode without a selection** copies the **active cell's** value - one
  cell, not a range (ADR-0032 stands).
- **A screen reader is told**, in a live region the table already keeps; no
  toast.
- **`snapshot.selectionAsText()`** hands the same text to a caller's own
  button. The caller writes it to the clipboard or does what they like.

## Decisions

| Decision | Choice | By |
|---|---|---|
| Keys | Ctrl+C / Cmd+C | roadmap T5 |
| What | Selected rows, visible columns in shown order, header line, tab-separated, the export's values | roadmap T5 |
| Grid, no selection | The active cell's value; a cell, not a range | roadmap T5 |
| Feedback | Said to a screen reader, no toast | roadmap T5 |
| For a caller | A small function hands over the same text | roadmap T5 |
| Where the key is heard | One handler on the table's frame (`parts.tsx` "The frame", the element around scroll area and `<table>`), by bubbling from rows, cells and headers. Not on the toolbar. Grid mode needs no second handler: the grid's own `onKeyDown` already returns on `ctrlKey` and lets the key bubble | decided |
| What counts as the key | `ctrlKey` xor `metaKey`, no Alt, no Shift, `event.key.toLowerCase() === "c"`, not `defaultPrevented` | decided |
| "No text is marked" | `window.getSelection()?.toString() === ""`, and the event target is not an editable element (`input`, `textarea`, `select`, `[contenteditable]` - a grid editor, the search field). Otherwise the key is left to the browser untouched | decided |
| Taking the key | `preventDefault()` only once there is text to write; with nothing to copy the key passes | decided |
| Order and set | The selected rows within the filtered set (the toolbar's `selected`: `hook.selectedRows`, or the filtered rows whose key is selected), in the export's order. A selected row filtered out is not copied - the number announced says so | decided |
| Tree rows | Every selected row, open or closed branch alike, in reading order. A branch's descendants are copied only if they are selected themselves. No Level column: a copy is for pasting a choice, the export's Level column is for filtering a file | decided |
| Group rows | Never written, as the export writes none; aggregates are not written. Rows inside a closed group count when selected | decided |
| Server mode | The selected rows the page holds. The selection of all that match (roadmap T2) is a later state; its copy is that spec's question | decided |
| Decimal mark | The formats' mark, as the CSV's (spec `table-export-by-language`): the text is read by the person at this screen, in this language. Booleans "yes"/"no" and dates ISO as in the export. No thousands groups | decided |
| Text rules | `\t` between fields, `\n` between lines, no BOM, a trailing line break not written. A field holding a tab, a line break or `"` is quoted with doubled quotes, as spreadsheets paste and write it | decided |
| Writing | `navigator.clipboard.writeText`; needs a secure context and may refuse (permission, an unfocused document). Fallback: none - a refusal says "Could not copy" to the live region and the console in DEV | decided |
| Announcement | New wording keys in core, English and German: `copiedRows(count, formatted)` ("3 rows copied") and `copiedCell` ("Cell copied"), and `copyFailed`. The count is formatted like `selectedCount` | decided |
| Live region | The toolbar keeps a `role="status"` span that stays in the document; the frame gets one of its own (polite, visually hidden) so a table without a toolbar speaks too | decided |
| The function | `selectionAsText(): string` on `TableSnapshot`; `""` with nothing selected. It reads no active cell: the grid's position is the table's own business | decided |

## User stories

1. As a user, I select rows and press Ctrl+C, and paste them into a spreadsheet as cells, with headers.
2. As a Mac user, Cmd+C does the same.
3. As a grid user, I stand on a cell, press Ctrl+C and have its value.
4. As a user marking text in a cell with the mouse, my own selection is copied, not the rows.
5. As a user typing in a cell editor or the search field, Ctrl+C copies my text.
6. As a screen-reader user, I hear "3 rows copied" or that it failed.
7. As a developer, I call `selectionAsText()` from my "Copy as table" button.
8. As a developer on plain HTTP, I get a spoken refusal, not silence.

## Out of scope

- A range of cells, a paste, cut, undo (ADR-0032). A header row's or column's copy.
- Copy as HTML or as rich text; a toast; a "Copy" button of the library's own.
- A copy of every match in server mode.

## Testing decisions

- Unit: the text writer (tabs, quoting, decimal mark by language, booleans, absent values) against a fixture shared with the CSV.
- Mounted, jsdom: Ctrl+C and Cmd+C with a selection write `selectionAsText()` to a stubbed `navigator.clipboard`; Shift/Alt variants do not; a marked text, a focused input and a grid editor are left alone; no selection and no grid leaves the key; grid with no selection copies the active cell, with a selection copies the rows; tree and group cases; hidden and reordered columns follow the screen.
- The live region says the count or the failure; a refusing clipboard says `copyFailed`.
- `selectionAsText()` equals the text written by the key.
- No visual baseline: nothing is drawn.

## Decided while writing

- One handler on the frame; the active cell is asked of the grid; selected rows only within the filtered set; no Level column; the formats' decimal mark; three wording keys; a live region on the frame; `selectionAsText()` knows no active cell.

## Comments

- 2026-10-11, after the maintainer tried it on the demo ("nothing happens"). Two decisions: (1) what was copied **flashes briefly** - no toast (a table cannot presume a `ToastProvider`), no text in the toolbar; the announcement stays. (2) In an **open cell editor with nothing marked in it** the key copies what stands in the field; with text marked the browser copies it and the table does nothing. Choices: the frame sets `data-copied` by hand on the copied cells (a row's cells, or the one cell) once the clipboard has taken the text, and takes it off at `animationend`; no state, so no row re-renders, and a row outside the virtual window has nothing to flash. A second copy removes and sets it again, which restarts the animation. A failed copy marks nothing. The look: an accent tint mixed into the surface (opaque on pinned cells) fading out over twice `--u-duration-draw` (640 ms); no movement, no outline. Reduced motion: the same tint held 640 ms with no fade (the tokens fall to 0 ms there, so the time is written out); forced colours: `Highlight`/`HighlightText` held the same. Editor: an input or textarea is "marked" when `selectionStart !== selectionEnd` (or the page's selection is non-empty, which Chrome reports for fields); the number editor is a text input, so it has a mark like any other; its typed text is copied as it stands. A select or an own editor has no mark and copies its draft as the cell would copy it unedited (the export's value, e.g. the option's value, an ISO date, not the label). The open editor wins over selected rows. In a Row draft each field's cell is its own editor and copies its own value.

- 2026-10-11, a bug found in the browser: a click on a row's checkbox leaves the focus on it, and the handler turned away from every input, so ticked rows were never copied. The rule now: the key stays with the browser only where the reader can have marked text of their own - a text-like input, a textarea, a contenteditable - and the page's own selection. A checkbox, radio, button, switch or select (the header's select-all included) lets the copy run: selected rows first, else the active cell, whose own cell flashes whichever control holds the focus.
