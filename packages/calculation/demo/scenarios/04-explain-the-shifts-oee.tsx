import { Alert, Card, CardBody, CardHeader, Grid, Stack, Stat, Text } from "@umriss-ui/core";
import { Calculation, Difference, Given, Product, Quotient, Ref } from "../../src";
import { IDEAL_CYCLE_MINUTES, KILN, countAt, plant } from "@umriss-ui/demo/worlds/plant";

export const title = "Explain the shift's OEE";

export const lead =
  "A shift lead at Brenholt Tile Works explains at the 10:30 handover why the kiln line's OEE stands where it stands.";

export const callouts = [
  "The tiles give the three counts the OEE is made of, as the line reports them.",
  "The stop that cost availability, taken from the same readings - so the downtime in the calculation has a cause.",
  "The OEE worked out as availability × performance × quality, each folded with its formula under its name, and read against the 85 % target.",
  "Planned time, run time and total count are each used twice; they are defined once and referred to elsewhere.",
];

export const builtFrom = [
  "calculation",
  "tree",
  "given",
  { name: "Stat", page: "@umriss-ui/core#stat" },
  { name: "Card", page: "@umriss-ui/core#card" },
  { name: "Alert", page: "@umriss-ui/core#alert" },
];

/* The early shift starts at 06:00; 10:30 is minute 270 into it, so the
   minutes 0 to 269 have passed. */
const SHIFT = plant(17);
const MINUTE = 270;
const count = countAt(SHIFT, MINUTE - 1);
const stopped = SHIFT.readings.filter((one) => one.minute < MINUTE && !one.running).map((one) => one.minute);
const clock = (minute: number) => `${String(6 + Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;

const OEE_TARGET = 0.85;
const OEE_LIMITS = [
  { value: 0.75, side: "lower", severity: "warning" },
  { value: 0.65, side: "lower", severity: "alarm" },
] as const;

export default function ExplainTheOee() {
  return (
    <Stack gap={4}>
      <Grid minItemWidth="180px" gap={4} data-callout="1">
        <Stat label="Planned so far" value={count.planned} unit="min" />
        <Stat label="Belt stopped" value={count.downtime} unit="min" />
        <Stat label="Tiles out of the kiln" value={count.total} unit="pcs" />
        <Stat label="Of them good" value={count.good} unit="pcs" />
      </Grid>

      {stopped.length > 0 && (
        <Alert tone="warning" title={`Feed stopped ${clock(stopped[0]!)} to ${clock(stopped.at(-1)! + 1)}`} data-callout="2">
          The kiln's zone 3 went above {KILN.alarm} °C; tiles fired outside {KILN.tolerance[0]} to {KILN.tolerance[1]} °C
          count as scrap.
        </Alert>
      )}

      <Card>
        <CardHeader title={`OEE, early shift up to ${clock(MINUTE)}`} />
        <CardBody>
          <Stack gap={2}>
            <div data-callout="3">
              <Calculation aria-label="OEE of the early shift so far">
                <Product label="OEE" format="percent" target={OEE_TARGET} limits={OEE_LIMITS}>
                  <Quotient label="Availability" format="percent" explanation="Lost to stops of the belt.">
                    <Difference id="runtime" label="Run time" unit="min">
                      <Given id="planned" label="Planned production time" value={count.planned} unit="min" source="Shift calendar" />
                      <Given label="Downtime" value={count.downtime} unit="min" source="Belt drive" />
                    </Difference>
                    <Ref to="planned" />
                  </Quotient>
                  <Quotient label="Performance" format="percent" explanation="Lost to jams and slow cycles.">
                    <Product label="Ideal run time" unit="min">
                      <Given label="Ideal cycle time" value={IDEAL_CYCLE_MINUTES} unit="min/pc" source="Kiln K1 rating" />
                      <Given id="total" label="Total count" value={count.total} unit="pcs" source="Exit counter" />
                    </Product>
                    <Ref to="runtime" />
                  </Quotient>
                  <Quotient label="Quality" format="percent" explanation="Lost to scrap fired outside the tolerance.">
                    <Given label="Good count" value={count.good} unit="pcs" source="Exit counter" />
                    <Ref to="total" />
                  </Quotient>
                </Product>
              </Calculation>
            </div>
            <Text size="sm" tone="muted" data-callout="4">
              Hover a line: its operands and every place it is used light up.
            </Text>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
