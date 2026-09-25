import { useState } from "react";
import { SHIPMENTS } from "@umriss-ui/demo/worlds/logistics";
import { Pagination, useTable } from "../../../src";
import type { ManualView } from "../../../src";

export const title = "Hand the table one page";
export const lead = "`manual` takes the rows of one page and the server's `rowCount`; `onViewChange` reports the page the user asks for next.";

/* The server is a slice of an array here; in an application it is a request. */
const serve = (view: ManualView) => {
  const start = (view.page - 1) * view.pageSize;
  return { rows: SHIPMENTS.slice(start, start + view.pageSize), rowCount: SHIPMENTS.length };
};

export default function OnlyPages() {
  const [answer, setAnswer] = useState(() => serve({ search: "", conditions: {}, sort: [], page: 1, pageSize: 10 }));
  const { Table, Column } = useTable(answer.rows, {
    rowKey: (s) => s.id,
    manual: true,
    rowCount: answer.rowCount,
    onViewChange: (view) => setAnswer(serve(view)),
  });

  return (
    <Table ariaLabel="Shipments on the server">
      <Column value="id" label="Shipment" rowHeader sortable={false} />
      <Column value="customer" label="Customer" sortable={false} />
      <Column value="weight" label="Weight (kg)" sortable={false} />
      <Pagination />
    </Table>
  );
}
