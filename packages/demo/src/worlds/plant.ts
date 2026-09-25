/**
 * The plant world: Brenholt Tile Works, a tile maker with one kiln line, and the
 * machine shop next door.
 *
 * The standing cast:
 * - the kiln line - press, dryer D1 and kiln K1 - over one early shift, minute
 *   by minute: readings, samples, batches and the alarms they raise (`plant`);
 * - the machine shop's plan for Tuesday, 17 March 2026: seven stations, six
 *   orders, their steps and the dependencies between them (`STATIONS`,
 *   `ORDERS`, `STEPS`, `MOVES`);
 * - the series the charts draw from the week of Monday, 16 March 2026: machine
 *   states, measurements, downtime reasons, scrap per shift, power draw, a
 *   hardening furnace, a kiln over a week (`WEEK_START` and after).
 *
 * Plain data and small pure functions, no imports: copy the file beside an
 * example and it runs. Seeded, so the same seed gives the same numbers on
 * every machine; nothing here reads a clock.
 */

/* The few shapes the umriss packages expect, written out so this file needs
   no import. The data is structurally what the packages take. */

/** A limit set as `@umriss-ui/core` reads it. */
interface LimitSet {
  target?: number;
  limits?: readonly { value: number; side: "upper" | "lower"; severity: "warning" | "alarm" }[];
}

/** An alarm's dead band, as `@umriss-ui/table` reads it. */
interface ReturnBand {
  direction: "upper" | "lower";
  limit: number;
  returnTo: number;
}

/** A kind of alarm, as `@umriss-ui/table` reads it. */
interface AlarmType {
  id: string;
  label: string;
  priority: "high" | "medium" | "low";
  returnBand?: ReturnBand;
}

/** One alarm, as `@umriss-ui/table` reads it. */
interface Alarm {
  id: string;
  type: string;
  lifecycle: "active-unacknowledged" | "active-acknowledged" | "resolved-unacknowledged" | "resolved-acknowledged";
  raised: number;
  resolved?: number;
  acknowledgedAt?: number;
  availability?: "in-service" | "suppressed" | "disabled";
}

/** A task, a subtask and a dependency, as `@umriss-ui/schedule` reads them. */
interface Task {
  readonly id: string;
  readonly name?: string;
  readonly color: string;
}
interface Subtask {
  readonly id: string;
  readonly task: string;
  readonly lane: string;
  readonly from: number;
  readonly to: number;
  readonly leadIn?: number;
  readonly leadOut?: number;
}
interface Dependency {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly lag: number;
  readonly leaves?: "main" | "leadOut";
  readonly arrives?: "main" | "leadIn";
}

/** A small LCG - reproducible across runs and platforms. */
export function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* ---------------------------------------------------------------------------
   The kiln line over an early shift.

   Every part of a control room reads from this one shift - the trend, the
   tiles, the alarm list, the control chart, the plan and the OEE. The limit
   the kiln crosses in the trend is the alarm in the list, the verdict on the
   tile and the scrap in the OEE, because all four are read off the same
   minute of the same readings. The line counts in minutes from the start of
   the shift, and whoever draws it adds the instant the shift began.

   The line generates alarms, which is exactly what the library does not do
   (ADR-0009): it decides that a reading above the limit is an alarm, and when
   it has come back far enough to clear. The table's model takes it from
   there.
   --------------------------------------------------------------------------- */

/** The early shift, 06:00 to 14:00. */
export const SHIFT_MINUTES = 480;

/** The kiln's zone 3, in °C: the numbers every part reads it against, once.
    Between the two warnings lies the tolerance - a tile fired outside it is
    scrap; `returnTo` is the alarm's dead band. */
export const KILN = { target: 1200, tolerance: [1185, 1215], alarm: 1230, returnTo: 1222 } as const;

/** The same numbers as the limit set the tile and the verdict read. */
export const KILN_LIMITS: LimitSet = {
  target: KILN.target,
  limits: [
    { value: KILN.tolerance[1], side: "upper", severity: "warning" },
    { value: KILN.alarm, side: "upper", severity: "alarm" },
    { value: KILN.tolerance[0], side: "lower", severity: "warning" },
  ],
};

/** The kiln fires one tile every quarter of a minute when nothing holds it up -
    the ideal cycle time of the OEE's performance. */
export const IDEAL_CYCLE_MINUTES = 0.25;

/** The kiln alarm's condition and its dead band, as the table's model reads them. */
const KILN_RETURN: ReturnBand = { direction: "upper", limit: KILN.alarm, returnTo: KILN.returnTo };

