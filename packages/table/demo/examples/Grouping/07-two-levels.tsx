import { ColumnMenu, Toolbar, useTable } from "../../../src";

export const title = "Two levels: line › customer";

/* The prototype's case: 13 orders on three lines for eight customers, most of
   whom have one or two orders. The lines get a band with their sums and the
   share bar; the customers stand beside their orders. A band on every level
   would need 25 lines here, the mixture needs 16 (ADR-0029). */

interface Order {
  id: string;
  line: string;
  customer: string;
  article: string;
  quantity: number;
  scrap: number | null;
  due: Date;
}

const day = (d: number) => new Date(2026, 9, d);

const ORDERS: Order[] = [
  { id: "A-1041", line: "Line 1", customer: "Brenner GmbH", article: "Housing 40", quantity: 1200, scrap: 14, due: day(2) },
  { id: "A-1044", line: "Line 1", customer: "Brenner GmbH", article: "Housing 60", quantity: 800, scrap: 3, due: day(4) },
  { id: "A-1052", line: "Line 1", customer: "Kessler AG", article: "Cover plate", quantity: 2400, scrap: 31, due: day(3) },
  { id: "A-1058", line: "Line 1", customer: "Otto & Söhne", article: "Housing 40", quantity: 600, scrap: 0, due: day(9) },
  { id: "A-1060", line: "Line 1", customer: "Otto & Söhne", article: "Flange", quantity: 300, scrap: 2, due: day(11) },
  { id: "A-1061", line: "Line 1", customer: "Otto & Söhne", article: "Flange", quantity: 300, scrap: null, due: day(14) },
  { id: "A-1043", line: "Line 2", customer: "Brenner GmbH", article: "Shaft 12", quantity: 5000, scrap: 62, due: day(2) },
  { id: "A-1049", line: "Line 2", customer: "Hartmann KG", article: "Shaft 16", quantity: 3200, scrap: 18, due: day(6) },
  { id: "A-1055", line: "Line 2", customer: "Lindner Tech", article: "Shaft 12", quantity: 1500, scrap: 4, due: day(8) },
  { id: "A-1057", line: "Line 2", customer: "Lindner Tech", article: "Bushing", quantity: 900, scrap: 1, due: day(10) },
  { id: "A-1046", line: "Line 3", customer: "Kessler AG", article: "Bracket", quantity: 700, scrap: 9, due: day(5) },
  { id: "A-1050", line: "Line 3", customer: "Vogt Maschinen", article: "Bracket L", quantity: 450, scrap: 0, due: day(7) },
  { id: "A-1053", line: "Line 3", customer: "Weiss Antriebe", article: "Bracket", quantity: 1100, scrap: 27, due: day(8) },
];

export default function TwoLevels() {
  const { Table, Column } = useTable(ORDERS, { rowKey: (o) => o.id, defaultGrouping: ["line", "customer"] });

  return (
    <Table ariaLabel="Orders by line and customer">
      <Toolbar>
        <ColumnMenu />
      </Toolbar>
      <Column value="customer" label="Customer" />
      <Column value="id" label="Order" rowHeader />
      <Column value="line" label="Line" />
      <Column value="article" label="Article" />
      <Column value="quantity" label="Quantity" aggregate="sum" />
      <Column value="scrap" label="Scrap" aggregate="sum" />
      <Column value="due" label="Due" format="date" aggregate="range" />
    </Table>
  );
}
