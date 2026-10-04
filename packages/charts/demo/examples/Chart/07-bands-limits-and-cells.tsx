import { Legend, LimitBand, LimitLine, Tooltip, useChart } from "../../../src";

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

/** The closed set of vehicle states. The order is the code. */
const VEHICLE_STATES = [
  { label: "Driving", color: "#2f6fb4" },
  { label: "Loading", color: "#c08a2e" },
  { label: "Idle", color: "#8a8f98" },
  { label: "Break", color: "#6b8e5a" },
] as const;

interface StatePoint {
  t: number;
  /** A code in `VEHICLE_STATES`; `null` before the tour and after it. */
  state: number | null;
}

/** What a vehicle did from 05:00 to 19:00, quarter hour by quarter hour:
    loading before its tour, driving between stops, idle at them now and then,
    and a break around noon. */
function vehicleDay(vehicleId: string): StatePoint[] {
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

interface BatteryPoint {
  t: number;
  /** State of charge, in per cent; `null` before the tour and after it. */
  charge: number | null;
}

/** An e-van's battery through the day, with `vehicleDay`'s quarter hours:
    full when the tour leaves, draining while it drives, a little while it
    idles, and topped up at the depot's charger over the noon break. */
function batteryDay(vehicleId: string): BatteryPoint[] {
  let charge = 100;
  return vehicleDay(vehicleId).map(({ t, state }) => {
    if (state === null) return { t, charge: null };
    const now = charge;
    charge = Math.max(0, Math.min(100, charge + [-4.8, 0, -0.6, 3][state]!));
    return { t, charge: Math.round(now * 10) / 10 };
  });
}

/* Data from the operations world, written out here so the example runs on its own. */

interface Service {
  id: string;
  name: string;
  team: string;
  /** 1 is customer-facing and pages at night; 3 waits for the morning. */
  tier: 1 | 2 | 3;
  /** The latency objective: the 95th percentile stays below this, in ms. */
  latencySlo: number;
  /** The availability promised for a month, in per cent. */
  availabilityTarget: number;
}

const SERVICES: readonly Service[] = [
  { id: "checkout", name: "Checkout", team: "Payments", tier: 1, latencySlo: 300, availabilityTarget: 99.95 },
  { id: "billing", name: "Billing", team: "Payments", tier: 1, latencySlo: 400, availabilityTarget: 99.9 },
  { id: "sign-in", name: "Sign-in", team: "Identity", tier: 1, latencySlo: 200, availabilityTarget: 99.95 },
  { id: "search", name: "Search", team: "Discovery", tier: 1, latencySlo: 250, availabilityTarget: 99.9 },
  { id: "images", name: "Image service", team: "Discovery", tier: 2, latencySlo: 500, availabilityTarget: 99.5 },
  { id: "notifications", name: "Notifications", team: "Messaging", tier: 2, latencySlo: 800, availabilityTarget: 99.5 },
  { id: "webhooks", name: "Webhooks", team: "Integrations", tier: 2, latencySlo: 1000, availabilityTarget: 99.5 },
  { id: "reports", name: "Reporting", team: "Insights", tier: 3, latencySlo: 2000, availabilityTarget: 99 },
];

interface SuccessCell {
  hour: number;
  /** The row: the service's place in `SERVICES`. */
  service: number;
  /** Requests that succeeded, in per cent; `null` where there were none. */
  success: number | null;
}

/** Yesterday, per service and hour: the share of requests that succeeded.
    Webhooks has a bad late morning, 03:00 is bad everywhere (a DNS change),
    and Reporting takes no requests before 06:00 - no requests, no share. */
const SUCCESS_BY_HOUR: readonly SuccessCell[] = (() => {
  const r = random(23);
  const cells: SuccessCell[] = [];
  SERVICES.forEach((one, service) => {
    for (let hour = 0; hour < 24; hour++) {
      let success: number | null = 99.2 + r() * 0.8;
      if (one.id === "webhooks" && hour >= 9 && hour < 14) success = 96 + r() * 1.5;
      if (hour === 3) success = 97.4 + r() * 1;
      if (one.id === "reports" && hour < 6) success = null;
      cells.push({ hour, service, success: success === null ? null : Math.round(success * 100) / 100 });
    }
  });
  return cells;
})();

export const title = "Mark bands, limits and cells";
export const lead = "What is otherwise said in colour alone - a state, a limit band, a verdict per cell - gets a hatch by its place as well.";

const BATTERY = batteryDay("v2");
const STATES = vehicleDay("v2");

function BatteryAndStates() {
  const { Chart, XAxis, YAxis, Line, StateBand } = useChart(BATTERY);
  return (
    <Chart height={280} ariaLabel="An e-van's battery against its reserve, above its states" encoding="marks">
      <XAxis value="t" time label="Time" tickCount={4} />
      <YAxis domain={[-40, 100]} ticks={[0, 20, 40, 60, 80, 100]} label="%" />
      <YAxis id="lane" position="right" domain={[0, 5]} ticks={[0.45]} tickFormat={() => "FP 377 K"} />
      <LimitBand from={10} to={20} severity="warning" label="Reserve" />
      <LimitLine value={10} severity="alarm" label="Empty soon" />
      <StateBand data={STATES} value="state" states={VEHICLE_STATES} yAxisId="lane" laneFrom={0} laneTo={0.9} name="FP 377 K" />
      <Line value="charge" name="Charge" strokeWidth={1.75} />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}

function SuccessCells() {
  const { Chart, XAxis, YAxis, Matrix } = useChart(SUCCESS_BY_HOUR);
  return (
    <Chart height={280} ariaLabel="Successful requests per service and hour, by limits and by marks" encoding="marks">
      <XAxis value="hour" ticks={[0, 6, 12, 18]} tickFormat={(v) => `${v}:00`} label="Hour" />
      <YAxis ticks={SERVICES.map((_, i) => i)} tickFormat={(v) => SERVICES[v]?.name ?? ""} />
      <Matrix
        value="service"
        level="success"
        coloring={{
          kind: "assessment",
          limits: {
            limits: [
              { value: 99, side: "lower", severity: "warning" },
              { value: 98, side: "lower", severity: "alarm" },
            ],
          },
        }}
        name="Success rate"
      />
      <Legend placement="top" />
      <Tooltip mode="nearest" />
    </Chart>
  );
}

export default function BandsLimitsAndCells() {
  return (
    <div className="side-by-side">
      <BatteryAndStates />
      <SuccessCells />
    </div>
  );
}
