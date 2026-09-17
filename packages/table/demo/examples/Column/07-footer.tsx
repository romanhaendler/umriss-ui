import { Search, Toolbar, useTable } from "../../../src";

export const title = "Footer: sum and average";

/* `footer="sum"` and `footer="avg"` compute over the filtered set - not over
   the page and not over every row. Whoever searches for "Line 2" sees the sum
   of line 2.

   `footer` is offered for numbers only: on text it does not compile. The footer
   takes the column's format. */

interface Lot {
  lot: string;
  line: string;
  pieces: number;
  scrap: number;
}

const LOTS: Lot[] = [
  { lot: "L-5510", line: "Line 1", pieces: 1200, scrap: 0.012 },
  { lot: "L-5511", line: "Line 2", pieces: 860, scrap: 0.031 },
  { lot: "L-5512", line: "Line 1", pieces: 1450, scrap: 0.008 },
  { lot: "L-5513", line: "Line 2", pieces: 640, scrap: 0.024 },
];

export default function Footer() {
  const { Table, Column } = useTable(LOTS, { rowKey: (l) => l.lot });

  return (
    <Table ariaLabel="Lots">
      <Toolbar>
        <Search placeholder="Search line" />
      </Toolbar>
      <Column value="lot" label="Lot" rowHeader />
      <Column value="line" label="Line" />
      <Column value="pieces" label="Pieces" format="count" footer="sum" />
      <Column value="scrap" label="Scrap" format="percent" footer="avg" />
    </Table>
  );
}
