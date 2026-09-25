import { useRef, useState } from "react";
import { SHIPMENTS } from "@umriss-ui/demo/worlds/logistics";
import { Pagination, useTable } from "../../../src";
import type { ManualView } from "../../../src";

export const title = "Show loading, and drop a late answer";
export const lead = "`loading` marks the table while a request runs. An answer to a view the user has already left is the application's to drop; the table shows whatever rows it is given.";

/* Every answer takes 600 ms. Page on quickly: only the last request lands. */
const LATENCY = 600;

const serve = (view: ManualView) => {
  const start = (view.page - 1) * view.pageSize;
  return { rows: SHIPMENTS.slice(start, start + view.pageSize), rowCount: SHIPMENTS.length };
};

export default function LoadingAndLateAnswers() {
  const [answer, setAnswer] = useState(() => serve({ search: "", conditions: {}, sort: [], page: 1, pageSize: 10 }));
  const [loading, setLoading] = useState(false);
  const latest = useRef<ManualView | null>(null);

  const { Table, Column } = useTable(answer.rows, {
    rowKey: (s) => s.id,
    manual: true,
    rowCount: answer.rowCount,
    onViewChange: (view) => {
      latest.current = view;
      setLoading(true);
      setTimeout(() => {
        if (latest.current !== view) return;
        setAnswer(serve(view));
        setLoading(false);
      }, LATENCY);
    },
  });

  return (
    <Table ariaLabel="Shipments on the server" loading={loading}>
      <Column value="id" label="Shipment" rowHeader sortable={false} />
      <Column value="customer" label="Customer" sortable={false} />
      <Column value="weight" label="Weight (kg)" sortable={false} />
      <Pagination />
    </Table>
  );
}
