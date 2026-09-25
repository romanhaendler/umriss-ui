/* One simulated plant: a kiln line over an early shift (control-room-demo, R2).

   Every part of the control room reads from this one shift - the trend, the
   tiles, the alarm list, the control chart, the plan and the OEE. That is the
   point of it: the limit the kiln crosses in the trend is the alarm in the list,
   the verdict on the tile and the scrap in the OEE, because all four are read
   off the same minute of the same readings, and none of them is told
   separately.

   Pure and seeded. The same seed gives the same shift on every machine, so a
   screenshot holds still; nothing here reads a clock. The plant counts in
   minutes from the start of the shift, and whoever draws it adds the instant
   the shift began.

   The plant generates alarms, which is exactly what the library does not do
   (ADR-0009): it decides that a reading above the bound is an alarm, and when
   it has come back far enough to clear. The table's model takes it from
   there. */

import { acknowledge, hasReturned } from "@umriss-ui/table";
import type { Alarm, AlarmType } from "@umriss-ui/table";
import type { LimitSet } from "../src";

/** The early shift, 06:00 to 14:00. */
export const SHIFT_MINUTES = 480;

/** The kiln's zone 3 is read against this - by the tile, the trend and the
    alarm alike. Between the two warnings lies the tolerance: a tile fired
    outside it is scrap. */
export const KILN_LIMITS: LimitSet = {
  target: 1200,
  limits: [
    { value: 1215, side: "upper", severity: "warning" },
    { value: 1230, side: "upper", severity: "alarm" },
    { value: 1185, side: "lower", severity: "warning" },
  ],
};

/** The kiln fires one tile every quarter of a minute when nothing holds it up -
    the ideal cycle time of the OEE's performance. */
export const IDEAL_CYCLE_MINUTES = 0.25;

/** What the four measuring points of the line can report. */
export const ALARM_TYPES: readonly AlarmType[] = [
  {
    id: "kiln-high",
    label: "Kiln K1 · zone 3 above alarm limit",
    priority: "high",
    /* The dead band: back below 1222 °C, not merely below the bound, or a
       reading riding on 1230 would raise an alarm a minute. */
    returnBand: { direction: "obere", limit: 1230, returnTo: 1222 },
  },
  { id: "exit-silent", label: "Kiln K1 · exit pyrometer sends nothing", priority: "medium" },
  { id: "belt-empty", label: "Kiln K1 · belt empty", priority: "medium" },
  { id: "dryer-fan", label: "Dryer D1 · fan vibration high", priority: "low" },
];

