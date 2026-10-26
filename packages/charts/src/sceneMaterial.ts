/* Materialisation: the categories and instants the rows bring,
   the channels every series is read into, and the stacks summed over them.
   Functions over the scene. */

import { measureStep } from "./bars";
import { measureSpacing } from "./cells";
import { DEV, asRows, warnOnce } from "./dev";
import {
  categoriesOf,
  categoryPlaces,
  firstKind,
  firstUnsortedIndex,
  instantOf,
  materializeSeries,
  visibleExtent,
  firstDisorderedBox,
} from "./materialize";
import type { ChartScene } from "./scene";
import { checkValues } from "./sceneChecks";
import { categoriesFrom, laneOf, forget, sameNames, boxChannelsOf, stackOf, normalizes, valueChannelOf, baselineOf } from "./sceneConfig";
import { type SeriesEntry } from "./sceneModel";
import { isHidden } from "./sceneView";
import { stackSeries, type Stacked } from "./stack";
import { medianStep } from "./state";
import type { AxisConfig, MaterializedSeries, SeriesConfig } from "./types";














/** A date with a time, as an API writes an instant. A month or a day alone
    is as likely a category. */
export const ISO_WITH_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

/** The rows of each series, in the series' order. */
export function rowsOf(s: ChartScene, entries: readonly SeriesEntry[]): (readonly unknown[])[] {
  return entries.map((e) => rowsOfSeries(s, e.config));
}

/** The rows of one series: its own `data` as an array (anything else is no rows, and warns), or the chart's. */
export function rowsOfSeries(s: ChartScene, config: SeriesConfig): readonly unknown[] {
  return config.data === undefined || config.data === null ? s.data : asRows(config.data, `the data of the series "${config.name}"`);
}

/** Reads the categories of every axis anew. Where an axis' list changed,
    every series on it lies somewhere else and is materialised again. */
export function readCategories(s: ChartScene): void {
  const all = s.seriesInOrder();
  const live = new Set<string>();
  for (const { config: axis } of s.axes.values()) {
    const alongX = axis.orientation === "x";
    const key = `${axis.orientation}:${axis.id}`;
    live.add(key);
    const bound = all.filter((e) => (alongX ? e.config.xAxisId : e.config.yAxisId) === axis.id);
    // The caller's list is the order and the extent; without one, what the
    // rows bring along x, and along y what stands on the axis.
    // An empty list is a list: nothing has a place then.
    const names = axis.categories ?? (alongX ? broughtAlongX(s, axis, bound) : broughtAlongY(s, bound));
    if (alongX) readDated(s, axis, bound, names === null);
    const previous = s.categories.get(key);
    if (names === null ? previous === undefined : previous !== undefined && sameNames(previous.names, names)) continue;
    if (names === null) s.categories.delete(key);
    else s.categories.set(key, categoriesFrom(names, !alongX));
    for (const entry of bound) forget(entry);
  }
  for (const key of [...s.categories.keys()]) if (!live.has(key)) s.categories.delete(key);
  for (const id of [...s.dated]) if (!live.has(`x:${id}`)) s.dated.delete(id);
}

export function broughtAlongX(s: ChartScene, axis: AxisConfig, bound: readonly SeriesEntry[]): string[] | null {
  const accessor = axis.accessor;
  // On an axis that says `time` a string is an instant, never a category.
  if (accessor === undefined || saysTime(s, axis)) return null;
  const names = categoriesOf(rowsOf(s, bound), accessor);
  if (DEV && names !== null && names.every((name) => ISO_WITH_TIME.test(name) && !Number.isNaN(Date.parse(name)))) {
    warnOnce(
      `category-instants-${axis.id}`,
      `The x axis "${axis.id}" reads its rows' strings as categories, and every one is an ISO 8601 instant. ` +
        "If they are moments, say \`time\` on the axis: a string is an instant only there (ADR-0052).",
    );
  }
  return names;
}

/** Whether an x axis' rows bring a `Date` first: it stands in time then.
    The series on it are read anew where that changed. */
export function readDated(s: ChartScene, axis: AxisConfig, bound: readonly SeriesEntry[], numeric: boolean): void {
  const accessor = axis.accessor;
  const dated =
    numeric &&
    accessor !== undefined &&
    !saysTime(s, axis) &&
    firstKind(rowsOf(s, bound), accessor) === "date";
  if (dated === s.dated.has(axis.id)) return;
  if (dated) s.dated.add(axis.id);
  else s.dated.delete(axis.id);
  for (const entry of bound) forget(entry);
}

export function saysTime(s: ChartScene, axis: AxisConfig): boolean {
  return axis.time === true || (axis.calendar !== undefined && axis.calendar.length > 0);
}

/** An axis in time: one that says so, or whose rows bring a `Date`. */
export function inTime(s: ChartScene, axis: AxisConfig): boolean {
  return saysTime(s, axis) || (axis.orientation === "x" && s.dated.has(axis.id));
}

/** Where a row lies on a numeric or a time axis. Numbers go as they come -
    a week of seconds pays nothing; a series that brings a `Date` or, on a
    time axis, a string has each read as its instant (ADR-0052). */
