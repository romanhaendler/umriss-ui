import { Pagination, Search, Toolbar, useTable } from "../../../src";
import { SHIPMENTS } from "@umriss-ui/demo/worlds/logistics";

export const title = "Page through shipments";

export const lead = "Put a `Pagination` in the table and set `pageSize` on the hook; a search, a filter or a new sort goes back to page one.";

export default function PageThroughShipments() {
  const { Table, Column } = useTable(SHIPMENTS, { rowKey: (s) => s.id, pageSize: 10 });

  return (
    <Table ariaLabel="Today's shipments">
      <Toolbar>
        <Search placeholder="Search customer" />
      </Toolbar>
      <Column value="id" label="Shipment" rowHeader />
      <Column value="customer" label="Customer" />
      <Column value="status" label="Status" />
      <Column value="weight" label="Weight (kg)" />
      <Pagination pageSizes={[10, 25, 50]} />
    </Table>
  );
}
