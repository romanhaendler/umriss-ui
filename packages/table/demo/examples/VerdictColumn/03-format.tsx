import type { LimitSet } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "format and a computed value";

/* `format` writes the value and its excess with the same presentation - here as
   a percentage. What is exported is the value, not the verdict: whoever needs
   the verdict in the spreadsheet has the limit set.

   The value may be computed; the column then needs an `id`, like any other.

   The field names of the limit set stay German: it is the wire format
   @umriss-ui/core and @umriss-ui/charts agree on. */

interface Batch {
  batch: string;
  good: number;
  total: number;
}

const YIELD: LimitSet = {
  limits: [
    { value: 0.97, side: "lower", severity: "warning" },
    { value: 0.94, side: "lower", severity: "alarm" },
  ],
};

const BATCHES: Batch[] = [
  { batch: "CH-7710", good: 4912, total: 5000 },
  { batch: "CH-7712", good: 4790, total: 5000 },
  { batch: "CH-7715", good: 4600, total: 5000 },
];

export default function Format() {
  const { Table, Column, VerdictColumn } = useTable(BATCHES, { rowKey: (b) => b.batch });

  return (
    <Table ariaLabel="Batches">
      <Column value="batch" label="Batch" rowHeader />
      <Column value="good" label="Good parts" format="count" />
      <VerdictColumn id="yield" label="Yield" value={(b) => b.good / b.total} limits={YIELD} format="percent" />
    </Table>
  );
}
