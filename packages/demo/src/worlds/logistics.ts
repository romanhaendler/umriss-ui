/**
 * The logistics world: Ferrow Parcel, a regional parcel carrier with three
 * depots.
 *
 * The standing cast:
 * - `DEPOTS`, `VEHICLES` (plate, type, payload, depot) and `DRIVERS`;
 * - `TOURS` - today's eight delivery tours, each with its vehicle, driver,
 *   start, end, distance and stops; a stop has a delivery window and the
 *   planned arrival, and a few arrive outside their window;
 * - `SHIPMENTS` - one per stop, with customer, weight, status and window;
 * - `VEHICLE_STATES` and `vehicleDay(vehicle)` - what a vehicle did through
 *   the day, quarter hour by quarter hour, for a state band;
 * - `COST_RATES` - what a kilometre, an hour and a vehicle day cost, the
 *   inputs of a cost per tour.
 *
 * "Now" is Tuesday, 17 March 2026, 10:30 local time. Plain data and small pure
 * functions, no imports: copy the file beside an example and it runs.
 */

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
export const NOW = at(10, 30);

export const DEPOTS = [
  { id: "north", name: "North depot" },
  { id: "river", name: "Riverside depot" },
  { id: "east", name: "East Gate depot" },
] as const;

export interface Vehicle {
  id: string;
  plate: string;
  type: "van" | "e-van" | "truck";
  /** Payload, in kg. */
  capacity: number;
  depot: string;
}

export const VEHICLES: readonly Vehicle[] = [
  { id: "v1", plate: "FP 214 K", type: "van", capacity: 1200, depot: "north" },
  { id: "v2", plate: "FP 377 K", type: "e-van", capacity: 900, depot: "north" },
  { id: "v3", plate: "FP 118 R", type: "truck", capacity: 7500, depot: "north" },
  { id: "v4", plate: "FP 402 R", type: "van", capacity: 1200, depot: "river" },
  { id: "v5", plate: "FP 455 R", type: "e-van", capacity: 900, depot: "river" },
  { id: "v6", plate: "FP 290 E", type: "van", capacity: 1200, depot: "east" },
  { id: "v7", plate: "FP 311 E", type: "e-van", capacity: 900, depot: "east" },
  { id: "v8", plate: "FP 520 E", type: "truck", capacity: 7500, depot: "east" },
];

