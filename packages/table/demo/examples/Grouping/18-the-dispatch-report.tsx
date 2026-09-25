import type { LimitSet } from "@umriss-ui/core";
import { DEPOTS, SHIPMENTS, TOURS } from "@umriss-ui/demo/worlds/logistics";
import { ColumnMenu, Export, Search, Toolbar, useTable } from "../../../src";

export const title = "Read a day's deliveries by depot";
export const lead = "Everything at once: depot and part of the day, weights with their share, an on-time rate of its own, the worst delay, and a bulk action.";

const MINUTE = 60_000;

/* One row per stop: the shipment, its tour's depot, and how late the tour
   plans to arrive after the promised window closes. */
const STOPS = TOURS.flatMap((tour) =>
  tour.stops.map((stop) => ({
    id: stop.shipment,
    depot: DEPOTS.find((d) => d.id === tour.depot)!.name,
    tour: tour.id,
    window: new Date(stop.window[0]),
    customer: stop.customer,
    weight: SHIPMENTS.find((s) => s.id === stop.shipment)!.weight,
    delay: Math.max(0, Math.round((stop.arrival - stop.window[1]) / MINUTE)),
  })),
);

type Stop = (typeof STOPS)[number];

const DELAY: LimitSet = {
  limits: [
    { value: 1, side: "upper", severity: "warning" },
    { value: 45, side: "upper", severity: "alarm" },
  ],
};

const partOf = (d: Date) => (d.getHours() < 12 ? "Morning" : "Afternoon");

/* Stops on time over all stops of the group - a rate is the application's to
   compute, never an average of rates. */
const onTime = (_values: readonly number[], stops: readonly Stop[]) => stops.filter((s) => s.delay === 0).length / stops.length;

export default function DispatchReport() {
  const { Table, Column, VerdictColumn, GroupBy, RowActions, Action } = useTable(STOPS, {
    rowKey: (s) => s.id,
    defaultGrouping: ["depot", "part"],
  });
  return (
    <Table ariaLabel="Deliveries by depot" selectable stickyHeader maxHeight="560px">
      <Toolbar>
        <Search />
        <ColumnMenu />
        <Export filename="deliveries.csv" />
      </Toolbar>
      <GroupBy id="part" value={(s) => partOf(s.window)} label="Part of the day" />
      <Column value="id" label="Shipment" rowHeader />
      <Column value="depot" label="Depot" />
      <Column value="tour" label="Tour" aggregate="distinct" />
      <Column value="window" label="Window from" format="time" aggregate="range" />
      <Column value="customer" label="Customer" aggregate="distinct" />
      <Column value="weight" label="Weight (kg)" format={{ decimals: 1 }} aggregate="sum" />
      <Column id="onTime" value={(s) => Number(s.delay === 0)} label="On time" format="percent" aggregate={onTime} />
      <VerdictColumn value="delay" label="Delay (min)" limits={DELAY} aggregate="worst" />
      <RowActions>
        <Action bulk onSelect={(stops) => window.alert(`Rescheduled: ${stops.map((s) => s.id).join(", ")}`)}>
          Reschedule
        </Action>
      </RowActions>
    </Table>
  );
}
