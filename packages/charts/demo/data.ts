/* Deterministic, generic number series (R-6.2).
   Seed-based, so that screenshots are stable; deliberately without any subject
   matter. */

export interface Point {
  t: number;
  a: number;
  b: number;
  c: number;
  d: number | null;
}

/** A small LCG - reproducible across runs and platforms. */
export function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
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
   Data of the operation instruments.

   Up to here every series in this file is deliberately without subject matter
   (R-6.2): a curve is a curve, and "Series A" says enough. From here on that no
   longer works. A state band without states, a Pareto without fault reasons and a
   control chart without a measurement series show nothing - with these instruments
   the meaning IS the subject. What remains is the other half of the rule, and that
   is the important one: everything here is seed-based and therefore identical
   across runs and platforms.
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

/** The operating calendar to go with it: Monday to Friday, 6 to 22 o'clock. */
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

/* ---------------------------------------------------------------------------
   The series the examples show.

   They stand here and not in the example files because several examples share
   one of them - `basicData` is the course in three examples - and because R-6.2
   wants one seed per series, not one per place it is drawn. An example imports
   what it needs; nobody inlines a second generator.
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