export const DRIVERS = [
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

export interface Stop {
  id: string;
  shipment: string;
  customer: string;
  /** The window the customer was promised, `[from, to]`. */
  window: readonly [number, number];
  /** When the tour plans to be there. */
  arrival: number;
}

export interface Tour {
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

export const TOURS: readonly Tour[] = VEHICLES.map((_, index) => tour(index));

export interface Shipment {
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
export const SHIPMENTS: readonly Shipment[] = TOURS.flatMap((one) =>
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

/** The closed set of vehicle states. The order is the code. */
export const VEHICLE_STATES = [
  { label: "Driving", color: "#2f6fb4" },
  { label: "Loading", color: "#c08a2e" },
  { label: "Idle", color: "#8a8f98" },
  { label: "Break", color: "#6b8e5a" },
] as const;

export interface StatePoint {
  t: number;
  /** A code in `VEHICLE_STATES`; `null` before the tour and after it. */
  state: number | null;
}

/** What a vehicle did from 05:00 to 19:00, quarter hour by quarter hour:
    loading before its tour, driving between stops, idle at them now and then,
    and a break around noon. */
export function vehicleDay(vehicleId: string): StatePoint[] {
  const one = TOURS.find((t) => t.vehicle === vehicleId);
  if (one === undefined) throw new Error(`No vehicle "${vehicleId}".`);
  const r = random(900 + TOURS.indexOf(one));
  const points: StatePoint[] = [];
  for (let t = at(5); t <= at(19); t += 15 * MINUTE) {
    let state: number | null = null;
    if (t >= one.from - one.loading * MINUTE && t < one.from) state = 1;
    else if (t >= one.from && t < one.to) state = t >= at(12) && t < at(12, 30) ? 3 : r() < 0.18 ? 2 : 0;
    points.push({ t, state });
  }
  return points;
}

/** What a tour costs, per unit - the inputs of a cost per tour. */
export const COST_RATES = {
  /** Diesel, per litre; electricity, per kWh. */
  dieselPerLitre: 1.68,
  electricityPerKwh: 0.31,
  /** Consumption per 100 km. */
  per100Km: { van: 9.5, truck: 24, "e-van": 22 },
  /** A driver's hour, all in. */
  driverPerHour: 34.5,
  /** Lease, insurance and upkeep, per day. */
  vehiclePerDay: { van: 58, truck: 145, "e-van": 72 },
} as const;

/* ---------------------------------------------------------------------------
   For @umriss-ui/charts: an e-van's battery, the North depot's week and
   fortnight, the delays by cause and the parcels per depot and hour.
   --------------------------------------------------------------------------- */

const on = (month: number, day: number, hours = 0) => new Date(2026, month - 1, day, hours).getTime();
const HOUR = 60 * MINUTE;

export interface BatteryPoint {
  t: number;
  /** State of charge, in per cent; `null` before the tour and after it. */
  charge: number | null;
}

/** An e-van's battery through the day, with `vehicleDay`'s quarter hours:
    full when the tour leaves, draining while it drives, a little while it
    idles, and topped up at the depot's charger over the noon break. */
export function batteryDay(vehicleId: string): BatteryPoint[] {
  let charge = 100;
  return vehicleDay(vehicleId).map(({ t, state }) => {
    if (state === null) return { t, charge: null };
    const now = charge;
    charge = Math.max(0, Math.min(100, charge + [-4.8, 0, -0.6, 3][state]!));
    return { t, charge: Math.round(now * 10) / 10 };
  });
}

/** The North depot's sorting hours: Monday to Friday, 06:00 to 22:00. */
export const SORTING_HOURS = Array.from({ length: 5 }, (_, day) => ({ from: on(3, 9 + day, 6), to: on(3, 9 + day, 22) }));

export interface SortedPoint {
  t: number;
  /** Parcels sorted per hour. */
  parcels: number;
}

/** Last week's sorting at the North depot, quarter hour by quarter hour -
    only in its sorting hours. */
export const SORTED: readonly SortedPoint[] = (() => {
  const r = random(1963);
  const points: SortedPoint[] = [];
  let parcels = 420;
  for (const { from } of SORTING_HOURS) {
    for (let quarter = 0; quarter < 4 * 16; quarter++) {
      parcels += (r() - 0.5) * 26;
      points.push({ t: from + quarter * 15 * MINUTE, parcels: Math.round(parcels) });
    }
  }
  return points;
})();

export interface DepotDay {
  /** Day of March. */
  day: number;
  /** Pallets that arrived, and that left on the tours. */
  arrived: number;
  dispatched: number;
  /** Pallets on hand at the end of the day. */
  onHand: number;
  /** The range the stock is meant to stay in; `null` while it was reset
      after the stocktake. */
  targetLow: number | null;
  targetHigh: number | null;
  /** A pallet count by hand - it never quite agrees with the books. */
  counted: number;
}

/** The North depot's last fourteen days, 2 to 15 March. */
export const DEPOT_DAYS: readonly DepotDay[] = (() => {
  const r = random(2026);
  let onHand = 62;
  return Array.from({ length: 14 }, (_, i) => {
    const arrived = 30 + r() * 25;
    const dispatched = 22 + r() * 20;
    onHand += (arrived - dispatched) * 0.35;
    const reset = i >= 6 && i <= 8;
    return {
      day: i + 2,
      arrived: Math.round(arrived),
      dispatched: Math.round(dispatched),
      onHand: Math.round(onHand),
      targetLow: reset ? null : Math.round(onHand - 9 - r() * 3),
      targetHigh: reset ? null : Math.round(onHand + 9 + r() * 3),
      counted: Math.round(onHand + (r() - 0.5) * 26),
    };
  });
})();

export interface DayDelays {
  /** The position on the x axis: the working day's index. */
  day: number;
  name: string;
  /** Minutes late across all tours, by cause; `null` where it was not logged. */
  traffic: number;
  loading: number | null;
  access: number;
}

/** Two working weeks, 2 to 13 March. On the first Wednesday the loading log
    was not kept - a gap, not a zero - and on the second Thursday a closed
    bridge takes the day. */
export const DELAYS: readonly DayDelays[] = (() => {
  const r = random(1204);
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  return Array.from({ length: 10 }, (_, day) => ({
    day,
    name: `${names[day % 5]} ${2 + day + 2 * Math.floor(day / 5)}`,
    traffic: Math.round((day === 8 ? 150 : 40) + r() * 30),
    loading: day === 2 ? null : Math.round(10 + r() * 45),
    access: Math.round(5 + r() * 25),
  }));
})();

export interface DepotHour {
  t: number;
  /** Parcels loaded per hour at each depot. */
  north: number;
  river: number;
  east: number;
}

/** Monday 06:00 to Tuesday 06:00, hour by hour. East Gate closes at night and
    loads nothing - 0, not nothing. */
export const PARCELS_PER_HOUR: readonly DepotHour[] = (() => {
  const r = random(906);
  return Array.from({ length: 25 }, (_, i) => {
    const hour = (6 + i) % 24;
    const night = hour >= 22 || hour < 6;
    return {
      t: on(3, 16, 6) + i * HOUR,
      north: Math.round(120 + r() * 30),
      river: Math.round((night ? 60 : 90) + r() * 25),
      east: night ? 0 : Math.round(70 + r() * 30),
    };
  });
})();
