import { Badge, Card, CardBody, CardHeader, Stack, Text } from "@umriss-ui/core";
import {
  Chart,
  ControlChart,
  LimitBand,
  LimitLine,
  Line,
  Tooltip,
  XAxis,
  YAxis,
  controlLimits,
  violations,
  type RuleName,
} from "../../src";

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

export const title = "Hold the tile length in control";

export const lead =
  "A quality engineer at the tile works reviews the early shift: whether the fired tiles kept their length, and what the kiln did when they did not.";

export const callouts = [
  "The specification, 600 ± 1.5 mm, is chosen and drawn dashed; the control limits are calculated from the first two hours, when the kiln ran steady.",
  "Samples that break a rule are marked on the chart and listed here, with the time and the rules, for the shift report.",
  "The kiln's zone 3 on the same minutes, with its tolerance and alarm limit: the tiles shrank while the kiln ran hot. Both charts share one pointer, so a marked sample and the kiln reading of its minute are read together.",
];

export const builtFrom = [
  "controlchart",
  "limitline",
  "line",
  "tooltip",
  { name: "Badge", page: "@umriss-ui/core#badge" },
  { name: "Card", page: "@umriss-ui/core#card" },
];

const SHIFT = plant(17);
const SPEC = { nominal: 600, tolerance: 1.5 };
/* Twelve samples, one every ten minutes: the first two hours. */
const REFERENCE = { kind: "referenceWindow", from: 0, to: 12 } as const;
const DOMAIN: readonly [number, number] = [0, SHIFT_MINUTES];
const HOURS = Array.from({ length: SHIFT_MINUTES / 60 + 1 }, (_, i) => i * 60);

const RULES: Record<RuleName, string> = {
  outlier: "Beyond a control limit",
  run: "Run on one side of the centre",
  trend: "Steady rise or fall",
  twoOfThree: "Two of three near a limit",
};

const lengths = SHIFT.samples.map((one) => one.length);
const BROKEN = violations(lengths, controlLimits(lengths, REFERENCE));
/* One line per sample, naming every rule it broke. */
const FOUND = [...new Set(BROKEN.flatMap((one) => one.indices))]
  .sort((a, b) => a - b)
  .map((index) => ({
    sample: SHIFT.samples[index]!,
    rules: BROKEN.filter((one) => one.indices.includes(index)).map((one) => RULES[one.rule]),
  }));

/* The early shift begins at 06:00. */
const clock = (minute: number) => {
  const m = Math.round(minute) + 6 * 60;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

export default function TileLength() {
  return (
    <Stack gap={4}>
      <Card data-callout="1">
        <CardHeader title="Tile length after firing" eyebrow="Kiln K1 · early shift" />
        <CardBody>
          <Chart data={SHIFT.samples} height={280} syncId="tiles" ariaLabel="Control chart of the tile length over the early shift">
            <XAxis accessor={(d: Sample) => d.minute} domain={DOMAIN} ticks={HOURS} tickFormat={clock} />
            <YAxis accessor={(d: Sample) => d.length} label="mm" />
            <LimitLine value={SPEC.nominal + SPEC.tolerance} severity="alarm" label="USL" inExtent />
            <LimitLine value={SPEC.nominal - SPEC.tolerance} severity="alarm" label="LSL" inExtent />
            <ControlChart
              accessor={(d: Sample) => d.length}
              data={SHIFT.samples}
              origin={REFERENCE}
              name="Length"
              labelUpper="UCL"
              labelLower="LCL"
              violationName="Length - rule broken"
            />
            <Tooltip mode="x" />
          </Chart>
        </CardBody>
      </Card>
      <Card data-callout="2">
        <CardHeader title="Samples out of control" actions={<Badge tone={FOUND.length > 0 ? "warning" : "success"}>{FOUND.length}</Badge>} />
        <CardBody>
          <Stack gap={1}>
            {FOUND.length === 0 && <Text size="sm">No sample broke a rule this shift.</Text>}
            {FOUND.map(({ sample, rules }) => (
              <Text key={sample.minute} size="sm">
                <Text as="span" mono>
                  {clock(sample.minute)}
                </Text>{" "}
                {sample.length.toFixed(2)} mm · {rules.join(", ")}
              </Text>
            ))}
          </Stack>
        </CardBody>
      </Card>
      <Card data-callout="3">
        <CardHeader title="Kiln zone 3" />
        <CardBody>
          <Chart data={SHIFT.readings} height={200} syncId="tiles" ariaLabel="Kiln zone 3 temperature over the early shift">
            <XAxis accessor={(d: Reading) => d.minute} domain={DOMAIN} ticks={HOURS} tickFormat={clock} />
            <YAxis accessor={(d: Reading) => d.kiln} label="°C" tickCount={4} />
            <LimitBand from={KILN.tolerance[0]} to={KILN.tolerance[1]} severity="warning" label="Tolerance" />
            <LimitLine value={KILN.alarm} severity="alarm" label="Alarm limit" inExtent />
            <Line accessor={(d: Reading) => d.kiln} name="Zone 3" />
            <Tooltip mode="x" />
          </Chart>
        </CardBody>
      </Card>
    </Stack>
  );
}
