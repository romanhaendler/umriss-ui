import { useTable } from "../../../src";

export const title = "A range of dates in the band";

/* `"range"` gives the earliest and the latest point in time of a group. In a
   plant's band it answers "from when to when is this plant shipping?" at a
   glance; within one year the year stands once. The footer gives the range of
   the whole filtered set. The customers are the innermost level, a span - fold
   one and its range stands in its line as well. */

interface Delivery {
  id: string;
  plant: string;
  customer: string;
  article: string;
  due: Date;
}

const day = (m: number, d: number) => new Date(2026, m - 1, d);

const DELIVERIES: Delivery[] = [
  { id: "D-7101", plant: "Plant North", customer: "Brenner GmbH", article: "Housing 40", due: day(10, 2) },
  { id: "D-7102", plant: "Plant North", customer: "Brenner GmbH", article: "Housing 60", due: day(10, 16) },
  { id: "D-7103", plant: "Plant North", customer: "Brenner GmbH", article: "Shaft 12", due: day(11, 4) },
  { id: "D-7104", plant: "Plant North", customer: "Kessler AG", article: "Cover plate", due: day(10, 9) },
  { id: "D-7105", plant: "Plant South", customer: "Kessler AG", article: "Bracket", due: day(10, 12) },
  { id: "D-7106", plant: "Plant South", customer: "Lindner Tech", article: "Bushing", due: day(12, 1) },
  { id: "D-7107", plant: "Plant South", customer: "Lindner Tech", article: "Shaft 12", due: day(12, 18) },
];

export default function RangeOfDates() {
  const { Table, Column } = useTable(DELIVERIES, { rowKey: (d) => d.id, defaultGrouping: ["plant", "customer"] });
  return (
    <Table ariaLabel="Deliveries by plant and customer">
      <Column value="plant" label="Plant" />
      <Column value="customer" label="Customer" />
      <Column value="id" label="Delivery" rowHeader />
      <Column value="article" label="Article" />
      <Column value="due" label="Due" format="date" aggregate="range" />
    </Table>
  );
}
