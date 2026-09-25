import { SHIPMENTS } from "@umriss-ui/demo/worlds/logistics";
import { Search, Toolbar, useTable } from "../../../src";

export const title = "Search across the columns";
export const lead = "A `Search` in the `Toolbar` looks through every column that carries text; the toolbar counts the matches against the whole set.";

export default function SearchShipments() {
  const { Table, Column } = useTable(SHIPMENTS, { rowKey: (s) => s.id });

  return (
    <Table ariaLabel="Shipments" maxHeight="360px" stickyHeader>
      <Toolbar>
        <Search placeholder="Shipment, customer or tour" />
      </Toolbar>
      <Column value="id" label="Shipment" rowHeader />
      <Column value="customer" label="Customer" />
      <Column value="tour" label="Tour" />
      <Column value="status" label="Status" />
      <Column value="weight" label="Weight (kg)" />
    </Table>
  );
}
