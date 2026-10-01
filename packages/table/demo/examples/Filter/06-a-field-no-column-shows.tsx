import { MultiSelect } from "@umriss-ui/core";
import { SHIPMENTS } from "@umriss-ui/demo/worlds/logistics";
import type { Shipment } from "@umriss-ui/demo/worlds/logistics";
import { Pagination, Search, Toolbar, rowFilter, useTable } from "../../../src";

export const title = "Filter by a field no column shows";
export const lead = "A row filter asks the whole row; a control of one's own sets it with `t.setFilter` and reads it with `t.conditionOf`. The table holds the choice, counts it and resets it - no column needed.";

/* Defined once, outside the component. The object is the key from here on:
   the id is only its name in the view. */
const tours = rowFilter({
  id: "tours",
  label: "Tours",
  matches: (shipment: Shipment, chosen: readonly string[]) => chosen.includes(shipment.tour),
});

const TOURS = [...new Set(SHIPMENTS.map((s) => s.tour))].map((tour) => ({ value: tour, label: tour }));

export default function FieldNoColumnShows() {
  const t = useTable(SHIPMENTS, { rowKey: (s) => s.id, rowFilters: [tours] });
  const { Table, Column } = t;

  return (
    <Table ariaLabel="Shipments by tour">
      <Toolbar>
        <Search placeholder="Shipment or customer" />
        <MultiSelect
          aria-label="Tours"
          placeholder="All tours"
          options={TOURS}
          style={{ width: 240 }}
          /* Typed as the filter's condition - no cast. */
          value={t.conditionOf(tours) ?? []}
          /* The whole new choice, every time; an empty one lifts the condition. */
          onChange={(next) => t.setFilter(tours, next.length > 0 ? next : null)}
        />
      </Toolbar>
      <Column value="id" label="Shipment" rowHeader />
      <Column value="customer" label="Customer" />
      <Column value="weight" label="Weight (kg)" />
      <Pagination />
    </Table>
  );
}
