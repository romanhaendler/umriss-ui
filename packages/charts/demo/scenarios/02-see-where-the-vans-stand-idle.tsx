import { Card, CardBody, CardHeader, Grid, Stack, Stat } from "@umriss-ui/core";
import { Legend, Tooltip, useChart } from "../../src";

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

export const title = "See where the vans stand idle";

export const lead =
  "A fleet dispatcher checks mid-morning what every vehicle has done since loading, and which ones stand still more than they drive.";

export const callouts = [
  "The time lost standing idle across the fleet this morning, counted in quarter hours from the bands below.",
  "How many vehicles are driving right now: the state each band ends in at 10:30.",
  "One lane per vehicle, one colour per state, the states named once in the legend; the lanes stop at now, the afternoon is still to come. Hover any minute and the tooltip lists what each vehicle was doing then.",
  "The idle time per vehicle, summed from the same bands: the ones worth a call to the driver stand out.",
];

export const builtFrom = [
  "stateband",
  "bar",
  "axis",
  "tooltip",
  { name: "Stat", page: "@umriss-ui/core#stat" },
  { name: "Card", page: "@umriss-ui/core#card" },
];

const IDLE = VEHICLE_STATES.findIndex((one) => one.label === "Idle");
const DRIVING = VEHICLE_STATES.findIndex((one) => one.label === "Driving");
const DAY: readonly [number, number] = [new Date(NOW).setHours(5, 0, 0, 0), new Date(NOW).setHours(19, 0, 0, 0)];

/* The day so far: what happened before now, and a hole from now on - the band
   of the last quarter hour ends at 10:30 instead of running into the future. */
const FLEET = VEHICLES.map((vehicle) => {
  const points = vehicleDay(vehicle.id).filter((one) => one.t < NOW);
  const idle = points.filter((one) => one.state === IDLE).length * 15;
  return { vehicle, points: [...points, { t: NOW, state: null }], idle, driving: points.at(-1)?.state === DRIVING };
});

/* Lane 0 lies at the bottom, so the first vehicle takes the top lane. */
const lane = (index: number) => FLEET.length - 1 - index;
const plateOnLane = (v: number) => FLEET[FLEET.length - 1 - Math.floor(v)]?.vehicle.plate ?? "";
const depotOf = (id: string) => DEPOTS.find((one) => one.id === id)?.name ?? id;

const IDLE_TODAY = FLEET.reduce((sum, one) => sum + one.idle, 0) / 60;
const DRIVING_NOW = FLEET.filter((one) => one.driving).length;

function FleetLanes() {
  const { Chart, XAxis, YAxis, StateBand } = useChart(FLEET[0]!.points);
  return (
    <Chart height={320} ariaLabel="What each vehicle has done today, lane by lane">
      <XAxis value="t" time domain={DAY} />
      <YAxis
        value={() => 0}
        domain={[0, FLEET.length]}
        ticks={FLEET.map((_, i) => i + 0.5)}
        tickFormat={plateOnLane}
        grid={false}
      />
      {FLEET.map((one, i) => (
        <StateBand
          key={one.vehicle.id}
          data={one.points}
          value="state"
          states={VEHICLE_STATES}
          laneFrom={lane(i) + 0.12}
          laneTo={lane(i) + 0.88}
          name={`${one.vehicle.plate} (${one.vehicle.type}, ${depotOf(one.vehicle.depot)})`}
        />
      ))}
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}

function IdleMinutes() {
  const { Chart, XAxis, YAxis, Bar } = useChart(FLEET);
  return (
    <Chart height={200} ariaLabel="Idle minutes per vehicle so far today">
      <XAxis
        value={(_d, i) => i}
        ticks={FLEET.map((_, i) => i)}
        tickFormat={(v) => FLEET[v]?.vehicle.plate ?? ""}
      />
      <YAxis value="idle" label="min" tickCount={4} />
      <Bar value="idle" name="Idle" color={VEHICLE_STATES[IDLE]!.color} barWidth={0.6} />
      <Tooltip mode="x" />
    </Chart>
  );
}

export default function IdleVans() {
  return (
    <Stack gap={4}>
      <Grid minItemWidth="12rem" gap={3}>
        <Stat label="Idle so far today" value={IDLE_TODAY} unit="h" decimals={1} data-callout="1" />
        <Stat label="Driving now" value={DRIVING_NOW} unit={`of ${FLEET.length}`} decimals={0} data-callout="2" />
      </Grid>
      <Card data-callout="3">
        <CardHeader title="The fleet since 05:00" />
        <CardBody>
          <div>
            <FleetLanes />
          </div>
        </CardBody>
      </Card>
      <Card data-callout="4">
        <CardHeader title="Idle minutes per vehicle" />
        <CardBody>
          <IdleMinutes />
        </CardBody>
      </Card>
    </Stack>
  );
}
