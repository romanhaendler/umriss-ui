import { useState } from "react";
import { Badge, Button, Stack, Text } from "@umriss-ui/core";
import { Dependencies, Lane, LaneGroup, Schedule, Subtasks, applyIntent, ripple, shiftTask } from "../../src";
import type { Dependency, Intent, Subtask, Task } from "../../src";
import { DEPOTS, DRIVERS, TOURS, VEHICLES } from "@umriss-ui/demo/worlds/logistics";

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

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
/* Today's tours in the world, laid on tomorrow. */
const DWELL = 10 * MINUTE;
const QUARTER = 15 * MINUTE;

const at = (hours: number, minutes = 0) => new Date(2026, 2, 18, hours, minutes).getTime();

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

const plateOf = (vehicle: string) => VEHICLES.find((one) => one.id === vehicle)?.plate ?? vehicle;
const driverOf = (driver: string) => DRIVERS.find((one) => one.id === driver)?.name ?? driver;

export default function TourPlan() {
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
          initialDomain={[at(5, 30), at(15)]}
          height={470}
          intents={["move"]}
          onIntent={apply}
          label={(bar) => bar.name ?? ""}
        >
          {DEPOTS.map((depot) => (
            <LaneGroup key={depot.id} id={depot.id} label={depot.name}>
              {VEHICLES.filter((one) => one.depot === depot.id).map((vehicle) => (
                <Lane key={vehicle.id} id={vehicle.id} label={`${vehicle.plate} · ${vehicle.type}`} />
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
