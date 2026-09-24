import { Button } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "The overview: everything folded";

/* Folded all the way, a grouped table is a summary of its groups - one line
   per line, its sums in the columns. Here the table starts that way, with
   Line 2 open: the folds are part of the view and come in with `initialView`,
   by the path of their group. `t.view` gives them back, for the application
   to keep wherever it keeps views. A path whose group no longer occurs falls
   out. Alt-click on a fold folds all its siblings. */

interface Order {
  id: string;
  line: string;
  customer: string;
  quantity: number;
  scrap: number;
}

const ORDERS: Order[] = [
  { id: "A-1041", line: "Line 1", customer: "Brenner GmbH", quantity: 1200, scrap: 14 },
  { id: "A-1044", line: "Line 1", customer: "Brenner GmbH", quantity: 800, scrap: 3 },
  { id: "A-1052", line: "Line 1", customer: "Kessler AG", quantity: 2400, scrap: 31 },
  { id: "A-1043", line: "Line 2", customer: "Brenner GmbH", quantity: 5000, scrap: 62 },
  { id: "A-1049", line: "Line 2", customer: "Hartmann KG", quantity: 3200, scrap: 18 },
  { id: "A-1055", line: "Line 2", customer: "Lindner Tech", quantity: 1500, scrap: 4 },
  { id: "A-1046", line: "Line 3", customer: "Kessler AG", quantity: 700, scrap: 9 },
  { id: "A-1053", line: "Line 3", customer: "Weiss Antriebe", quantity: 1100, scrap: 27 },
];

const path = (...values: string[]) => JSON.stringify(values.map((v) => `value:${v}`));

export default function Overview() {
  const t = useTable(ORDERS, {
    rowKey: (o) => o.id,
    defaultGrouping: ["line", "customer"],
    initialView: { folded: [path("Line 1"), path("Line 3")] },
  });
  const { Table, Column } = t;
  return (
    <>
      <Table ariaLabel="Orders, folded by line">
        <Column value="customer" label="Customer" />
        <Column value="id" label="Order" rowHeader />
        <Column value="line" label="Line" />
        <Column value="quantity" label="Quantity" aggregate="sum" />
        <Column value="scrap" label="Scrap" aggregate="sum" />
      </Table>
      <p>
        <Button size="sm" onClick={t.foldAll}>
          Fold all
        </Button>{" "}
        <Button size="sm" onClick={t.unfoldAll}>
          Unfold all
        </Button>
      </p>
      <p>
        <code>{JSON.stringify(t.view)}</code>
      </p>
    </>
  );
}
