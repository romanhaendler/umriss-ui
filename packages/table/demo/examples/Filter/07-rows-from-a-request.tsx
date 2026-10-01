import { useCallback, useEffect, useState } from "react";
import { Button, MultiSelect } from "@umriss-ui/core";
import { Pagination, Toolbar, rowFilter, useTable } from "../../../src";

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

export const title = "Rows from a request";
export const lead = "Hand the table the rows a query answers, as they come - with a fallback that is the same array on every render and `loading` while nothing has arrived. The filters stay the table's.";

/* Stands in for any query hook: `data` stays the same array until an answer
   brings new rows, `isPending` holds until the first one. The first answer
   comes at once, so that the example stands still; "Reload" takes 800 ms. */
function useShipmentsQuery() {
  const [data, setData] = useState<readonly Shipment[] | undefined>(undefined);
  const [fetching, setFetching] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setData([...SHIPMENTS]), fetching === 0 ? 0 : 800);
    return () => clearTimeout(timer);
  }, [fetching]);
  const refetch = useCallback(() => {
    setData(undefined);
    setFetching((n) => n + 1);
  }, []);
  return { data, isPending: data === undefined, refetch };
}

type Status = Shipment["status"];

const STATUSES: { value: Status; label: string }[] = [
  { value: "out for delivery", label: "Out for delivery" },
  { value: "failed attempt", label: "Failed attempt" },
  { value: "delivered", label: "Delivered" },
];

const statuses = rowFilter({
  id: "statuses",
  label: "Status",
  matches: (shipment: Shipment, chosen: readonly Status[]) => chosen.includes(shipment.status),
});

/* Outside the component: `data ?? []` would be a new array on every render,
   and the table would calculate everything anew each time while it waits. */
const NO_SHIPMENTS: readonly Shipment[] = [];

export default function RowsFromARequest() {
  const { data, isPending, refetch } = useShipmentsQuery();

  /* The answer goes in as it is - not copied into a state of one's own, which
     would lag a render behind and could go stale. Rows derived from it (mapped,
     joined) belong in a `useMemo` over `data`. The condition survives a reload:
     the table holds it, not the rows. */
  const t = useTable(data ?? NO_SHIPMENTS, { rowKey: (s) => s.id, rowFilters: [statuses] });
  const { Table, Column } = t;

  return (
    <Table ariaLabel="Shipments from a request" loading={isPending}>
      <Toolbar>
        <MultiSelect<Status>
          aria-label="Status"
          placeholder="Every status"
          options={STATUSES}
          size="sm"
          style={{ width: 240 }}
          value={t.conditionOf(statuses) ?? []}
          onChange={(next) => t.setFilter(statuses, next.length > 0 ? next : null)}
        />
        <Button size="sm" variant="ghost" onClick={refetch}>
          Reload
        </Button>
      </Toolbar>
      <Column value="id" label="Shipment" rowHeader />
      <Column value="customer" label="Customer" />
      <Column value="status" label="Status" />
      <Pagination />
    </Table>
  );
}
