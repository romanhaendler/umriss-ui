/* Pure helpers over series and axis configurations: the field-wise equality
   that spares a re-materialisation on every render, what a kind has for
   baseline, stack and channels, and the category maps. */

import { type Baseline, type ExtraChannels, BOX_KEYS, BOX_EXTRA_KEYS } from "./materialize";
import { type SeriesEntry, type Categories } from "./sceneModel";
import type {
  ValueFunction,
  AreaSeriesConfig,
  AxisConfig,
  MatrixColoring,
  MatrixSeriesConfig,
  StateSeriesConfig,
  BarSeriesConfig,
  BoxChannels,
  BoxSeriesConfig,
  LineSeriesConfig,
  ScatterSeriesConfig,
  SeriesConfig,
  TooltipPoint,
} from "./types";
import { DEV, probeStale } from "./dev";
import { isFieldReader } from "./value";
import { optionsEqual } from "./format";





export function categoriesFrom(names: readonly string[], topFirst: boolean): Categories {
  const last = names.length - 1;
  // Along y the first category stands at the top, as the first row of a list
  // does: it takes the highest place. The same step turns a place back.
  const turn = (i: number) => (topFirst ? last - i : i);
  return {
    names,
    place: new Map(names.map((name, i) => [name, turn(i)])),
    ticks: names.map((_, i) => i),
    format: (v) => names[turn(Math.min(Math.max(Math.round(v), 0), last))] ?? "",
  };
}

/** How much of its category's step a named lane takes: what a bar takes of
    its own by default. */
export const LANE_WIDTH = 0.8;

export const laneOf = (config: SeriesConfig): string | undefined => (config.kind === "state" ? config.lane : undefined);

/** What is written for a place: its category, or the caller's label for it. */
export function labelled(categories: Categories, label: AxisConfig["categoryLabel"]): (v: number) => string {
  if (label === undefined) return categories.format;
  return (v) => (categories.names.length === 0 ? "" : label(categories.format(v)));
}

/** Takes back everything materialisation gave a series. */
export function forget(entry: SeriesEntry): void {
  entry.materialized = null;
  entry.rows = null;
  entry.extent = null;
  entry.step = null;
  entry.cellHeight = null;
  entry.buckets = null;
}

export function fnEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "function" || typeof b !== "function") return false;
  // A field's reader is one per name: identity is the name (value.ts).
  if (isFieldReader(a) || isFieldReader(b)) return false;
  const source = String(a);
  // Every native and every bound function reads "[native code]" - a bound
  // `Intl.NumberFormat#format` among them. Their text says nothing; identity
  // does.
  if (source.includes("[native code]")) return false;
  return source === String(b);
}

/** A format: functions by their text, options by value. */
export function formatEqual(a: unknown, b: unknown): boolean {
  return fnEqual(a, b) || optionsEqual(a, b);
}

export function sameNames(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((name, i) => name === b[i]);
}

/** A list of categories by its names: an inline array is new on every render. */
export function namesEqual(a: readonly string[] | undefined, b: readonly string[] | undefined): boolean {
  if (a === b) return true;
  return a !== undefined && b !== undefined && sameNames(a, b);
}

/** A calendar by its intervals: an inline array is new on every render, and
    each new one would map every point again. */
export function calendarEqual(
  a: AxisConfig["calendar"],
  b: AxisConfig["calendar"],
): boolean {
  if (a === b) return true;
  if (a === undefined || b === undefined || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i]?.from !== b[i]?.from || a[i]?.to !== b[i]?.to) return false;
  }
  return true;
}

/** A state band and a matrix colour themselves - by state, by cell - and take
    no place in the palette: otherwise the line after them would come out in a
    later colour than the first. */
export function takesPalette(config: SeriesConfig): boolean {
  return config.kind !== "state" && config.kind !== "matrix";
}

