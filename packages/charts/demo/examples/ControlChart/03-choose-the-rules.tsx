import { useState } from "react";
import { Chart, ControlChart, Tooltip, XAxis, YAxis } from "../../../src";
import type { RuleName, Violation } from "../../../src";

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

export const title = "Choose the rules";
export const lead = "In the plant: `rules` switches rules off and sets their run lengths - here rule 4 is off and a run counts from eight - and without `zoneLines` the sigma zones stay unmarked.";

const SAMPLES = plant(7).samples;
const REFERENCE_WINDOW = { kind: "referenceWindow", from: 0, to: 15 } as const;

/* Western Electric's run of eight in place of Nelson's nine; "two of three
   near a limit" is not watched on this line, so its zones need no lines. */
const CHOSEN = { twoOfThree: false, runLength: 8 } as const;

const RULES: Record<RuleName, string> = {
  outlier: "Beyond a control limit",
  run: "Eight on one side of the centre",
  trend: "A steady climb or fall",
  twoOfThree: "Two of three near a limit",
};

const clock = (minute: number) => {
  const total = 6 * 60 + minute;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

export default function ChooseTheRules() {
  const [found, setFound] = useState<readonly Violation[]>([]);
  return (
    <div className="side-by-side">
      <div style={{ flex: "1 1 320px" }}>
        <Chart data={SAMPLES} height={240} ariaLabel="Control chart of the tile length under three of the four rules">
          <XAxis accessor={(d: Sample) => d.minute} label="Minute of the shift" />
          <YAxis accessor={(d: Sample) => d.length} label="mm" />
          <ControlChart
            accessor={(d: Sample) => d.length}
            data={SAMPLES}
            origin={REFERENCE_WINDOW}
            name="Tile length"
            rules={CHOSEN}
            zoneLines={false}
            onViolations={setFound}
          />
          <Tooltip mode="x" />
        </Chart>
      </div>
      <ul className="side-note">
        {found.length === 0 ? (
          <li>No rule violated.</li>
        ) : (
          found.map((v) => (
            <li key={v.rule}>
              <strong>{RULES[v.rule]}</strong>: {v.indices.map((i) => clock(SAMPLES[i]!.minute)).join(", ")}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
