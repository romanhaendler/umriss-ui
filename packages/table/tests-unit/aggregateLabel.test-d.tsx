/* `aggregateLabel` is accepted on a field column, a computed column and a VerdictColumn. */

import { useTable } from "../src";

interface Line {
  id: string;
  cycle: number;
}
declare const lines: Line[];

export function Named() {
  const { Table, Column, VerdictColumn } = useTable(lines, { rowKey: (l) => l.id });
  return (
    <Table>
      <Column value="cycle" label="Cycle" aggregate={(v) => v[0]} aggregateLabel="First" />
      <Column id="double" value={(l) => l.cycle * 2} label="Double" aggregate={(v) => v[0]} aggregateLabel="First" />
      <VerdictColumn value="cycle" label="Gauge" limits={{}} aggregate="worst" aggregateLabel="Worst gauge" />
    </Table>
  );
}
