import { MultiSelect, Select } from "@umriss-ui/core";
import { SHIPMENTS } from "@umriss-ui/demo/worlds/logistics";
import type { Shipment } from "@umriss-ui/demo/worlds/logistics";
import { Pagination, Search, Toolbar, rowFilter, useTable } from "../../../src";

export const title = "Controls of your own at the toolbar's size";
export const lead = "The toolbar is `sm` unless it says otherwise; a control from @umriss-ui/core stands level with the search at its own small size. Behind each control a row filter.";

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

const TOURS = [...new Set(SHIPMENTS.map((s) => s.tour))].map((tour) => ({ value: tour, label: tour }));

export default function ControlsAtTheToolbarsSize() {
  const t = useTable(SHIPMENTS, { rowKey: (s) => s.id, rowFilters: [tours, status] });
  const { Table, Column } = t;

  return (
    <Table ariaLabel="Shipments">
      <Toolbar>
        <Search placeholder="Shipment or customer" />
        <MultiSelect
          size="sm"
          aria-label="Tours"
          placeholder="All tours"
          options={TOURS}
          style={{ width: 200 }}
          value={t.conditionOf(tours) ?? []}
          onChange={(next) => t.setFilter(tours, next.length > 0 ? next : null)}
        />
        {/* `Select` is the native field: its size is `selectSize`, since `size` is the element's own. */}
        <Select
          selectSize="sm"
          aria-label="Status"
          value={t.conditionOf(status) ?? ""}
          onChange={(event) => t.setFilter(status, event.target.value === "" ? null : (event.target.value as Status))}
        >
          <option value="">Every status</option>
          <option value="out for delivery">Out for delivery</option>
          <option value="failed attempt">Failed attempt</option>
          <option value="delivered">Delivered</option>
        </Select>
      </Toolbar>
      <Column value="id" label="Shipment" rowHeader />
      <Column value="customer" label="Customer" />
      <Column value="tour" label="Tour" />
      <Column value="status" label="Status" />
      <Pagination />
    </Table>
  );
}