export function placeOnX(s: ChartScene, config: SeriesConfig, data: readonly unknown[], xAxis: AxisConfig): (d: unknown, index: number) => number {
  const accessor = xAxis.accessor as (d: unknown, index: number) => unknown;
  const kind = inTime(s, xAxis) ? firstKind([data], accessor) : "number";
  if (kind === "number" || kind === null) return accessor as (d: unknown, index: number) => number;
  if (DEV && kind === "string") {
    const name = config.name ?? "?";
    const index = data.findIndex((d, i) => {
      const v = accessor(d, i);
      return typeof v === "string" && v !== "" && Number.isNaN(Date.parse(v));
    });
    if (index >= 0) {
      warnOnce(
        `instant-unread-${xAxis.id}-${name}`,
        `Series "${name}": row ${index} holds "${String(accessor(data[index], index))}" on the time axis "${xAxis.id}", ` +
          "which is no ISO 8601 instant. It has no place and is not drawn (ADR-0052).",
      );
    }
  }
  return (d, i) => instantOf(accessor(d, i));
}

/** A y axis reads no value (ADR-0048): its categories are the lanes its
    state bands name and the rows its matrices read, in the series' order. */
export function broughtAlongY(s: ChartScene, bound: readonly SeriesEntry[]): string[] | null {
  const names = new Set<string>();
  for (const { config } of bound) {
    if (config.kind === "state" && config.lane !== undefined) names.add(config.lane);
    if (config.kind !== "matrix") continue;
    for (const name of categoriesOf([rowsOfSeries(s, config)], config.accessor) ?? []) names.add(name);
  }
  return names.size === 0 ? null : [...names];
}

