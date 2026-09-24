import { useTable } from "../../../src";

export const title = "Never an average of averages";

/* The scrap rate of a line is its scrap over its pieces - not the average of
   the orders' rates. The middle column averages the rates: a small order with
   a bad rate weighs as much as a big one, and Line 2 looks three times as bad
   as it is (3 % instead of 1 %) - because of 150 pieces. The right column
   divides the sums, with an aggregate of one's own, and the band and the
   footer are right.

   The table never computes a group from the groups inside it - every
   aggregate is taken from the rows themselves - but it cannot know that a
   rate must be weighted. That is the application's to say. */

interface Order {
  id: string;
  line: string;
  shift: string;
  pieces: number;
  scrap: number;
}

const ORDERS: Order[] = [
  { id: "A-1041", line: "Line 1", shift: "Early", pieces: 1200, scrap: 14 },
  { id: "A-1044", line: "Line 1", shift: "Late", pieces: 800, scrap: 3 },
  { id: "A-1052", line: "Line 1", shift: "Late", pieces: 2400, scrap: 31 },
  { id: "A-1043", line: "Line 2", shift: "Early", pieces: 5000, scrap: 62 },
  { id: "A-1049", line: "Line 2", shift: "Early", pieces: 3200, scrap: 18 },
  { id: "A-1057", line: "Line 2", shift: "Late", pieces: 150, scrap: 9 },
];

const rate = (o: Order) => o.scrap / o.pieces;

export default function NeverAnAverageOfAverages() {
  const { Table, Column } = useTable(ORDERS, { rowKey: (o) => o.id, defaultGrouping: ["line", "shift"] });
  return (
    <Table ariaLabel="Scrap rate by line">
      <Column value="shift" label="Shift" />
      <Column value="line" label="Line" />
      <Column value="id" label="Order" rowHeader />
      <Column value="pieces" label="Pieces" format="count" aggregate="sum" share={false} />
      <Column value="scrap" label="Scrap" aggregate="sum" share={false} />
      <Column id="rateAveraged" value={rate} label="Rate, averaged" format="percent" aggregate="avg" />
      <Column
        id="rate"
        value={rate}
        label="Rate, weighted"
        format="percent"
        aggregate={(_, rows) => rows.reduce((s, o) => s + o.scrap, 0) / rows.reduce((s, o) => s + o.pieces, 0)}
      />
    </Table>
  );
}
