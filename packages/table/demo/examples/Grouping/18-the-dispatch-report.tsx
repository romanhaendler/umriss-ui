import type { LimitSet } from "@umriss-ui/core";
import { ColumnMenu, Export, Search, Toolbar, useTable } from "../../../src";

/* Data from the logistics world, written out here so the example runs on its own. */
/** A small LCG - the same numbers on every computer. */
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const MINUTE = 60_000;

/** Tuesday, 17 March 2026, 10:30 - the moment the screens are read at. */
const NOW = at(10, 30);

const DEPOTS = [
  { id: "north", name: "North depot" },
  { id: "river", name: "Riverside depot" },
  { id: "east", name: "East Gate depot" },
] as const;

interface Vehicle {
  id: string;
  plate: string;
  type: "van" | "e-van" | "truck";
  /** Payload, in kg. */
  capacity: number;
  depot: string;
}

const VEHICLES: readonly Vehicle[] = [
  { id: "v1", plate: "FP 214 K", type: "van", capacity: 1200, depot: "north" },
  { id: "v2", plate: "FP 377 K", type: "e-van", capacity: 900, depot: "north" },
  { id: "v3", plate: "FP 118 R", type: "truck", capacity: 7500, depot: "north" },
  { id: "v4", plate: "FP 402 R", type: "van", capacity: 1200, depot: "river" },
  { id: "v5", plate: "FP 455 R", type: "e-van", capacity: 900, depot: "river" },
  { id: "v6", plate: "FP 290 E", type: "van", capacity: 1200, depot: "east" },
  { id: "v7", plate: "FP 311 E", type: "e-van", capacity: 900, depot: "east" },
  { id: "v8", plate: "FP 520 E", type: "truck", capacity: 7500, depot: "east" },
];

const DRIVERS = [
  { id: "d1", name: "Martin Hale", depot: "north" },
  { id: "d2", name: "Nadia Petrova", depot: "north" },
  { id: "d3", name: "Owen Carter", depot: "north" },
  { id: "d4", name: "Lucia Romero", depot: "river" },
  { id: "d5", name: "Ben Adeyemi", depot: "river" },
  { id: "d6", name: "Hanna Berg", depot: "east" },
  { id: "d7", name: "Yusuf Demir", depot: "east" },
  { id: "d8", name: "Clara Wendt", depot: "east" },
] as const;

const CUSTOMERS = [
  "Holloway Garden Supplies",
  "Marlow & Finch Books",
  "Oakridge Pharmacy",
  "Brixley Cycles",
  "Tamsin's Bakery",
  "Northfold Office",
  "Pellham Hardware",
  "Greywick Studio",
  "Juniper Lane Florist",
  "Ashcombe Dental",
] as const;

interface Stop {
  id: string;
  shipment: string;
  customer: string;
  /** The window the customer was promised, `[from, to]`. */
  window: readonly [number, number];
  /** When the tour plans to be there. */
  arrival: number;
}

interface Tour {
  id: string;
  vehicle: string;
  driver: string;
  depot: string;
  /** Leaves the depot, loaded; back at the depot. */
  from: number;
  to: number;
  /** Minutes of loading before `from`. */
  loading: number;
  km: number;
  stops: readonly Stop[];
}

/** One tour per vehicle. Stops every half hour or so, each with a two-hour
    window; every seventh arrival misses its window - the late ones a
    dispatcher looks for. */
function tour(index: number): Tour {
  const r = random(700 + index);
  const vehicle = VEHICLES[index]!;
  const truck = vehicle.type === "truck";
  const from = at(truck ? 6 : 7, index % 2 === 0 ? 0 : 30);
  const count = truck ? 5 : 8 + Math.floor(r() * 4);
  const stops: Stop[] = [];
  let arrival = from + (20 + Math.floor(r() * 15)) * MINUTE;
  for (let i = 0; i < count; i++) {
    const n = index * 20 + i;
    const slot = Math.floor((arrival - at(0)) / (2 * 60 * MINUTE)) * 2;
    /* A late stop's window closed half an hour or more before the arrival. */
    const late = i >= 2 && n % 7 === 3;
    const halfHour = 30 * MINUTE;
    const windowFrom = late ? Math.floor(arrival / halfHour) * halfHour - 5 * halfHour : at(slot);
    stops.push({
      id: `s-${index + 1}-${i + 1}`,
      shipment: `FP-${(1_004_210 + n * 13).toString()}`,
      customer: CUSTOMERS[(n * 3) % CUSTOMERS.length]!,
      window: [windowFrom, windowFrom + 2 * 60 * MINUTE],
      arrival,
    });
    arrival += (truck ? 45 : 22) * MINUTE + Math.floor(r() * 18) * MINUTE;
  }
  return {
    id: `T-${String(index + 1).padStart(2, "0")}`,
    vehicle: vehicle.id,
    driver: DRIVERS[index]!.id,
    depot: vehicle.depot,
    from,
    to: arrival + 30 * MINUTE,
    loading: truck ? 45 : 30,
    km: Math.round((truck ? 140 : 70) + r() * 40),
    stops,
  };
}

const TOURS: readonly Tour[] = VEHICLES.map((_, index) => tour(index));

interface Shipment {
  id: string;
  customer: string;
  /** In kg. */
  weight: number;
  status: "delivered" | "out for delivery" | "failed attempt";
  window: readonly [number, number];
  tour: string;
}

/** One shipment per stop. Before now, delivered - or a failed attempt, where
    nobody was in; after now, out for delivery. */
const SHIPMENTS: readonly Shipment[] = TOURS.flatMap((one) =>
  one.stops.map((stop) => {
    const n = Number(stop.shipment.slice(3));
    return {
      id: stop.shipment,
      customer: stop.customer,
      weight: Math.round((VEHICLES.find((v) => v.id === one.vehicle)!.type === "truck" ? 180 : 2) + ((n * 7919) % 230) / 10),
      status: stop.arrival > NOW ? "out for delivery" : n % 11 === 0 ? "failed attempt" : "delivered",
      window: stop.window,
      tour: one.id,
    } satisfies Shipment;
  }),
);

export const title = "Read a day's deliveries by depot";
export const lead = "Everything at once: depot and part of the day, weights with their share, an on-time rate of its own, the worst delay, and a bulk action.";

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

type StopRow = (typeof STOPS)[number];

const DELAY: LimitSet = {
  limits: [
    { value: 1, side: "upper", severity: "warning" },
    { value: 45, side: "upper", severity: "alarm" },
  ],
};

const partOf = (d: Date) => (d.getHours() < 12 ? "Morning" : "Afternoon");

/* Stops on time over all stops of the group - a rate is the application's to
   compute, never an average of rates. */
const onTime = (_values: readonly number[], stops: readonly StopRow[]) => stops.filter((s) => s.delay === 0).length / stops.length;

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
