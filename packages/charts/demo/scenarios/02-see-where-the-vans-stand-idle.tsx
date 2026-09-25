import { Card, CardBody, CardHeader, Grid, Stack, Stat } from "@umriss-ui/core";
import { Bar, Chart, Legend, StateBand, Tooltip, XAxis, YAxis } from "../../src";
import { DEPOTS, NOW, VEHICLES, VEHICLE_STATES, vehicleDay, type StatePoint } from "@umriss-ui/demo/worlds/logistics";

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
            <Chart data={FLEET[0]!.points} height={320} ariaLabel="What each vehicle has done today, lane by lane">
              <XAxis accessor={(d: StatePoint) => d.t} time domain={DAY} />
              <YAxis
                accessor={() => 0}
                domain={[0, FLEET.length]}
                ticks={FLEET.map((_, i) => i + 0.5)}
                tickFormat={plateOnLane}
                grid={false}
              />
              {FLEET.map((one, i) => (
                <StateBand
                  key={one.vehicle.id}
                  data={one.points}
                  accessor={(d: StatePoint) => d.state}
                  states={VEHICLE_STATES}
                  laneFrom={lane(i) + 0.12}
                  laneTo={lane(i) + 0.88}
                  name={`${one.vehicle.plate} (${one.vehicle.type}, ${depotOf(one.vehicle.depot)})`}
                />
              ))}
              <Legend placement="top" />
              <Tooltip mode="x" />
            </Chart>
          </div>
        </CardBody>
      </Card>
      <Card data-callout="4">
        <CardHeader title="Idle minutes per vehicle" />
        <CardBody>
          <Chart data={FLEET} height={200} ariaLabel="Idle minutes per vehicle so far today">
            <XAxis
              accessor={(_d: (typeof FLEET)[number], i: number) => i}
              ticks={FLEET.map((_, i) => i)}
              tickFormat={(v) => FLEET[v]?.vehicle.plate ?? ""}
            />
            <YAxis accessor={(d: (typeof FLEET)[number]) => d.idle} label="min" tickCount={4} />
            <Bar accessor={(d: (typeof FLEET)[number]) => d.idle} name="Idle" color={VEHICLE_STATES[IDLE]!.color} barWidth={0.6} />
            <Tooltip mode="x" />
          </Chart>
        </CardBody>
      </Card>
    </Stack>
  );
}
