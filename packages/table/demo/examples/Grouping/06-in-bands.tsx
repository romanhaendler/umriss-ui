import { useTable } from "../../../src";

export const title = "In bands: groupValue";

/* A number grouped as it is would give every quantity its own group.
   `groupValue` - beside `sortValue` and `exportValue` - says what is grouped
   by instead: here a lot size band. The bands stand by what they hold, small
   before large, not by the alphabet of their names. The cells keep the
   quantity; sorting and the export do too. */

interface Lot {
  id: string;
  article: string;
  pieces: number;
}

const LOTS: Lot[] = [
  { id: "L-5510", article: "Housing 40", pieces: 1200 },
  { id: "L-5511", article: "Flange", pieces: 240 },
  { id: "L-5512", article: "Shaft 12", pieces: 4800 },
  { id: "L-5513", article: "Bushing", pieces: 90 },
  { id: "L-5514", article: "Cover plate", pieces: 760 },
  { id: "L-5515", article: "Bracket", pieces: 2100 },
  { id: "L-5516", article: "Housing 60", pieces: 380 },
];

const band = (pieces: number) => (pieces < 500 ? "Small (under 500)" : pieces < 2000 ? "Medium (500–1,999)" : "Large (2,000 and more)");

export default function InBands() {
  const { Table, Column } = useTable(LOTS, { rowKey: (l) => l.id, defaultGrouping: "size" });
  return (
    <Table ariaLabel="Lots by size">
      <Column id="size" value={(l) => l.pieces} label="Lot size" groupValue={band} format="count" />
      <Column value="id" label="Lot" rowHeader />
      <Column value="article" label="Article" />
      <Column value="pieces" label="Pieces" format="count" aggregate="sum" />
    </Table>
  );
}