/** What the four measuring points of the line can report. */
export const ALARM_TYPES: readonly AlarmType[] = [
  {
    id: "kiln-high",
    label: "Kiln K1 · zone 3 above alarm limit",
    priority: "high",
    /* The dead band: back below `returnTo`, not merely below the limit, or a
       reading riding on the limit would raise an alarm a minute. */
    returnBand: KILN_RETURN,
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

/* When the exit pyrometer goes silent, and for how long. Fixed rather than
   seeded, so that a running control room shows its reading turn stale, then
   lost, and come back. */
const SILENT_FROM = 288;
const SILENT_FOR = 50;

/* The dryer's vibration sensor is under maintenance all shift: its alarm is
   active and disabled. */
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
 * The alarms of the shift as they stand at the minute: raised, resolved - and
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
  const alarms: Alarm[] = [];

  const add = (
    type: string,
    span: { from: number; to?: number },
    extra: { availability?: "suppressed" | "disabled" } = {},
  ) => {
    alarms.push({
      id: `${type}-${span.from}`,
      type,
      lifecycle: span.to === undefined ? "active-unacknowledged" : "resolved-unacknowledged",
      raised: instant(span.from),
      ...(span.to === undefined ? {} : { resolved: instant(span.to) }),
      ...extra,
    });
  };

  for (const span of spans(p.readings, minute, (one) => one.kiln > KILN_RETURN.limit, (one) => one.kiln <= KILN_RETURN.returnTo)) {
    add("kiln-high", span);
  }
  for (const span of spans(p.readings, minute, (one) => one.exit === null, (one) => one.exit !== null)) {
    add("exit-silent", span);
  }
  /* The belt runs empty because the operator stopped the feed: the plant's
     logic knows it, so the alarm is suppressed - there, and neutral. */
  for (const span of spans(p.readings, minute, (one) => !one.running, (one) => one.running)) {
    add("belt-empty", span, { availability: "suppressed" });
  }
  if (minute >= DRYER_FAN_RAISED) {
    add("dryer-fan", { from: DRYER_FAN_RAISED }, { availability: "disabled" });
  }

  return alarms.map((alarm) => {
    const at = acknowledged.get(alarm.id);
    if (at === undefined) return alarm;
    const lifecycle = alarm.resolved === undefined ? "active-acknowledged" : "resolved-acknowledged";
    return { ...alarm, lifecycle, acknowledgedAt: at };
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

/* ---------------------------------------------------------------------------
   The machine shop's plan: seven stations, six orders on their way through
   them on Tuesday, 17 March 2026 - the day the browser suites freeze the
   clock on.

   Written out, not generated from a seed: a planner reads these as a day's
   plan, and a finding is placed where it is on purpose - the overlap on the
   mill, the violated dependency into the paint shop.
   --------------------------------------------------------------------------- */

const planAt = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

export const DAY_OF_PLAN: readonly [number, number] = [planAt(5, 30), planAt(18)];

export const STATIONS = [
  { id: "saw", label: "Saw 1" },
  { id: "lathe-1", label: "Lathe 1" },
  { id: "lathe-2", label: "Lathe 2" },
  { id: "mill", label: "Mill" },
  { id: "press", label: "Press 2" },
  { id: "paint", label: "Paint shop" },
  { id: "qa", label: "Inspection" },
] as const;

/* Colours in both schemes, as the application's own tokens would give them. */
export const ORDERS: readonly Task[] = [
  { id: "a-2041", name: "A-2041 Housing", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "a-2042", name: "A-2042 Shaft", color: "light-dark(#0d9488, #3cc7b8)" },
  { id: "a-2043", name: "A-2043 Bracket", color: "light-dark(#c2410c, #f08a52)" },
  { id: "a-2044", name: "A-2044 Flange", color: "light-dark(#7c3aed, #a98bfa)" },
  { id: "a-2045", name: "A-2045 Cover", color: "light-dark(#be185d, #f06aa6)" },
  { id: "a-2046", name: "A-2046 Axle", color: "light-dark(#4d7c0f, #8fc43e)" },
];

export const STEPS: readonly Subtask[] = [
  { id: "a-2041-1", task: "a-2041", lane: "saw", from: planAt(6), to: planAt(7), leadIn: min(15), leadOut: min(10) },
  { id: "a-2041-2", task: "a-2041", lane: "mill", from: planAt(8), to: planAt(10, 30), leadIn: min(30), leadOut: min(15) },
  { id: "a-2041-3", task: "a-2041", lane: "qa", from: planAt(11, 30), to: planAt(12, 15) },

  { id: "a-2042-1", task: "a-2042", lane: "saw", from: planAt(7, 30), to: planAt(8, 15), leadIn: min(10) },
  { id: "a-2042-2", task: "a-2042", lane: "lathe-1", from: planAt(9), to: planAt(11), leadIn: min(20), leadOut: min(15) },
  { id: "a-2042-3", task: "a-2042", lane: "qa", from: planAt(13), to: planAt(13, 30) },

  { id: "a-2043-1", task: "a-2043", lane: "press", from: planAt(6, 30), to: planAt(8), leadIn: min(30), leadOut: min(15) },
  { id: "a-2043-2", task: "a-2043", lane: "mill", from: planAt(10), to: planAt(11, 30), leadIn: min(15) },
  { id: "a-2043-3", task: "a-2043", lane: "paint", from: planAt(12), to: planAt(14), leadIn: min(20), leadOut: min(20) },

  { id: "a-2044-1", task: "a-2044", lane: "lathe-2", from: planAt(6), to: planAt(8, 30), leadIn: min(20), leadOut: min(10) },
  { id: "a-2044-2", task: "a-2044", lane: "press", from: planAt(9, 30), to: planAt(10, 45), leadIn: min(25) },
  { id: "a-2044-3", task: "a-2044", lane: "paint", from: planAt(14, 45), to: planAt(16), leadIn: min(15), leadOut: min(15) },

  { id: "a-2045-1", task: "a-2045", lane: "lathe-1", from: planAt(12), to: planAt(13, 30), leadIn: min(15), leadOut: min(10) },
  { id: "a-2045-2", task: "a-2045", lane: "press", from: planAt(14, 15), to: planAt(15), leadIn: min(20) },
  { id: "a-2045-3", task: "a-2045", lane: "qa", from: planAt(15, 45), to: planAt(16, 30) },

  { id: "a-2046-1", task: "a-2046", lane: "lathe-2", from: planAt(10), to: planAt(12), leadIn: min(20), leadOut: min(15) },
  { id: "a-2046-2", task: "a-2046", lane: "mill", from: planAt(13), to: planAt(14, 30), leadIn: min(20), leadOut: min(10) },
  { id: "a-2046-3", task: "a-2046", lane: "qa", from: planAt(15), to: planAt(15, 30) },
];

export const MOVES: readonly Dependency[] = [
  { id: "t-2041-1", from: "a-2041-1", to: "a-2041-2", lag: min(10) },
  { id: "t-2041-2", from: "a-2041-2", to: "a-2041-3", lag: min(20) },
  { id: "t-2042-1", from: "a-2042-1", to: "a-2042-2", lag: min(15) },
  { id: "t-2042-2", from: "a-2042-2", to: "a-2042-3", lag: min(30), leaves: "main" },
  { id: "t-2043-1", from: "a-2043-1", to: "a-2043-2", lag: min(45) },
  /* Leaves the mill at 11:30 and has 10 minutes to reach the paint shop's
     lead-in at 11:40 - it takes 25: a violated dependency, on purpose. */
  { id: "t-2043-2", from: "a-2043-2", to: "a-2043-3", lag: min(25) },
  { id: "t-2044-1", from: "a-2044-1", to: "a-2044-2", lag: min(20) },
  { id: "t-2044-2", from: "a-2044-2", to: "a-2044-3", lag: min(60), arrives: "main" },
  { id: "t-2045-1", from: "a-2045-1", to: "a-2045-2", lag: min(15) },
  { id: "t-2045-2", from: "a-2045-2", to: "a-2045-3", lag: min(15) },
  { id: "t-2046-1", from: "a-2046-1", to: "a-2046-2", lag: min(20) },
  { id: "t-2046-2", from: "a-2046-2", to: "a-2046-3", lag: min(10), leaves: "main" },
];

/* ---------------------------------------------------------------------------
   The series the charts draw.

   The first four are deliberately without subject matter: a curve is a curve,
   and "Series A" says enough. The rest are the plant's - a state band without
   states, a Pareto without downtime reasons and a control chart without a
   measurement series show nothing.
   --------------------------------------------------------------------------- */

export interface Point {
  t: number;
  a: number;
  b: number;
  c: number;
  d: number | null;
}

/** A series with four channels; channel d contains a deliberate gap (R-2.5),
    and one reading in the middle of it - a point between two gaps. */
export function series(seed: number, n: number, gap = false): Point[] {
  const r = random(seed);
  const points: Point[] = new Array<Point>(n);
  let a = 50;
  let b = 30;
  let c = 70;
  let d = 45;
  const gapFrom = Math.floor(n * 0.42);
  const gapTo = Math.floor(n * 0.55);
  const lone = Math.floor((gapFrom + gapTo) / 2);
  for (let i = 0; i < n; i++) {
    a += (r() - 0.5) * 6;
    b += (r() - 0.48) * 4;
    c += (r() - 0.52) * 5;
    d += (r() - 0.5) * 7;
    points[i] = {
      t: i,
      a,
      b,
      c,
      d: gap && i >= gapFrom && i <= gapTo && i !== lone ? null : d,
    };
  }
  return points;
}

export interface DualPoint {
  t: number;
  small: number;
  large: number;
  medium: number;
}

/** Two to three series with clearly different extents. */
export function dualSeries(seed: number, n: number): DualPoint[] {
  const r = random(seed);
  const points: DualPoint[] = new Array<DualPoint>(n);
  let small = 21;
  let large = 128000;
  let medium = 640;
  for (let i = 0; i < n; i++) {
    small += (r() - 0.5) * 0.9;
    large += (r() - 0.5) * 9000;
    medium += (r() - 0.5) * 40;
    points[i] = { t: 2000 + i, small, large, medium };
  }
  return points;
}

export interface LoadPoint {
  t: number;
  s1: number;
  s2: number;
  s3: number;
}

/** Data set for the benchmark example: three series of any length. */
export function load(seed: number, n: number): LoadPoint[] {
  const r = random(seed);
  const points: LoadPoint[] = new Array<LoadPoint>(n);
  let s1 = 100;
  let s2 = 60;
  let s3 = 140;
  for (let i = 0; i < n; i++) {
    s1 += r() - 0.5;
    s2 += (r() - 0.5) * 0.8;
    s3 += (r() - 0.5) * 1.2;
    points[i] = { t: i, s1, s2, s3 };
  }
  return points;
}

export interface MixedPoint {
  t: number;
  inflow: number;
  outflow: number;
  stock: number;
  /** A corridor with a deliberate gap - the fill gets a hole there. */
  corridorLower: number | null;
  corridorUpper: number | null;
  sample: number;
}

/** Data set of the mixed example: two bar series, a corridor as a band area with a
    gap, a line above it and samples as a scatter. Few periods, so that individual
    bars stay visible. */
export function mixed(seed: number, n: number): MixedPoint[] {
  const r = random(seed);
  const points: MixedPoint[] = new Array<MixedPoint>(n);
  let stock = 62;
  const gapFrom = Math.floor(n * 0.45);
  const gapTo = Math.floor(n * 0.62);
  for (let i = 0; i < n; i++) {
    const inflow = 30 + r() * 25;
    const outflow = 22 + r() * 20;
    stock += (inflow - outflow) * 0.35;
    const inGap = i >= gapFrom && i <= gapTo;
    points[i] = {
      t: i + 1,
      inflow,
      outflow,
      stock,
      corridorLower: inGap ? null : stock - 9 - r() * 3,
      corridorUpper: inGap ? null : stock + 9 + r() * 3,
      sample: stock + (r() - 0.5) * 26,
    };
  }
  return points;
}

/* ---------------------------------------------------------------------------
   The plant's instruments: machine states, measurements, downtime reasons -
   with these the meaning is the subject.
   --------------------------------------------------------------------------- */

export const HOUR_MS = 3_600_000;
export const DAY_MS = 24 * HOUR_MS;

/** Monday, 16 March 2026, 00:00 local time - the anchor of every time series
    below. */
export const WEEK_START = new Date("2026-03-16T00:00:00").getTime();

export interface StatePoint {
  t: number;
  /** A code in PLANT_STATES. */
  m1: number;
  m2: number;
  /** A machine without a report: a gap stands here. */
  m3: number | null;
  temperature: number;
}

/** The closed set of states of the demo. The order is the code. */
export const PLANT_STATES = [
  { label: "Production", color: "#2f7d51" },
  { label: "Setup", color: "#c08a2e" },
  { label: "Fault", color: "#b4483f" },
  { label: "Maintenance", color: "#5b6b8c" },
] as const;

/** One shift of three machines: states per quarter of an hour, plus a temperature
    curve on the same x axis - that is what shows why the band sits in the same
    chart and not beside it. */
export function shift(seed: number, n: number): StatePoint[] {
  const r = random(seed);
  const points: StatePoint[] = new Array<StatePoint>(n);
  const start = WEEK_START + 6 * HOUR_MS;
  let m1 = 0;
  let m2 = 0;
  let m3: number | null = 0;
  let temperature = 806;
  for (let i = 0; i < n; i++) {
    if (r() < 0.16) m1 = Math.floor(r() * 4);
    if (r() < 0.12) m2 = Math.floor(r() * 3);
    // From a point on, machine 3 reports nothing any more: the band gets a hole,
    // and a hole is not a colour for "unknown".
    if (i > n * 0.62 && i < n * 0.78) m3 = null;
    else if (r() < 0.1) m3 = Math.floor(r() * 3);
    temperature += (r() - 0.5) * 9 + (m1 === 2 ? 6 : -0.6);
    points[i] = {
      t: start + i * 15 * 60_000,
      m1,
      m2,
      m3,
      temperature,
    };
  }
  return points;
}

export interface Measurement {
  n: number;
  value: number;
}

/** Individual values of a feature inspection. The process runs cleanly and then
    begins to drift - in such a way that the run rule fires and not only the
    outlier rule. */
export function measurements(seed: number, n: number): Measurement[] {
  const r = random(seed);
  const points: Measurement[] = new Array<Measurement>(n);
  for (let i = 0; i < n; i++) {
    const drift = i > n * 0.68 ? (i - n * 0.68) * 0.05 : 0;
    const outlier = i === Math.floor(n * 0.42) ? 0.9 : 0;
    points[i] = { n: i, value: 12.5 + (r() - 0.5) * 0.34 + drift + outlier };
  }
  return points;
}

export interface DowntimeReason {
  name: string;
  value: number;
}

/** Downtime reasons of one week, in an arbitrary input order - the sorting is the
    job of the Pareto module, not of the data. */
export const DOWNTIME_REASONS: readonly DowntimeReason[] = [
  { name: "Tool breakage", value: 34 },
  { name: "Material shortage", value: 128 },
  { name: "Setup over plan", value: 96 },
  { name: "Sensor fault", value: 21 },
  { name: "Coolant", value: 12 },
  { name: "Operator error", value: 47 },
  { name: "Power dip", value: 8 },
  { name: "Labeller", value: 6 },
  { name: "Conveyor", value: 5 },
  { name: "Small part", value: 3 },
];

export interface CellPoint {
  /** Hour of the day. */
  hour: number;
  /** The row: the machine. */
  machine: number;
  /** Overall equipment effectiveness in per cent; null = no measurement. */
  oee: number | null;
}

export const MACHINES = [
  "Press 1",
  "Press 2",
  "Mill 3",
  "Mill 4",
  "Furnace 1",
  "Furnace 2",
  "Assembly A",
  "Assembly B",
] as const;

/** Machine × hour. One machine has a bad hour, one whole hour is bad everywhere -
    only the difference makes the matrix worth reading. And a few cells are
    missing: a hole, not a zero. */
export function utilizationMatrix(seed: number): CellPoint[] {
  const r = random(seed);
  const cells: CellPoint[] = [];
  for (let m = 0; m < MACHINES.length; m++) {
    for (let h = 0; h < 24; h++) {
      let oee: number | null = 62 + r() * 32;
      if (m === 3 && h > 9 && h < 15) oee = 18 + r() * 12; // one machine
      if (h === 21) oee = 24 + r() * 10; // one hour, everywhere
      if (m === 6 && h > 1 && h < 5) oee = null; // no measurement
      cells.push({ hour: h, machine: m, oee });
    }
  }
  return cells;
}

export interface WeekPoint {
  t: number;
  output: number;
}

/** A working week: values only during the shifts. On a wall clock axis this chart
    would consist, for a good forty per cent, of flat lines over an empty hall. */
export function week(seed: number): WeekPoint[] {
  const r = random(seed);
  const points: WeekPoint[] = [];
  let value = 420;
  for (let day = 0; day < 5; day++) {
    for (let quarter = 0; quarter < 4 * 16; quarter++) {
      const hour = 6 + quarter / 4;
      value += (r() - 0.5) * 26;
      points.push({
        t: WEEK_START + day * DAY_MS + hour * HOUR_MS,
        output: value,
      });
    }
  }
  return points;
}

/** The working calendar to go with it: Monday to Friday, 6 to 22 o'clock. */
export const WEEK_CALENDAR = Array.from({ length: 5 }, (_, day) => ({
  from: WEEK_START + day * DAY_MS + 6 * HOUR_MS,
  to: WEEK_START + day * DAY_MS + 22 * HOUR_MS,
}));

/* ---------------------------------------------------------------------------
   Data of the kind pages.

   Area, Bar, Scatter and the tooltip each get a page with examples of their
   own, and each example shows one property. The data is plant data like the
   instruments' above, and for the same reason: a filled area of "Series A"
   does not say why it is filled down to 0, a power draw does.
   --------------------------------------------------------------------------- */

export interface PowerPoint {
  t: number;
  /** Power draw of the line in kW. */
  kw: number;
}

/** The power draw of one line over the early shift, every five minutes: the
    start-up, production, the break at half past nine and a setup towards the
    end. A draw has a natural 0, which is why the area is filled down to it. */
export function powerDraw(seed: number): PowerPoint[] {
  const r = random(seed);
  const start = WEEK_START + 6 * HOUR_MS;
  const points: PowerPoint[] = [];
  for (let i = 0; i <= 8 * 12; i++) {
    const hour = 6 + i / 12;
    let base = 182;
    if (hour < 6.5) base = 30 + (hour - 6) * 300; // start-up
    else if (hour >= 9.5 && hour < 10) base = 42; // break
    else if (hour >= 12 && hour < 12.75) base = 75; // setup
    points.push({ t: start + i * 5 * 60_000, kw: base + (r() - 0.5) * 18 });
  }
  return points;
}

export interface CorridorPoint {
  t: number;
  /** The corridor the recipe permits; null during the recipe change. */
  lower: number | null;
  upper: number | null;
  /** The measured temperature - always there, also where no corridor is. */
  temperature: number;
}

/** A hardening furnace over one shift. The corridor comes from the recipe;
    during the change from one recipe to the next there is none - a gap, not a
    corridor of zero width - and the temperature climbs to the new one. */
export function corridor(seed: number): CorridorPoint[] {
  const r = random(seed);
  const start = WEEK_START + 6 * HOUR_MS;
  const points: CorridorPoint[] = [];
  let temperature = 842;
  for (let i = 0; i <= 8 * 12; i++) {
    const hour = 6 + i / 12;
    const change = hour >= 10 && hour < 11;
    const target = hour < 10 ? 840 : 880;
    temperature += (target - temperature) * 0.12 + (r() - 0.5) * 6;
    points.push({
      t: start + i * 5 * 60_000,
      lower: change ? null : target - 12,
      upper: change ? null : target + 12,
      temperature,
    });
  }
  return points;
}

export interface ShiftScrap {
  /** The position on the x axis: the shift's index, named by the tickFormat. */
  shift: number;
  name: string;
  /** Scrap in pieces. */
  scrap: number;
}

/** Scrap per shift over three days. The night shift runs on fewer hands and
    scraps more - that is the one thing a reader is to find. */
export function scrapPerShift(seed: number): ShiftScrap[] {
  const r = random(seed);
  const days = ["Mon", "Tue", "Wed"];
  const shifts = ["early", "late", "night"];
  return days.flatMap((day, d) =>
    shifts.map((shift, s) => ({
      shift: d * 3 + s,
      name: `${day} ${shift}`,
      scrap: Math.round((s === 2 ? 38 : 18) + r() * 14),
    })),
  );
}

export interface DayOutput {
  /** The position on the x axis: the working day's index. */
  day: number;
  name: string;
  /** Pieces planned and made. */
  planned: number;
  actual: number;
}

/** Two working weeks of one line, planned against made. Some days above plan,
    some below - the deviation has both signs. */
export function planAndActual(seed: number): DayOutput[] {
  const r = random(seed);
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const points: DayOutput[] = [];
  for (let day = 0; day < 10; day++) {
    const planned = day % 5 === 4 ? 1600 : 2000;
    const date = new Date(WEEK_START + (day + 2 * Math.floor(day / 5)) * DAY_MS).getDate();
    points.push({
      day,
      name: `${names[day % 5]} ${date}`,
      planned,
      actual: Math.round(planned + (r() - 0.55) * 520),
    });
  }
  return points;
}

export interface DayDowntime {
  /** The position on the x axis: the working day's index. */
  day: number;
  name: string;
  /** Minutes stopped, per reason; null where the reason was not logged. */
  setup: number;
  material: number | null;
  breakdown: number;
}

/** Two working weeks of downtime by reason. On one Wednesday the material log
    was not kept - a gap, not a zero - and on the second Thursday a breakdown
    takes the day. */
export function downtimePerDay(seed: number): DayDowntime[] {
  const r = random(seed);
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  return Array.from({ length: 10 }, (_, day) => ({
    day,
    name: `${names[day % 5]} ${new Date(WEEK_START + (day + 2 * Math.floor(day / 5)) * DAY_MS).getDate()}`,
    setup: Math.round(40 + r() * 30),
    material: day === 2 ? null : Math.round(10 + r() * 45),
    breakdown: Math.round((day === 8 ? 150 : 5) + r() * 25),
  }));
}

export interface LineOutput {
  t: number;
  /** Pieces per hour of each of three lines. */
  line1: number;
  line2: number;
  line3: number;
}

/** A day of three lines, hour by hour from six to six. Line 3 runs the early
    and late shift only - at night it stands, and says 0, not nothing. */
export function outputPerLine(seed: number): LineOutput[] {
  const r = random(seed);
  return Array.from({ length: 25 }, (_, i) => {
    const hour = (6 + i) % 24;
    const night = hour >= 22 || hour < 6;
    return {
      t: WEEK_START + (6 + i) * HOUR_MS,
      line1: Math.round(120 + r() * 30),
      line2: Math.round((night ? 60 : 90) + r() * 25),
      line3: night ? 0 : Math.round(70 + r() * 30),
    };
  });
}

export interface SetPoint {
  t: number;
  /** The set point in °C; null while no recipe is loaded. */
  setPoint: number | null;
}

/** The set point of the hardening furnace above, logged only when it changes -
    a raise at 08:30, the recipe change from 10 to 11 o'clock without one, and a
    last entry at the end of the shift that closes the hold. */
export const setPoints: readonly SetPoint[] = [
  { t: WEEK_START + 6 * HOUR_MS, setPoint: 840 },
  { t: WEEK_START + 8.5 * HOUR_MS, setPoint: 845 },
  { t: WEEK_START + 10 * HOUR_MS, setPoint: null },
  { t: WEEK_START + 11 * HOUR_MS, setPoint: 880 },
  { t: WEEK_START + 14 * HOUR_MS, setPoint: 880 },
];

export interface ThicknessSample {
  t: number;
  /** Wall thickness in mm. */
  mm: number;
}

/** Wall thickness of a pipe, sampled by hand over a shift - whenever the
    inspector came by, not on a clock. Individual measurements, not a course:
    nothing was measured between two of them. */
export function wallThickness(seed: number, n: number): ThicknessSample[] {
  const r = random(seed);
  const points: ThicknessSample[] = [];
  let t = WEEK_START + 6 * HOUR_MS;
  for (let i = 0; i < n; i++) {
    t += (4 + r() * 16) * 60_000;
    points.push({ t, mm: 3.2 + (r() - 0.5) * 0.24 + (r() < 0.08 ? 0.18 : 0) });
  }
  return points;
}

export interface WeightSample {
  t: number;
  /** The set point of the fill weight in g. */
  setPoint: number;
  /** A sample within tolerance; null where it is an outlier. */
  sample: number | null;
  /** A sample outside tolerance; null where it is none. */
  outlier: number | null;
}

/** Fill weights of a filling line against their set point, which changes with
    the product at eleven. A sample further than the tolerance from its set
    point is an outlier - the two channels never both carry a value. */
export function fillWeights(seed: number, n: number, tolerance: number): WeightSample[] {
  const r = random(seed);
  const points: WeightSample[] = [];
  const start = WEEK_START + 6 * HOUR_MS;
  for (let i = 0; i < n; i++) {
    const t = start + (i * 8 * HOUR_MS) / (n - 1);
    const setPoint = t < WEEK_START + 11 * HOUR_MS ? 500 : 525;
    const value = setPoint + (r() - 0.5) * 16 + (r() < 0.06 ? (r() < 0.5 ? -1 : 1) * 14 : 0);
    const out = Math.abs(value - setPoint) > tolerance;
    points.push({ t, setPoint, sample: out ? null : value, outlier: out ? value : null });
  }
  return points;
}

export interface FurnacePoint {
  t: number;
  /** Temperatures of the two furnaces in °C. */
  f1: number;
  f2: number;
  /** The set point both run at. */
  setPoint: number;
}

/** Two furnaces at one set point over the early shift, every ten minutes -
    close enough that "which one is it" is a question the tooltip answers. */
export function furnaces(seed: number): FurnacePoint[] {
  const r = random(seed);
  const start = WEEK_START + 6 * HOUR_MS;
  const points: FurnacePoint[] = [];
  let f1 = 806;
  let f2 = 800;
  for (let i = 0; i <= 8 * 6; i++) {
    f1 += (808 - f1) * 0.15 + (r() - 0.45) * 5;
    f2 += (808 - f2) * 0.1 + (r() - 0.55) * 5;
    points.push({ t: start + i * 10 * 60_000, f1, f2, setPoint: 808 });
  }
  return points;
}

export interface HallPoint {
  t: number;
  /** Hall temperature in °C. */
  temperature: number;
}

/** A day of hall temperature from Monday noon, every quarter hour - warm while
    the ovens run, cooling through the night. Crosses midnight on purpose. */
export function hallTemperature(seed: number): HallPoint[] {
  const r = random(seed);
  const start = WEEK_START + 12 * HOUR_MS;
  const points: HallPoint[] = [];
  let temperature = 24;
  for (let i = 0; i <= 24 * 4; i++) {
    const t = start + i * 15 * 60_000;
    const hour = new Date(t).getHours();
    const target = hour >= 6 && hour < 22 ? 25 : 18;
    temperature += (target - temperature) * 0.08 + (r() - 0.5) * 0.4;
    points.push({ t, temperature });
  }
  return points;
}

export interface KilnPoint {
  t: number;
  /** Kiln temperature in °C. */
  temperature: number;
  /** Gas flow in m³/h. */
  gas: number;
  /** Draught in Pa - the kiln runs below the hall's pressure. */
  draught: number;
  /** Flue gas temperature in °C: the harder the kiln fires, the hotter it
      leaves. */
  flue: number;
}

/** A week of a kiln from Monday midnight, one reading every `step`
    milliseconds: 850 °C while the shifts run on weekdays, held at 600 °C at
    night and over the weekend, the gas following the heat it has to make. On
    Wednesday at 14:00 the burner trips for twenty minutes. The week has no
    clock change, so the hour is counted rather than asked of a Date - a week
    of seconds is 604,800 of them. */
export function kiln(seed: number, step: number): KilnPoint[] {
  const r = random(seed);
  const n = Math.floor((7 * DAY_MS) / step);
  const points = new Array<KilnPoint>(n);
  // Ten minutes to answer: the same kiln at any step.
  const k = Math.min(1, step / 600_000);
  let temperature = 600;
  let gas = 22;
  for (let i = 0; i < n; i++) {
    const offset = i * step;
    const day = Math.floor(offset / DAY_MS);
    const minute = Math.floor((offset % DAY_MS) / 60_000);
    const running = day < 5 && minute >= 6 * 60 && minute < 22 * 60;
    const tripped = day === 2 && minute >= 14 * 60 && minute < 14 * 60 + 20;
    const target = running ? 850 : 600;
    // What holds the temperature; above it the kiln heats, below it cools.
    const holding = running ? 38 : 22;
    const demand = tripped ? 0 : Math.max(0, holding + (target - temperature) * 0.3);
    gas += (demand - gas) * Math.min(1, k * 4);
    temperature += (gas - holding) * k;
    const shown = temperature + (r() - 0.5) * 4;
    const reading = Math.max(0, gas + (r() - 0.5) * 1.5);
    points[i] = {
      t: WEEK_START + offset,
      temperature: shown,
      gas: reading,
      draught: -8 - gas * 0.12 + (r() - 0.5) * 1.2,
      flue: 250 + reading * 3,
    };
  }
  return points;
}

/* ---------------------------------------------------------------------------
   The series the examples show.

   One seed per series, not one per place it is drawn: several examples share
   one of them - `basicData` is the course in three.
   --------------------------------------------------------------------------- */

export const basicData = series(42, 120);
export const multiData = series(7, 90, true);
export const configData = series(1312, 24);
export const axesData = dualSeries(99, 60);
export const mixedData = mixed(2026, 14);
export const shiftData = shift(4711, 64);
export const measurementData = measurements(815, 90);
export const matrixData = utilizationMatrix(23);
export const weekData = week(1963);
export const powerData = powerDraw(612);
export const corridorData = corridor(1400);
export const scrapData = scrapPerShift(333);
export const outputData = planAndActual(1017);
export const thicknessData = wallThickness(88, 36);
export const weightData = fillWeights(4040, 97, 9);
export const furnaceData = furnaces(2718);
export const hallData = hallTemperature(1603);
export const kilnData = kiln(2024, 60_000);
export const downtimeData = downtimePerDay(1204);
export const lineOutputData = outputPerLine(906);
