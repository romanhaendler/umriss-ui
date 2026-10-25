# 03 - The current row by the keyboard

Status: ready-for-agent
Type: task
Size: M

Blocked by: `02-the-current-row-by-the-pointer.md`
Spec: `.scratch/linked-views/spec.md`

## What to build

A keyboard user reaches what the click reaches, in a native table and in grid mode.

- **Native table.** With `onCurrentRowChange`, the row-header cell's content is rendered inside a `button`.
  - The controls the table itself puts into that cell, such as a tree row's toggle, stay beside the button,
    not inside it.
  - The button takes the cell's text style and draws only the shared focus ring.
  - Its name is the row header's text. On the current row it carries `aria-current="true"`.
  - Enter and Space are the button's own.
  - Pinned and sticky row headers, virtual rows and grouped tables keep working.
- **Grid mode.** No button.
  - In the grid's key handler, Enter on a cell that neither edits nor holds a control reports its row.
  - Enter on a cell with controls still enters them, and Space still selects.
- **No row header.** With `onCurrentRowChange` and no `rowHeader` column, `warnOnce` says that the keyboard
  cannot choose a row without a row header. The pointer still works.
- **Docs.**
  - The prop's documentation says that a control of one's own in the row-header cell would stand inside the
    button.
  - The example of ticket 02 names the key in its lead.

## Acceptance criteria

- [ ] Mounted tests in `tests-unit/currentRow.test.tsx`:
  - a native table's row header holds one button per row, and Enter on it reports;
  - a tree row's toggle stays outside the button;
  - in grid mode no button is rendered;
  - in grid mode, Enter on a plain cell reports, Enter on a cell with a control enters it, and Space selects;
  - without a row header there is one development warning, and none in a production build.
- [ ] Without `onCurrentRowChange` the row header renders as before.
- [ ] The accessibility check passes. The example's screenshot is unchanged, except for the focus ring when
      the button is focused.
- [ ] `pnpm check table` and `pnpm check:site` pass.
