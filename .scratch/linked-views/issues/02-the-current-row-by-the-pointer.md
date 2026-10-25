# 02 - The current row by the pointer, and its mark

Status: ready-for-agent
Type: task
Size: M

Blocked by: `01-the-adr-a-current-row.md`
Spec: `.scratch/linked-views/spec.md`

## What to build

The tracer bullet through the table. A developer passes `currentRow` and `onCurrentRowChange` to `Table`. A
click on a row reports that row, and the row the application holds is marked.

- **Props.** On `TableProps`, beside `rowProps`: `currentRow?: string | null` and
  `onCurrentRowChange?: (key: string, row: Z) => void`. Document them in the voice of the props around them.
  The table keeps no state for them.
- **The click.** One handler on the table, not one per row.
  - It reports a primary-button click on a body row whose target is not inside a control of that row. Use the
    selector grid mode uses for a cell's own controls.
  - Group headers, group spans, details, the footer and a new-row draft report nothing.
  - A click on the current row reports again.
  - In grid mode, a click that opens an editor still reports.
- **The mark.** The row whose key is `currentRow`:
  - gets `aria-current="true"`;
  - gets an accent bar at its inline start, drawn inside its first cell, so the row does not grow and a pinned
    or sticky first cell keeps the bar;
  - keeps the bar beside the selection's ground, so a row that is both shows both;
  - in forced colours, has its bar drawn in a system colour that is told apart from the selection's lines.

  No new token.
- **Without the props**, the DOM is unchanged.
- **The example** goes on the table's Selection page as "The current row": a short table of machines with a
  selection column, a detail beside it for the current row, and the key held in the example's state. Its lead
  says that the current row and the selection are independent.
- **`API.md`**, regenerated with `pnpm --filter @umriss-ui/table props`.

## Acceptance criteria

- [ ] Mounted tests in `tests-unit/currentRow.test.tsx`:
  - a click on a cell reports the key and the row;
  - the checkbox, the expander, a row action and a button in a cell report nothing;
  - a group header and a detail report nothing;
  - a click on the current row reports again;
  - `aria-current` stands on the current row only;
  - ticking a row does not change the current row, and choosing a row ticks nothing;
  - without the props, the rendered DOM equals today's.
- [ ] `types.test-d.tsx`: the handler's row has the table's row type.
- [ ] Screenshot baselines of the example, with a current row that is also selected, in light and in forced
      colours, looked at before they are accepted.
- [ ] The accessibility check passes on the Selection page.
- [ ] `pnpm check table` and `pnpm check:site` pass.
- [ ] The changelog's next version names the two props under "Added".
