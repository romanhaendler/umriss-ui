import { useState } from "react";
import { SHIPMENTS } from "@umriss-ui/demo/worlds/logistics";
import { Pagination, useTable } from "../../../src";
import type { ManualView } from "../../../src";

export const title = "Name the values a list filter offers";
export const lead = "The table holds one page and cannot count the values of the rest; `filterOptions` names them, and the chosen ones arrive in `view.conditions`.";

const STATUSES = ["delivered", "out for delivery", "failed attempt"] as const;

const serve = (view: ManualView) => {
  const chosen = view.conditions.status as readonly string[] | undefined;
  const hits = SHIPMENTS.filter((s) => !chosen || chosen.includes(s.status));
  const start = (view.page - 1) * view.pageSize;
  return { rows: hits.slice(start, start + view.pageSize), rowCount: hits.length };
};

export default function ListFilter() {
  const [answer, setAnswer] = useState(() => serve({ search: "", conditions: {}, sort: [], page: 1, pageSize: 10 }));
  const { Table, Column } = useTable(answer.rows, {
    rowKey: (s) => s.id,
    manual: true,
    rowCount: answer.rowCount,
    onViewChange: (view) => setAnswer(serve(view)),
    filterOptions: (column) => (column === "status" ? STATUSES : []),
  });

  return (
    <Table ariaLabel="Shipments on the server">
      <Column value="id" label="Shipment" rowHeader sortable={false} />
      <Column value="customer" label="Customer" sortable={false} />
      <Column value="status" label="Status" filter="list" sortable={false} />
      <Pagination />
    </Table>
  );
}
