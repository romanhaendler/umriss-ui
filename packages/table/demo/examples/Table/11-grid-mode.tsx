import { useTable } from "../../../src";

export const title = "Grid mode: cell by cell";

/* `grid` makes the table one tab stop with an Active cell the arrows walk:
   Home and End to the row's ends, Ctrl+Home and Ctrl+End to the table's,
   PageUp and PageDown by the rows in view. The head and the footer are lines
   like the rows.

   A cell's own controls - the checkbox, the row's actions, a sort button in
   the head - leave the tab order. Enter or F2 reaches them, Escape goes back
   to the cell. Without `grid` the table stays a native table, which a screen
   reader reads with its own table keys: a table that is only read keeps it.

   To try it: Tab into the table, walk to a checkbox, Enter, Space, Escape. */

interface Pump {
  tag: string;
  area: string;
  flow: number;
  state: string;
}

const PUMPS: Pump[] = [
  { tag: "P-101", area: "Intake", flow: 124.5, state: "Running" },
  { tag: "P-102", area: "Intake", flow: 118.2, state: "Running" },
  { tag: "P-201", area: "Filtration", flow: 0, state: "Stopped" },
  { tag: "P-202", area: "Filtration", flow: 96.4, state: "Running" },
  { tag: "P-301", area: "Distribution", flow: 210.8, state: "Running" },
];

export default function GridMode() {
  const { Table, Column, RowActions, Action } = useTable(PUMPS, { rowKey: (p) => p.tag });
  return (
    <Table grid selectable ariaLabel="Pumps">
      <Column value="tag" label="Pump" rowHeader />
      <Column value="area" label="Area" />
      <Column value="flow" label="Flow m³/h" format={{ decimals: 1 }} aggregate="sum" />
      <Column value="state" label="State" />
      <RowActions>
        <Action onSelect={() => undefined}>Trend</Action>
      </RowActions>
    </Table>
  );
}
