import { useTable } from "../../../src";

export const title = "Show every row";

export const lead = "Without a `Pagination` the table does not page at all – here twelve rows stand despite `pageSize: 5` on the hook.";

interface Delivery {
  id: string;
  parcels: number;
}

const DELIVERIES: Delivery[] = Array.from({ length: 12 }, (_, i) => ({
  id: `FP-${1004300 + i * 13}`,
  parcels: 1 + ((i * 5) % 7),
}));

export default function ShowEveryRow() {
  const { Table, Column } = useTable(DELIVERIES, { rowKey: (d) => d.id, pageSize: 5 });

  return (
    <Table density="compact" ariaLabel="Deliveries without a paging bar">
      <Column value="id" label="Shipment" rowHeader />
      <Column value="parcels" label="Parcels" />
    </Table>
  );
}
