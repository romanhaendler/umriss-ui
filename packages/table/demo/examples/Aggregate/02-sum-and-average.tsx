import { Search, Toolbar, useTable } from "../../../src";

export const title = "Sum and average";

/* The footer is the aggregate over the filtered set - not over the page and
   not over every row. Search for "Line 2" and the sums are line 2's. An
   average counts only the values present: lot L-5514 has no scrap reading yet,
   and it is not a zero. */

interface Lot {
  lot: string;
  line: string;
  pieces: number;
  scrap: number | null;
}

const LOTS: Lot[] = [
  { lot: "L-5510", line: "Line 1", pieces: 1200, scrap: 0.012 },
  { lot: "L-5511", line: "Line 2", pieces: 860, scrap: 0.031 },
  { lot: "L-5512", line: "Line 1", pieces: 1450, scrap: 0.008 },
  { lot: "L-5513", line: "Line 2", pieces: 640, scrap: 0.024 },
  { lot: "L-5514", line: "Line 2", pieces: 910, scrap: null },
];

export default function SumAndAverage() {
  const { Table, Column } = useTable(LOTS, { rowKey: (l) => l.lot });
  return (
    <Table ariaLabel="Lots">
      <Toolbar>
        <Search />
      </Toolbar>
      <Column value="lot" label="Lot" rowHeader />
      <Column value="line" label="Line" />
      <Column value="pieces" label="Pieces" format="count" aggregate="sum" />
      <Column value="scrap" label="Scrap rate" format="percent" aggregate="avg" />
    </Table>
  );
}
