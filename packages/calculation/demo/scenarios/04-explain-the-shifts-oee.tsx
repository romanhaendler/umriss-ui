import { Alert, Card, CardBody, CardHeader, Grid, Stack, Stat, Text } from "@umriss-ui/core";
import { Calculation, Difference, Given, Product, Quotient, Ref } from "../../src";

/* Data from the plant world, written out here so the example runs on its own. */

/** A small LCG - reproducible across runs and platforms. */
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** The early shift, 06:00 to 14:00. */
const SHIFT_MINUTES = 480;

/** The kiln's zone 3, in °C: the numbers every part reads it against, once.
    Between the two warnings lies the tolerance - a tile fired outside it is
    scrap; `returnTo` is the alarm's dead band. */
const KILN = { target: 1200, tolerance: [1185, 1215], alarm: 1230, returnTo: 1222 } as const;

/** The kiln fires one tile every quarter of a minute when nothing holds it up -
    the ideal cycle time of the OEE's performance. */
const IDEAL_CYCLE_MINUTES = 0.25;

/** One minute of the line. */
interface Reading {
  /** Minutes since the start of the shift. */
  minute: number;
  /** Zone 3 of the kiln, in °C. */
  kiln: number;
  /** The exit pyrometer, in °C - `null` while it sends nothing. */
  exit: number | null;
  /** Whether the belt runs. */
  running: boolean;
  /** Tiles out of the kiln in this minute. */
  fired: number;
  /** Of them, the ones fired inside the tolerance. */
  good: number;
}

/** A tile taken off the belt and measured - one every ten minutes while it runs. */
interface Sample {
  minute: number;
  /** The tile's length after firing, in mm (nominal 600). */
  length: number;
}

/** A batch of tiles through the three stations. */
interface Batch {
  id: string;
  name: string;
  /** How many tiles the batch is planned for. */
  tiles: number;
  /** Minutes since the start of the shift, per station. */
  press: readonly [number, number];
  dryer: readonly [number, number];
  kiln: readonly [number, number];
}

interface Plant {
  readings: readonly Reading[];
  samples: readonly Sample[];
  batches: readonly Batch[];
}

/* When the exit pyrometer goes silent, and for how long. Fixed rather than
   seeded, so that a running control room shows its reading turn stale, then
   lost, and come back. */
const SILENT_FROM = 288;
const SILENT_FOR = 50;

/** The shift, from a seed. */
function plant(seed: number): Plant {
  const r = random(seed);

  /* The one excursion: a burner overshoots somewhere between 02:30 and 03:30
     into the shift, for half an hour, peaking near 1242 °C. The operator stops
     the feed twenty-two minutes in, for eighteen minutes. The noise around it
     is too small to reach a warning on its own, so this is the only crossing -
     which is what the tests hold. */
  const surgeFrom = 150 + Math.floor(r() * 60);
  const surgeFor = 30;
  const stopFrom = surgeFrom + 22;
  const stopFor = 18;

  /* The plan: batches through the kiln one after another, each pressed an
     hour and dried half an hour before - the first ones during the night
     shift. Tiles come out of the kiln only while a batch is in it, so the
     OEE's count and the batches' counts are the same tiles. The plan is a
     plan: a stop of the belt does not move it. */
  const batches: Batch[] = [];
  for (let at = 0, i = 0; at < SHIFT_MINUTES; i++) {
    const length = 70 + Math.floor(r() * 25);
    batches.push({
      id: `b-${4121 + i}`,
      name: `B-${4121 + i}`,
      tiles: Math.round(length / IDEAL_CYCLE_MINUTES / 10) * 10,
      press: [at - 60, at - 60 + length],
      dryer: [at - 30, at - 30 + length],
      kiln: [at, at + length],
    });
    at += length + 5;
  }

  const readings: Reading[] = [];
  const samples: Sample[] = [];
  let drift = 0;
  for (let minute = 0; minute < SHIFT_MINUTES; minute++) {
    drift = 0.9 * drift + (r() - 0.5) * 3;
    const into = minute - surgeFrom;
    const surge = into >= 0 && into <= surgeFor ? 42 * Math.sin((Math.PI * into) / surgeFor) : 0;
    const kiln = Math.round((KILN.target + drift + surge) * 10) / 10;

    const running = !(minute >= stopFrom && minute < stopFrom + stopFor);
    const loaded = batches.some((batch) => batch.kiln[0] <= minute && minute < batch.kiln[1]);
    const jam = r() < 0.12;
    const fired = running && loaded ? (jam ? 3 : 4) : 0;
    const inTolerance = kiln >= KILN.tolerance[0] && kiln <= KILN.tolerance[1];
    const silent = minute >= SILENT_FROM && minute < SILENT_FROM + SILENT_FOR;
    const exit = silent ? null : Math.round((kiln - 380 + (r() - 0.5) * 4) * 10) / 10;

    readings.push({ minute, kiln, exit, running, fired, good: inTolerance ? fired : 0 });

    if (running && minute % 10 === 0) {
      /* Hotter shrinks more: the length follows the kiln, so the control
         chart sees the excursion the trend sees. */
      const length = 600 + (KILN.target - kiln) * 0.05 + (r() - 0.5) * 0.6;
      samples.push({ minute, length: Math.round(length * 100) / 100 });
    }
  }

  return { readings, samples, batches };
}

/** The readings up to and including the minute. */
function upTo<T extends { minute: number }>(series: readonly T[], minute: number): readonly T[] {
  return series.filter((one) => one.minute <= minute);
}

/** The shift's figures for the OEE, up to and including the minute. */
interface ShiftCount {
  /** Minutes of the shift so far. */
  planned: number;
  /** Minutes the belt stood. */
  downtime: number;
  /** Tiles out of the kiln. */
  total: number;
  /** Of them, inside the tolerance. */
  good: number;
}

function countAt(p: Plant, minute: number): ShiftCount {
  const so = upTo(p.readings, minute);
  return {
    planned: so.length,
    downtime: so.filter((one) => !one.running).length,
    total: so.reduce((sum, one) => sum + one.fired, 0),
    good: so.reduce((sum, one) => sum + one.good, 0),
  };
}

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
