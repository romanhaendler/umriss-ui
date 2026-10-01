import { useCallback, useEffect, useState } from "react";
import { Button, MultiSelect } from "@umriss-ui/core";
import { SHIPMENTS } from "@umriss-ui/demo/worlds/logistics";
import type { Shipment } from "@umriss-ui/demo/worlds/logistics";
import { Pagination, Toolbar, rowFilter, useTable } from "../../../src";

export const title = "Rows from a request";
export const lead = "Hand the table the rows a query answers, as they come - with a fallback that is the same array on every render and `loading` while nothing has arrived. The filters stay the table's.";

/* Stands in for any query hook: `data` stays the same array until an answer
   brings new rows, `isPending` holds until the first one. The first answer
   comes at once, so that the example stands still; "Reload" takes 800 ms. */
function useShipmentsQuery() {
  const [data, setData] = useState<readonly Shipment[] | undefined>(undefined);
  const [fetching, setFetching] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setData([...SHIPMENTS]), fetching === 0 ? 0 : 800);
    return () => clearTimeout(timer);
  }, [fetching]);
  const refetch = useCallback(() => {
    setData(undefined);
    setFetching((n) => n + 1);
  }, []);
  return { data, isPending: data === undefined, refetch };
}

type Status = Shipment["status"];

const STATUSES: { value: Status; label: string }[] = [
  { value: "out for delivery", label: "Out for delivery" },
  { value: "failed attempt", label: "Failed attempt" },
  { value: "delivered", label: "Delivered" },
];

const statuses = rowFilter({
  id: "statuses",
  label: "Status",
  matches: (shipment: Shipment, chosen: readonly Status[]) => chosen.includes(shipment.status),
});

/* Outside the component: `data ?? []` would be a new array on every render,
   and the table would calculate everything anew each time while it waits. */
const NO_SHIPMENTS: readonly Shipment[] = [];

export default function RowsFromARequest() {
  const { data, isPending, refetch } = useShipmentsQuery();

  /* The answer goes in as it is - not copied into a state of one's own, which
     would lag a render behind and could go stale. Rows derived from it (mapped,
     joined) belong in a `useMemo` over `data`. The condition survives a reload:
     the table holds it, not the rows. */
  const t = useTable(data ?? NO_SHIPMENTS, { rowKey: (s) => s.id, rowFilters: [statuses] });
  const { Table, Column } = t;

  return (
    <Table ariaLabel="Shipments from a request" loading={isPending}>
      <Toolbar>
        <MultiSelect<Status>
          aria-label="Status"
          placeholder="Every status"
          options={STATUSES}
          size="sm"
          style={{ width: 240 }}
          value={t.conditionOf(statuses) ?? []}
          onChange={(next) => t.setFilter(statuses, next.length > 0 ? next : null)}
        />
        <Button size="sm" variant="ghost" onClick={refetch}>
          Reload
        </Button>
      </Toolbar>
      <Column value="id" label="Shipment" rowHeader />
      <Column value="customer" label="Customer" />
      <Column value="status" label="Status" />
      <Pagination />
    </Table>
  );
}