/** One minute of the line. */
export interface Reading {
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
export interface Sample {
  minute: number;
  /** The tile's length after firing, in mm (nominal 600). */
  length: number;
}

/** A batch of tiles through the three stations. */
export interface Batch {
  id: string;
  name: string;
  /** How many tiles the batch is planned for. */
  tiles: number;
  /** Minutes since the start of the shift, per station. */
  press: readonly [number, number];
  dryer: readonly [number, number];
  kiln: readonly [number, number];
}

export interface Plant {
  readings: readonly Reading[];
  samples: readonly Sample[];
  batches: readonly Batch[];
}

/** A small LCG - reproducible across runs and platforms. */
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* When the exit pyrometer goes silent, and for how long. Fixed rather than
   seeded, so that the control room opens on a stale reading that turns lost
   while one watches, and comes back. */
const SILENT_FROM = 288;
const SILENT_FOR = 50;

/* The dryer's vibration sensor is under maintenance all shift: its alarm stands
   and is out of service. */
const DRYER_FAN_RAISED = 20;

/** The shift, from a seed. */
export function plant(seed: number): Plant {
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

  const readings: Reading[] = [];
  const samples: Sample[] = [];
  let drift = 0;
  for (let minute = 0; minute < SHIFT_MINUTES; minute++) {
    drift = 0.9 * drift + (r() - 0.5) * 3;
    const into = minute - surgeFrom;
    const surge = into >= 0 && into <= surgeFor ? 42 * Math.sin((Math.PI * into) / surgeFor) : 0;
    const kiln = Math.round((1200 + drift + surge) * 10) / 10;

    const running = !(minute >= stopFrom && minute < stopFrom + stopFor);
    const fired = running ? (r() < 0.12 ? 3 : 4) : 0;
    const inTolerance = kiln >= 1185 && kiln <= 1215;
    const silent = minute >= SILENT_FROM && minute < SILENT_FROM + SILENT_FOR;
    const exit = silent ? null : Math.round((kiln - 380 + (r() - 0.5) * 4) * 10) / 10;

    readings.push({ minute, kiln, exit, running, fired, good: inTolerance ? fired : 0 });

    if (running && minute % 10 === 0) {
      /* Hotter shrinks more: the length follows the kiln, so the control
         chart sees the excursion the trend sees. */
      const length = 600 + (1200 - kiln) * 0.05 + (r() - 0.5) * 0.6;
      samples.push({ minute, length: Math.round(length * 100) / 100 });
    }
  }

  const batches: Batch[] = [];
  let at = 0;
  for (let i = 0; at < SHIFT_MINUTES; i++) {
    const length = 70 + Math.floor(r() * 25);
    batches.push({
      id: `b-${4121 + i}`,
      name: `B-${4121 + i}`,
      tiles: Math.round(length / IDEAL_CYCLE_MINUTES / 10) * 10,
      press: [at, at + length],
      dryer: [at + 30, at + 30 + length],
      kiln: [at + 60, at + 60 + length],
    });
    at += length + 5;
  }

  return { readings, samples, batches };
}

/** The readings up to and including the minute. */
export function upTo<T extends { minute: number }>(series: readonly T[], minute: number): readonly T[] {
  return series.filter((one) => one.minute <= minute);
}

/** How long ago the exit pyrometer last reported, in minutes - `0` while it
    reports. What the tile's freshness is told. */
export function exitSilence(p: Plant, minute: number): number {
  for (let m = minute; m >= 0; m--) {
    if (p.readings[m]?.exit !== null) return minute - m;
  }
  return minute;
}

/** When a condition held, as spans of minutes: `[from, to)`, `to` absent while
    it still holds at the minute. */
function spans(
  readings: readonly Reading[],
  minute: number,
  raise: (one: Reading) => boolean,
  clear: (one: Reading) => boolean,
): { from: number; to?: number }[] {
  const found: { from: number; to?: number }[] = [];
  let open: { from: number; to?: number } | null = null;
  for (const one of readings) {
    if (one.minute > minute) break;
    if (open === null && raise(one)) {
      open = { from: one.minute };
      found.push(open);
    } else if (open !== null && clear(one)) {
      open.to = one.minute;
      open = null;
    }
  }
  return found;
}

/**
 * The alarms of the shift as they stand at the minute: raised, cleared - and
 * acknowledged where the operator did, at the instant he did.
 *
 * `start` is the instant the shift began; the alarms carry instants because the
 * table's model does.
 */
export function alarmsAt(
  p: Plant,
  minute: number,
  start: number,
  acknowledged: ReadonlyMap<string, number> = new Map(),
): Alarm[] {
  const instant = (m: number) => start + m * 60_000;
  const kiln = ALARM_TYPES[0]!.returnBand!;
  const alarms: Alarm[] = [];

  const add = (
    type: string,
    span: { from: number; to?: number },
    extra: { availability?: "suppressed-by-design" | "out-of-service" } = {},
  ) => {
    alarms.push({
      id: `${type}-${span.from}`,
      type,
      lifecycle: span.to === undefined ? "standing-unacknowledged" : "cleared-unacknowledged",
      raised: instant(span.from),
      ...(span.to === undefined ? {} : { cleared: instant(span.to) }),
      ...extra,
    });
  };

  for (const span of spans(p.readings, minute, (one) => one.kiln > kiln.limit, (one) => hasReturned(kiln, one.kiln))) {
    add("kiln-high", span);
  }
  for (const span of spans(p.readings, minute, (one) => one.exit === null, (one) => one.exit !== null)) {
    add("exit-silent", span);
  }
  /* The belt runs empty because the operator stopped the feed: the plant's
     logic knows it, so the alarm is suppressed by design - there, and neutral. */
  for (const span of spans(p.readings, minute, (one) => !one.running, (one) => one.running)) {
    add("belt-empty", span, { availability: "suppressed-by-design" });
  }
  if (minute >= DRYER_FAN_RAISED) {
    add("dryer-fan", { from: DRYER_FAN_RAISED }, { availability: "out-of-service" });
  }

  return alarms.map((alarm) => {
    const at = acknowledged.get(alarm.id);
    return at === undefined ? alarm : acknowledge([alarm], [alarm.id], at).alarms[0]!;
  });
}

/** The shift's figures for the OEE, up to and including the minute. */
export interface ShiftCount {
  /** Minutes of the shift so far. */
  planned: number;
  /** Minutes the belt stood. */
  downtime: number;
  /** Tiles out of the kiln. */
  total: number;
  /** Of them, inside the tolerance. */
  good: number;
}

export function countAt(p: Plant, minute: number): ShiftCount {
  const so = upTo(p.readings, minute);
  return {
    planned: so.length,
    downtime: so.filter((one) => !one.running).length,
    total: so.reduce((sum, one) => sum + one.fired, 0),
    good: so.reduce((sum, one) => sum + one.good, 0),
  };
}
