# 02 - The key and the announcement

Status: done
Type: task
Size: M

Blocked by: 01
Spec: `.scratch/table-copy-rows/spec.md`

## What to build

Ctrl/Cmd+C does it.

- `parts.tsx`, `Frame`: an `onKeyDown` on the frame element that applies the spec's rules (ctrl xor meta, no Alt/Shift, `c`, not `defaultPrevented`, nothing marked via `getSelection().toString()`, target not editable). It picks the text: `selectionText` when rows are selected; otherwise, in grid mode only, the active cell's value.
- `grid.tsx`: the grid hands the frame a function for the active cell's text - the value the export would write for that column and row, as plain text with the same decimal mark; empty for an absent value (an empty cell is still copied as empty, and announced). The grid's own `onKeyDown` is not changed: it already lets Ctrl+C bubble (`ctrlKey` returns, `metaKey` returns first). Add a test that pins it, so a later grid key does not swallow it.
- The write: `navigator.clipboard.writeText(text)` after `preventDefault()`. A missing `navigator.clipboard` (insecure context) or a rejection sets the failure state.
- A visually hidden `aria-live="polite"` region in the frame that stays in the document; it says `copiedRows(count, formatted)`, `copiedCell` or `copyFailed`. The same text again must be heard again: clear and set on the next frame, or toggle a trailing non-breaking space.
- With nothing to copy (no selection, no grid, or no active cell) the key is not taken and nothing is said.

## Acceptance

- [ ] Ctrl+C and Cmd+C with a selection write the text of `selectionAsText()`; Shift/Alt variants and other keys do not.
- [ ] Marked text, a focused input/textarea/select/contenteditable, a grid editor and the search field: the browser's copy, untouched (`defaultPrevented` stays false).
- [ ] Grid mode, no selection: the active cell's value; with a selection: the rows.
- [ ] No selection in a non-grid table: the key passes.
- [ ] The live region announces count or cell; a rejecting or absent clipboard announces the failure and warns in DEV once.
- [ ] Pressing twice announces twice.
- [ ] Server mode copies the page's selected rows; count says how many.
- [ ] No toast, no visible change; no screenshot baselines move.
- [ ] Typecheck, unit and mounted tests pass.

## Comments

Delivered 2026-10-11. One `onKeyDown` on the scroll element of `Frame` (parts.tsx) and a visually hidden `aria-live="polite"` span after it, without `role="status"` (a second status would break every query for the toolbar's). The same text again toggles a trailing no-break space. The active cell's text comes from `grid.state.active` and the frame's grid lines. A test pins that the grid's own handler lets Ctrl+C pass. Not tested mounted: server mode (the page's selected rows come through `hook.selectedRows`, unchanged).
