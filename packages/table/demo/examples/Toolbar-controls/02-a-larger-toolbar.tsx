import { MultiSelect } from "@umriss-ui/core";
import { SHIPMENTS } from "@umriss-ui/demo/worlds/logistics";
import type { Shipment } from "@umriss-ui/demo/worlds/logistics";
import { ColumnMenu, Export, Pagination, Search, Toolbar, rowFilter, useTable } from "../../../src";

export const title = "A larger toolbar";
export const lead = "`size=\"md\"` on the toolbar, and search, column menu, export, “Reset” and the multiselect of one's own follow. One size for the whole bar, said once.";

const tours = rowFilter({
  id: "tours",
  label: "Tours",
  matches: (shipment: Shipment, chosen: readonly string[]) => chosen.includes(shipment.tour),
});

const TOURS = [...new Set(SHIPMENTS.map((s) => s.tour))].map((tour) => ({ value: tour, label: tour }));

export default function ALargerToolbar() {
  const t = useTable(SHIPMENTS, { rowKey: (s) => s.id, rowFilters: [tours] });
  const { Table, Column } = t;

  return (
    <Table ariaLabel="Shipments">
      <Toolbar size="md">
        <Search placeholder="Shipment or customer" />
        <MultiSelect
          aria-label="Tours"
          placeholder="All tours"
          options={TOURS}
          value={t.conditionOf(tours) ?? []}
          onChange={(next) => t.setFilter(tours, next.length > 0 ? next : null)}
        />
        <ColumnMenu />
        <Export />
      </Toolbar>
      <Column value="id" label="Shipment" rowHeader />
      <Column value="customer" label="Customer" />
      <Column value="tour" label="Tour" />
      <Column value="weight" label="Weight (kg)" />
      <Pagination />
    </Table>
  );
}
