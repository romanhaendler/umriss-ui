import { useState } from "react";
import { Badge, Button, Stack, Text } from "@umriss-ui/core";
import { applyIntent, ripple, shiftTask, useSchedule } from "../../src";
import type { Dependency, Intent, Subtask, Task } from "../../src";

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

export const title = "Plan tomorrow's tours";

export const lead =
  "A dispatcher lays out tomorrow's delivery tours van by van and moves them until every stop arrives inside the window its customer was promised.";

export const callouts = [
  "One lane per vehicle, grouped by the depot it leaves from.",
  "Each tour is one task: loading, then its stops, joined by the drive between them.",
  "The tours with a stop that arrives after its window closed, the latest first, with the customers it concerns.",
  "Starting a tour earlier moves every stop of it at once - one intent per stop.",
];

export const builtFrom = [
  "schedule",
  "lane-groups",
  "dependencies",
  "ripple",
  { name: "Badge", page: "@umriss-ui/core#badge" },
  { name: "Button", page: "@umriss-ui/core#button" },
];

const DAY = 24 * 60 * MINUTE;
/* Today's tours in the world, laid on tomorrow. */
const DWELL = 10 * MINUTE;
const QUARTER = 15 * MINUTE;

const tomorrow = (hours: number, minutes = 0) => new Date(2026, 2, 18, hours, minutes).getTime();

const COLORS = [
  "light-dark(#2563eb, #6b9bff)",
  "light-dark(#0d9488, #3cc7b8)",
  "light-dark(#7c3aed, #a98bfa)",
  "light-dark(#c2410c, #f08a52)",
];

const TASKS: readonly Task[] = TOURS.map((tour, i) => ({
  id: tour.id,
  name: `Tour ${tour.id}`,
  color: COLORS[i % COLORS.length]!,
}));

/* A loading bar before the tour leaves, then one bar per stop. */
const START: readonly Subtask[] = TOURS.flatMap((tour) => [
  {
    id: `${tour.id}-load`,
    task: tour.id,
    lane: tour.vehicle,
    from: tour.from + DAY - tour.loading * MINUTE,
    to: tour.from + DAY,
    name: "Loading",
    appearance: ["muted"] as const,
  },
  ...tour.stops.map((stop) => ({
    id: stop.id,
    task: tour.id,
    lane: tour.vehicle,
    from: stop.arrival + DAY,
    to: stop.arrival + DAY + DWELL,
    name: stop.customer,
  })),
]);

/* The drive from one stop to the next is a dependency whose lag is the driving time. */
const DRIVES: readonly Dependency[] = TOURS.flatMap((tour) => {
  const bars = START.filter((one) => one.task === tour.id);
  return bars.slice(1).map((next, i) => ({
    id: `${next.id}-drive`,
    from: bars[i]!.id,
    to: next.id,
    lag: next.from - bars[i]!.to,
  }));
});

const WINDOW_CLOSES = new Map(
  TOURS.flatMap((tour) => tour.stops.map((stop) => [stop.id, stop.window[1] + DAY] as const)),
);

/* A plate is one word, and so is its tie to the type: a lane header that
   takes two lines must not tear "FP 377" from its "K". */
const plate = (text: string) => text.replaceAll(" ", "\u00a0");
const plateOf = (vehicle: string) => VEHICLES.find((one) => one.id === vehicle)?.plate ?? vehicle;
const driverOf = (driver: string) => DRIVERS.find((one) => one.id === driver)?.name ?? driver;

export default function TourPlan() {
  const { Schedule, Lane, LaneGroup, Subtasks, Dependencies } = useSchedule({ initialView: { domain: [tomorrow(5, 30), tomorrow(15)] } });
  const [plan, setPlan] = useState<readonly Subtask[]>(START);

  const apply = (intent: Intent) =>
    setPlan((current) =>
      [intent, ...ripple(current, DRIVES, intent)].reduce(
        (data, change) => data.map((bar) => applyIntent(bar, change)),
        current,
      ),
    );

  /* Per tour, its stops that arrive after their window closed, the latest first. */
  const late = TOURS.map((tour) => ({
    tour,
    stops: plan
      .filter((bar) => bar.task === tour.id)
      .map((bar) => ({ bar, by: bar.from - (WINDOW_CLOSES.get(bar.id) ?? Infinity) }))
      .filter((one) => one.by > 0)
      .sort((a, b) => b.by - a.by),
  }))
    .filter((one) => one.stops.length > 0)
    .sort((a, b) => b.stops[0]!.by - a.stops[0]!.by);

  return (
    <Stack gap={3}>
      <div data-callout="1">
        <Schedule
          ariaLabel="Tours of Wednesday, 18 March"
          height={470}
          intents={["move"]}
          onIntent={apply}
          label={(bar) => bar.name ?? ""}
        >
          {DEPOTS.map((depot) => (
            <LaneGroup key={depot.id} id={depot.id} label={depot.name}>
              {VEHICLES.filter((one) => one.depot === depot.id).map((vehicle) => (
                <Lane key={vehicle.id} id={vehicle.id} label={`${plate(vehicle.plate)}\u00a0· ${vehicle.type}`} />
              ))}
            </LaneGroup>
          ))}
          <Dependencies data={DRIVES} />
          <Subtasks data={plan} tasks={TASKS} />
        </Schedule>
      </div>
      <Text size="sm" tone="secondary" data-callout="2">
        Drag a stop later and the rest of its tour follows; the drive between two stops never gets shorter.
      </Text>
      <Stack gap={2} data-callout="3" data-late-stops>
        <Text size="sm" weight="semibold">
          {late.length === 0
            ? "Every stop arrives inside its window"
            : `${late.length} ${late.length === 1 ? "tour misses" : "tours miss"} a delivery window`}
        </Text>
        {late.map(({ tour, stops }, i) => (
          <Stack key={tour.id} direction="row" gap={2} align="center" wrap>
            <Badge tone="danger">{`${Math.round(stops[0]!.by / MINUTE)} min late`}</Badge>
            <Text size="sm">
              {`${tour.id} on ${plateOf(tour.vehicle)} (${driverOf(tour.driver)}): ${stops.map((one) => one.bar.name).join(", ")}`}
            </Text>
            <Button
              size="sm"
              onClick={() => shiftTask(plan, tour.id, -QUARTER).forEach(apply)}
              data-callout={i === 0 ? "4" : undefined}
            >
              {`Start ${tour.id} a quarter hour earlier`}
            </Button>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