export function listEqual(a: readonly number[] | undefined, b: readonly number[] | undefined): boolean {
  if (a === b) return true;
  if (a === undefined || b === undefined) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** Everything materialisation reads: the y accessor, the data reference, the
    baseline and the series kind - the kind, because it decides about the
    baseline and the step. If any of that changes, the channels are stale and
    have to come into being anew; a field comparison alone is not enough. */
export function materialEqual(previous: SeriesConfig, next: SeriesConfig, rows?: unknown, order?: number): boolean {
  const equal = (
    previous.kind === next.kind &&
    stackOf(previous) === stackOf(next) &&
    normalizes(previous) === normalizes(next) &&
    fnEqual(previous.accessor, next.accessor) &&
    previous.data === next.data &&
    fnEqual(baselineOf(previous), baselineOf(next)) &&
    fnEqual(valueChannelOf(previous), valueChannelOf(next)) &&
    boxChannelsEqual(boxChannelsOf(previous), boxChannelsOf(next))
  );
  // Held by their text: the old functions stay, so a changed outer value shows only in the probe.
  if (equal && DEV) {
    const a = boxChannelsOf(previous);
    const b = boxChannelsOf(next);
    const pairs: Array<[unknown, unknown]> = [
      [previous.accessor, next.accessor],
      [baselineOf(previous), baselineOf(next)],
      [valueChannelOf(previous), valueChannelOf(next)],
      ...(a === undefined || b === undefined
        ? []
        : [...BOX_KEYS, ...BOX_EXTRA_KEYS].map((key): [unknown, unknown] => [a[key], b[key]])),
    ];
    for (const [held, kept] of pairs) probeStale(next.name, held, kept, rows, order);
  }
  return equal;
}

/** A box's further accessors (ADR-0011); undefined for every other kind. */
export function boxChannelsOf(config: SeriesConfig): ExtraChannels<unknown>["box"] {
  if (config.kind !== "box") return undefined;
  const { lowerQuartile, upperQuartile, lowerWhisker, upperWhisker, outliers, mean, count } = config;
  // A notch takes both bounds or neither: half of one is not drawn wrong but
  // not drawn, and validate() says so.
  const notch = config.notchLower !== undefined && config.notchUpper !== undefined;
  return {
    lowerQuartile,
    upperQuartile,
    lowerWhisker,
    upperWhisker,
    outliers,
    mean,
    count,
    notchLower: notch ? config.notchLower : undefined,
    notchUpper: notch ? config.notchUpper : undefined,
  };
}

export function boxChannelsEqual(a: ExtraChannels<unknown>["box"], b: ExtraChannels<unknown>["box"]): boolean {
  if (a === undefined || b === undefined) return a === b;
  return [...BOX_KEYS, ...BOX_EXTRA_KEYS, "outliers" as const].every((key) => fnEqual(a[key], b[key]));
}

/** A box's numbers at one point. */
export function boxAt(box: BoxChannels, i: number): NonNullable<TooltipPoint["box"]> {
  const out = {} as NonNullable<TooltipPoint["box"]>;
  for (const key of BOX_KEYS) out[key] = box[key][i] as number;
  for (const key of BOX_EXTRA_KEYS) {
    const channel = box[key];
    if (channel !== null) out[key] = channel[i] as number;
  }
  const { outliers, outlierOffsets } = box;
  if (outliers !== null && outlierOffsets !== null) {
    out.outliers = [...outliers.subarray(outlierOffsets[i], outlierOffsets[i + 1])];
  }
  return out;
}

/** A bar's or a box's width fraction - the two share one group (ADR-0002);
    0 for every other kind. */
export function widthOf(config: SeriesConfig): number {
  return config.kind === "bar" ? config.barWidth : config.kind === "box" ? config.boxWidth : 0;
}

/** The stack a series stands in, as a key: the same id on the same x and y
    axis; undefined where it stands alone. */
export function stackOf(config: SeriesConfig): string | undefined {
  if ((config.kind !== "bar" && config.kind !== "area") || config.stack === undefined) return undefined;
  return `${config.xAxisId}\n${config.yAxisId}\n${config.stack}`;
}

export function normalizes(config: SeriesConfig): boolean {
  return (config.kind === "bar" || config.kind === "area") && config.stack !== undefined && config.normalize === true;
}

/** The value channel, where the kind has one (ADR-0011). */
export function valueChannelOf(config: SeriesConfig): ValueFunction<unknown> | undefined {
  return config.kind === "matrix" ? config.level : undefined;
}

/** Baseline per series kind; undefined where the kind has none. It enters the
    extent of the y axis (CONTEXT.md: Baseline). */
export function baselineOf(config: SeriesConfig): Baseline<unknown> | undefined {
  switch (config.kind) {
    case "line":
    case "scatter":
    case "box":
      // A box floats where its numbers are; it has no foot at 0.
      return undefined;
    case "area":
      // In a stack the stack below is the foot, not a baseline of its own.
      return config.stack === undefined ? (config.baseline ?? 0) : 0;
    case "bar":
      return 0;
    case "state":
    case "matrix":
      // Neither has a foot: a state is not a height, a cell not a column.
      return undefined;
  }
}

/** Field comparison of the kind-own properties; the base is compared by
    updateSeries. A new series kind gets an arm here - the compiler demands it. */
export function ownFieldsEqual(previous: SeriesConfig, next: SeriesConfig): boolean {
  if (previous.kind !== next.kind) return false;
  switch (next.kind) {
    case "line": {
      const a = previous as LineSeriesConfig;
      return (
        a.strokeWidth === next.strokeWidth &&
        a.markers === next.markers &&
        a.step === next.step &&
        listEqual(a.dash as number[] | undefined, next.dash as number[] | undefined)
      );
    }
    case "area": {
      const a = previous as AreaSeriesConfig;
      return (
        fnEqual(a.baseline, next.baseline) &&
        a.fillOpacity === next.fillOpacity &&
        a.strokeWidth === next.strokeWidth &&
        listEqual(a.dash as number[] | undefined, next.dash as number[] | undefined)
      );
    }
    case "bar": {
      const a = previous as BarSeriesConfig;
      return a.barWidth === next.barWidth;
    }
    case "box": {
      const a = previous as BoxSeriesConfig;
      return a.boxWidth === next.boxWidth;
    }
    case "scatter": {
      const a = previous as ScatterSeriesConfig;
      return a.radius === next.radius;
    }
    case "state": {
      const a = previous as StateSeriesConfig;
      return (
        a.lane === next.lane &&
        a.laneFrom === next.laneFrom &&
        a.laneTo === next.laneTo &&
        statesEqual(a.states, next.states)
      );
    }
    case "matrix": {
      const a = previous as MatrixSeriesConfig;
      return coloringEqual(a.coloring, next.coloring);
    }
  }
}

export function statesEqual(
  a: readonly { label: string; color: string }[],
  b: readonly { label: string; color: string }[],
): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i]?.label !== b[i]?.label || a[i]?.color !== b[i]?.color) return false;
  }
  return true;
}

export function coloringEqual(a: MatrixColoring, b: MatrixColoring): boolean {
  if (a === b) return true;
  if (a.kind !== b.kind) return false;
  if (a.kind === "assessment" && b.kind === "assessment") return a.limits === b.limits;
  if (a.kind === "gradient" && b.kind === "gradient") {
    return (
      listEqual(a.stops as unknown as number[], b.stops as unknown as number[]) &&
      listEqual(a.range as number[] | undefined, b.range as number[] | undefined)
    );
  }
  return false;
}

export function domainEqual(
  a: AxisConfig["domain"],
  b: AxisConfig["domain"],
): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) return a[0] === b[0] && a[1] === b[1];
  return false;
}
