import { Button, Combobox, MultiSelect, Select, Stack } from "@umriss-ui/core";
import { ColumnMenu, Export, Pagination, Search, Toolbar, rowFilter, useTable } from "../../../src";

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

const TOUR_OPTIONS = [...new Set(SHIPMENTS.map((s) => s.tour))].map((tour) => ({ value: tour, label: tour }));
const CUSTOMER_OPTIONS = [...new Set(SHIPMENTS.map((s) => s.customer))]
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
            options={TOUR_OPTIONS}
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
            options={CUSTOMER_OPTIONS}
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
