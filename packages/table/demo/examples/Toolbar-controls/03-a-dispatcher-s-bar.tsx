import { Button, Combobox, MultiSelect, Select, Stack } from "@umriss-ui/core";
import { SHIPMENTS } from "@umriss-ui/demo/worlds/logistics";
import type { Shipment } from "@umriss-ui/demo/worlds/logistics";
import { ColumnMenu, Export, Pagination, Search, Toolbar, rowFilter, useTable } from "../../../src";

export const title = "A dispatcher's bar";
export const lead = "Three controls of one's own and the table's parts in one `md` bar, a quick filter beside the table - and every condition counted, reset and kept in the view alike. Only the one set from outside describes itself as a chip: the others show in their control.";

type Status = Shipment["status"];

const tours = rowFilter({
  id: "tours",
  label: "Tours",
  matches: (shipment: Shipment, chosen: readonly string[]) => chosen.includes(shipment.tour),
});

const status = rowFilter({
  id: "status",
  label: "Status",
  matches: (shipment: Shipment, wanted: Status) => shipment.status === wanted,
});

const customer = rowFilter({
  id: "customer",
  label: "Customer",
  matches: (shipment: Shipment, name: string) => shipment.customer === name,
});

/* Set from a button beside the table, not from a control in the bar - so it
   says itself in the toolbar, where its cross lifts it. */
const heavy = rowFilter({
  id: "heavy",
  label: "Weight",
  matches: (shipment: Shipment, atLeast: number) => shipment.weight >= atLeast,
  describe: (atLeast) => `from ${atLeast} kg`,
});

const TOURS = [...new Set(SHIPMENTS.map((s) => s.tour))].map((tour) => ({ value: tour, label: tour }));
const CUSTOMERS = [...new Set(SHIPMENTS.map((s) => s.customer))]
  .sort()
  .map((name) => ({ value: name, label: name }));

export default function ADispatchersBar() {
  const t = useTable(SHIPMENTS, {
    rowKey: (s) => s.id,
    rowFilters: [tours, status, customer, heavy],
    initialView: { conditions: { heavy: 20 } },
  });
  const { Table, Column } = t;

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2}>
        <Button size="sm" onClick={() => t.setFilter(heavy, 20)}>
          Heavy parcels
        </Button>
      </Stack>

      <Table ariaLabel="Shipments of the day">
        <Toolbar size="md">
          <Search placeholder="Shipment" />
          <MultiSelect
            aria-label="Tours"
            placeholder="All tours"
            options={TOURS}
            value={t.conditionOf(tours) ?? []}
            onChange={(next) => t.setFilter(tours, next.length > 0 ? next : null)}
          />
          <Select
            aria-label="Status"
            value={t.conditionOf(status) ?? ""}
            onChange={(event) => t.setFilter(status, event.target.value === "" ? null : (event.target.value as Status))}
          >
            <option value="">Every status</option>
            <option value="out for delivery">Out for delivery</option>
            <option value="failed attempt">Failed attempt</option>
            <option value="delivered">Delivered</option>
          </Select>
          <Combobox
            aria-label="Customer"
            placeholder="Any customer"
            options={CUSTOMERS}
            value={t.conditionOf(customer)}
            onChange={(name) => t.setFilter(customer, name)}
          />
          <ColumnMenu />
          <Export />
        </Toolbar>
        <Column value="id" label="Shipment" rowHeader />
        <Column value="customer" label="Customer" />
        <Column value="tour" label="Tour" />
        <Column value="status" label="Status" />
        <Column value="weight" label="Weight (kg)" />
        <Pagination />
      </Table>
    </Stack>
  );
}
