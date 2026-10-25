# 04 - The current row comes into view

Status: ready-for-agent
Type: task
Size: S

Blocked by: `02-the-current-row-by-the-pointer.md`
Spec: `.scratch/linked-views/spec.md`

## What to build

When another view chooses a row, the table shows it. When `currentRow` changes to a key of the filtered set:

- a paged table goes to that row's page;
- the scroll area brings the row in at its nearest edge;
- a virtual table renders the row into its window, with the mechanism grid mode uses to bring the Active cell
  back.

Focus does not move. Nothing happens for a key outside the filtered set or for a row already in view, so a
click in the table itself does not scroll it.

## Acceptance criteria

- [ ] Mounted tests:
  - a `currentRow` on page 3 moves the table to page 3;
  - a key that is filtered out changes neither the page nor focus;
  - focus stays on the element that had it.
- [ ] A browser test in `tests-visual/features-virtual.spec.ts`: in a virtual table of 2,000 rows, a button
      outside the table sets the current row to row 1,500, and that row is rendered in view and marked.
- [ ] `pnpm check table` passes.
