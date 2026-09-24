import { useTable } from "../../../src";

export const title = "Absent values do not count";

/* The laboratory has not measured every batch yet. An absent value is not
   zero: the average hardness is over the four measured batches, not over six
   with two zeros - that would put it at 40 instead of 60 HRC. A column
   without a single value present has no aggregate at all, and says so with
   the dash. */

interface Batch {
  batch: string;
  hardness: number | null;
  retest: number | null;
}

const BATCHES: Batch[] = [
  { batch: "C-8810", hardness: 58.5, retest: null },
  { batch: "C-8811", hardness: null, retest: null },
  { batch: "C-8812", hardness: 61.0, retest: null },
  { batch: "C-8813", hardness: 59.5, retest: null },
  { batch: "C-8814", hardness: null, retest: null },
  { batch: "C-8815", hardness: 61.0, retest: null },
];

export default function AbsentValues() {
  const { Table, Column } = useTable(BATCHES, { rowKey: (b) => b.batch });
  return (
    <Table ariaLabel="Hardness by batch">
      <Column value="batch" label="Batch" rowHeader />
      <Column value="hardness" label="Hardness (HRC)" format={{ decimals: 1 }} aggregate="avg" />
      <Column value="retest" label="Retest (HRC)" format={{ decimals: 1 }} aggregate="avg" />
    </Table>
  );
}