export function materialize(s: ChartScene): void {
  const start = typeof performance === "undefined" ? 0 : performance.now();
  let points = 0;
  readCategories(s);
  for (const entry of s.series.values()) {
    if (entry.materialized !== null) {
      points += entry.materialized.length;
      continue;
    }
    const config = entry.config;
    const data = rowsOfSeries(s, config);
    const xAxis = s.findAxisConfig("x", config.xAxisId);
    if (xAxis?.accessor === undefined) continue; // validate() reports a missing axis in DEV
    const categories = s.categoriesAt("x", xAxis.id);
    // A category's place is a number like any other x from here on.
    const places = categories === undefined ? null : categoryPlaces(data, xAxis.accessor, categories.place);
    entry.rows = places?.rows ?? null;
    // Along y: a matrix' row is named by the data where its y axis has
    // categories, a state band lies in its lane - and a value of any other
    // kind is a number, which is no place among categories.
    const alongY = s.categoriesAt("y", config.yAxisId);
    const named = config.kind === "matrix" ? alongY : undefined;
    const lane = laneOf(config);
    // A lane the axis does not know is no place either: the band is not
    // drawn, hit or walked.
    const unlisted = lane !== undefined && alongY?.place.has(lane) !== true;
    const misplaced = unlisted || (alongY !== undefined && config.kind !== "matrix" && config.kind !== "state");
    const rowOf = config.accessor as (d: unknown, index: number) => unknown;
    if (DEV) {
      checkValues(s, config, data, xAxis, xAxis.accessor);
      if (config.kind === "matrix") checkValues(s, config, data, { orientation: "y", id: config.yAxisId }, rowOf);
      if (misplaced && !unlisted) {
        warnOnce(
          `axis-kind-y-${config.yAxisId}-${config.name ?? "?"}`,
          `Series "${config.name ?? "?"}" brings numbers to the y axis "${config.yAxisId}", which reads categories. ` +
            "One axis has one kind: a number is no place there and is not drawn (ADR-0052).",
        );
      }
      if (unlisted) {
        warnOnce(
          `lane-unlisted-${config.yAxisId}-${lane}`,
          `StateBand "${config.name ?? "?"}" names the lane "${lane}", which the y axis "${config.yAxisId}" does not list in \`categories\`. ` +
            "It has no place and is not drawn (ADR-0052).",
        );
      }
    }
    const material = materializeSeries(
      data,
      places === null ? placeOnX(s, config, data, xAxis) : (_d, i) => places.x[i] as number,
      misplaced
        ? () => undefined
        : named === undefined
          ? config.accessor
          : (d, i) => {
              const v = rowOf(d, i);
              return typeof v === "string" ? named.place.get(v) : undefined;
            },
      baselineOf(config),
      {
        value: valueChannelOf(config),
        box: boxChannelsOf(config),
        rows: entry.rows,
        xMap: s.mapFor(xAxis),
        xGap: s.gapFor(xAxis),
      },
    );
    entry.materialized = material.series;
    entry.own = stackOf(config) === undefined ? null : material.series.y;
    entry.stacked = null;
    points += material.series.length;
    if (config.kind === "bar" || config.kind === "box") {
      // Neighbouring categories lie one apart, a lone one too.
      const step = categories === undefined ? measureStep(material.series.x, material.series.length) : 1;
      entry.step = step;
      // A bar is centred on its x value, so half the step belongs to the left
      // and to the right of the extent - otherwise the axis cuts into the first
      // and the last bar (ADR-0002).
      const half = step / 2;
      entry.extent = {
        ...material.extent,
        xMin: material.extent.xMin - half,
        xMax: material.extent.xMax + half,
      };
    } else if (config.kind === "matrix") {
      // As with the bar, only in both directions: a cell is centred on its pair
      // of values, so half its edge belongs outwards - otherwise the axis cuts
      // into the border cells (ADR-0002).
      //
      // What is stored is the MEASURED spacing, even when it is zero. The
      // replacement only comes at drawing time out of the axis domain: with a
      // single row the series span is zero as well, and out of zero and zero no
      // visible cell arises.
      // Neighbouring categories lie one apart, along either axis.
      const dx = categories === undefined ? measureSpacing(material.series.x, material.series.length) : 1;
      const dy = named === undefined ? measureSpacing(material.series.y, material.series.length) : 1;
      entry.step = dx;
      entry.cellHeight = dy;
      entry.extent = {
        xMin: material.extent.xMin - dx / 2,
        xMax: material.extent.xMax + dx / 2,
        yMin: material.extent.yMin - dy / 2,
        yMax: material.extent.yMax + dy / 2,
      };
    } else if (config.kind === "state") {
      // A lane says where something is drawn, not what the data span. A state
      // band therefore contributes no y extent: otherwise the state code 3
      // would pull the axis onto three lanes.
      // Its x extent reaches one step past its last point: there its last
      // state ends where the band reports last (lastSegmentEnd), and a
      // `domain="data"` would cut it to nothing.
      const step = medianStep(material.series.x, material.series.length);
      entry.step = step;
      entry.extent = {
        ...material.extent,
        xMax: material.extent.xMax + step,
        yMin: Number.POSITIVE_INFINITY,
        yMax: Number.NEGATIVE_INFINITY,
      };
    } else {
      entry.step = null;
      entry.extent = material.extent;
    }

    // Once per materialisation, which is once per change of data - for every
    // series whose hit is a binary search. A matrix runs row-major and hits
    // linearly: its x values are unsorted by right.
    if (DEV && config.kind === "box") {
      const index = firstDisorderedBox(material.series);
      if (index >= 0) {
        const name = config.name ?? "?";
        warnOnce(
          `box-order-${entry.order}`,
          `BoxPlot "${name}": the numbers at index ${index} are out of order - expected lowerWhisker ≤ lowerQuartile ≤ median ≤ upperQuartile ≤ upperWhisker. It is drawn as given.`,
        );
      }
    }
    if (DEV && config.kind !== "matrix") {
      const index = firstUnsortedIndex(material.series.x, material.series.length);
      if (index >= 0) {
        const name = config.name ?? "?";
        warnOnce(
          `x-unsorted-${name}`,
          `Series "${name}": x values are not sorted ascending (index ${index}). ` +
            "Binary search and path building assume sortedness; there is no automatic sorting (R-2.6).",
        );
      }
    }
  }
  stackAll(s);
  s.materialsDirty = false;
  s.perf.materializeMs =
    (typeof performance === "undefined" ? 0 : performance.now()) - start;
  s.perf.points = points;
}

/** Sums every stack anew from its members' own values,
    once per materialisation: a member that changes moves every one above
    it. The stack is summed before anything is drawn, so an area's
    downsampling thins the stacked edges - each member keeps its own
    extremes per pixel column, and inside one column the edge of a member
    and the foot of the one above may part by a stroke's width. */
export function stackAll(s: ChartScene): void {
  const stacks = new Map<string, SeriesEntry[]>();
  for (const entry of s.seriesInOrder()) {
    const key = stackOf(entry.config);
    if (key === undefined || isHidden(s, entry.config) || entry.materialized === null || entry.own === null) continue;
    const members = stacks.get(key);
    if (members === undefined) stacks.set(key, [entry]);
    else members.push(entry);
  }
  for (const members of stacks.values()) {
    // Any member normalises the stack, a hidden one too: the axis reads in
    // percent by the same rule (yTickFormat), and the two must not part.
    const key = stackOf((members[0] as SeriesEntry).config);
    const normalize = [...s.series.values()].some((e) => stackOf(e.config) === key && normalizes(e.config));
    const sums = stackSeries(
      members.map((e) => ({ ...(e.materialized as MaterializedSeries), y: e.own as Float64Array })),
      normalize,
    );
    members.forEach((entry, k) => {
      const sum = sums[k] as Stacked;
      const stacked = { ...(entry.materialized as MaterializedSeries), y: sum.top, y0: sum.bottom };
      entry.materialized = stacked;
      entry.stacked = { value: sum.value, total: sum.total, normalize };
      // The y extent is the stack's now, from its foot to its top.
      const [yMin, yMax] = visibleExtent(stacked, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
      if (entry.extent !== null) entry.extent = { ...entry.extent, yMin, yMax };
    });
  }
}
