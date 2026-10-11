/* Development-time checks: a registration or a materialised
   series that cannot be drawn as it was given is said once, in development,
   and costs nothing in production. Functions over the scene. */

import { DEV, invariant, warnOnce } from "./dev";
import { firstKind, isCategory, isPosition } from "./materialize";
import type { ChartScene } from "./scene";
import { widthOf } from "./sceneConfig";
import type { AxisOrientation, SeriesConfig } from "./types";
import { saysTime } from "./sceneMaterial";







/** Called from the Chart after the child effects; DEV only. */
export function validate(s: ChartScene): void {
  if (!DEV) return;
  const seen = new Set<string>();
  for (const { config } of s.axesInOrder()) {
    const key = `${config.orientation}:${config.id}`;
    const name = config.orientation === "x" ? "XAxis" : "YAxis";
    invariant(
      !seen.has(key),
      `Two <${name}> with the same id "${config.id}". A second ${name} needs an own id (R-4.12).`,
    );
    seen.add(key);
  }
  const bound = new Set<string>();
  for (const { config } of s.series.values()) {
    invariant(
      seen.has(`x:${config.xAxisId}`),
      `Series "${config.name ?? "?"}" refers to the unknown x axis "${config.xAxisId}" (R-4.12).`,
    );
    invariant(
      seen.has(`y:${config.yAxisId}`),
      `Series "${config.name ?? "?"}" refers to the unknown y axis "${config.yAxisId}" (R-4.12).`,
    );
    bound.add(`x:${config.xAxisId}`);
    bound.add(`y:${config.yAxisId}`);
  }
  for (const { config } of s.limits.values()) {
    invariant(
      seen.has(`${config.orientation}:${s.limitAxisId(config)}`),
      `A limit refers to the unknown ${config.orientation} axis "${s.limitAxisId(config)}" (R-4.12).`,
    );
  }
  for (const key of seen) {
    if (!bound.has(key) && s.series.size > 0) {
      warnOnce(
        `axis-without-series-${key}`,
        `Axis "${key}" has no bound series; it is drawn with the domain [0, 1] (R-4.13).`,
      );
    }
  }
  // A bar group calculates with one width fraction - that of the first member.
  // Boxes stand in the same group.
  const fractions = new Map<string, number>();
  for (const { config } of s.seriesInOrder()) {
    if (config.kind !== "bar" && config.kind !== "box") continue;
    const first = fractions.get(config.xAxisId);
    if (first === undefined) {
      fractions.set(config.xAxisId, widthOf(config));
    } else if (first !== widthOf(config)) {
      warnOnce(
        `bar-width-${config.xAxisId}`,
        `Bars and boxes on the x axis "${config.xAxisId}" give different barWidth or boxWidth. ` +
          `A group shares one width fraction; that of the first (${first}) applies (ADR-0002).`,
      );
    }
  }
  // A notch needs both bounds; one alone is not drawn.
  for (const { order, config } of s.series.values()) {
    if (config.kind !== "box" || (config.notchLower === undefined) === (config.notchUpper === undefined)) continue;
    const name = config.name ?? "?";
    warnOnce(
      `box-notch-${order}`,
      `BoxPlot "${name}" gives only one of notchLower and notchUpper. A notch needs both bounds; none is drawn.`,
    );
  }
  let gridAxes = 0;
  for (const axis of s.axesInOrder()) if (axis.config.grid === true) gridAxes++;
  if (gridAxes > 1) {
    warnOnce(
      "multiple-grids",
      "More than one axis draws grid. Unaligned grids compete visually; " +
        "`alignTicks` puts a further y axis' ticks on the first one's grid instead (R-4.15).",
    );
  }
}

/** One axis has one kind (ADR-0052): DEV names the series that brings
    another - a category among numbers, a number or a `Date` among
    categories -, the one that brings a category its axis does not list,
    and the one that brings a category twice. */
export function checkValues(
  s: ChartScene,
  config: SeriesConfig,
  data: readonly unknown[],
  where: { orientation: AxisOrientation; id: string },
  accessor: (d: unknown, index: number) => unknown,
): void {
  const name = config.name ?? "?";
  const axis = `${where.orientation} axis "${where.id}"`;
  const key = `${where.orientation}-${where.id}-${name}`;
  const other = (what: string, reads: string): void =>
    warnOnce(
      `axis-kind-${key}`,
      `Series "${name}" brings ${what} to the ${axis}, which reads ${reads}. ` +
        "One axis has one kind: it is no place there and is not drawn (ADR-0052).",
    );
  const categories = s.categoriesAt(where.orientation, where.id);
  if (categories === undefined) {
    const inTime = where.orientation === "x" && s.dated.has(where.id);
    const xAxis = where.orientation === "x" ? s.findAxisConfig("x", where.id) : null;
    if (inTime || (xAxis !== null && saysTime(s, xAxis))) {
      // A string is an instant here; one that is none is named where it is
      // read (placeOnX). What is left to say: a series that begins with a
      // number is read as numbers alone - the fast path - and loses the rest.
      if (firstKind([data], accessor) !== "number") return;
      const index = data.findIndex((d, i) => {
        const v = accessor(d, i);
        return isCategory(v) || v instanceof Date;
      });
      if (index >= 0) {
        warnOnce(
          `instant-mixed-${key}`,
          `Series "${name}": row ${index} holds a date or a string on the time axis "${where.id}" after numbers. ` +
            "A series that begins with milliseconds is read as milliseconds: that row has no place and is not drawn (ADR-0052).",
        );
      }
      return;
    }
    // A numeric axis: the first value that is a place tells the series' kind.
    for (let i = 0; i < data.length; i++) {
      const v = accessor(data[i], i);
      if (isPosition(v)) return;
      if (isCategory(v)) return other("a category", "numbers");
      if (v instanceof Date) return other("a Date", "numbers");
    }
    return;
  }
  // A matrix brings its column once per row and its row once per column.
  const once = config.kind !== "matrix";
  const seen = new Set<string>();
  for (let i = 0; i < data.length; i++) {
    const v = accessor(data[i], i);
    if (isPosition(v)) other("a number", "categories");
    else if (v instanceof Date) other("a Date", "categories");
    if (!isCategory(v)) continue;
    if (!categories.place.has(v)) {
      warnOnce(
        `category-unlisted-${key}`,
        `Series "${name}" brings the category "${v}", which the ${axis} does not list in \`categories\`. ` +
          "It has no place and is not drawn (ADR-0052).",
      );
    }
    if (once && seen.has(v)) {
      warnOnce(
        `category-twice-${key}`,
        `Series "${name}" brings the category "${v}" more than once to the ${axis}. ` +
          "Both rows are drawn in the one place; add them up before the chart (ADR-0052).",
      );
    }
    seen.add(v);
  }
}
