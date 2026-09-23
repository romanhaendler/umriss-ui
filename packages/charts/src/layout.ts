/* Layout engine (section 3 of the handoff).

   Layout area = container size minus the axis bands on all four sides minus the
   padding (R-3.1). Several axes on the same side stack from the inside outwards
   in registration order, separated by a fixed gap (R-3.2).

   Order of the calculation (R-3.3), the resolved chicken-and-egg chain:
   1. The extents of every axis are already known (independent of the layout, out
      of the bound series; see scene.ts).
   2. X band heights: these depend only on the line height of the labels and on
      the title, not on the tick values - so they can be determined without
      knowing the plot width. That fixes the plot height.
   3. Per y axis: ticks out of the plot height, labels formatted, the width of the
      longest label measured through the measuring span → band width → plot width.
   4. X ticks out of the plot width; a collision of the first or last label with
      the edge is resolved by shifting, never by cutting off.
   Every band size is rounded to a whole number and stabilised individually with
   hysteresis (R-3.4). */

import { LinearScale } from "./scale";
import { formatTick } from "./format";
import { niceDomain, dataDomain, tickStep, ticksFor } from "./ticks";
import {
  breaks as calendarBreaks,
  calendarFrom,
  localOffset,
  operatingTicks,
  toOperatingTime,
  toWallClock,
} from "./operatingTime";
import type { OperatingInterval } from "./operatingTime";
import type { AxisOrientation, AxisPosition, Rect } from "./types";
import type { TextSize } from "./measure";

export const TICK_LEN = 5;
export const TICK_GAP = 4;
/** Fixed gap between stacked bands on the same side (R-3.2). */
export const BAND_GAP = 8;
export const TITLE_GAP = 4;
/** A band shrinks only once it is at least this much too large (R-3.4). */
export const HYSTERESIS = 8;

export const CLASS_TICK = "uc-tick-label";
export const CLASS_TITLE = "uc-axis-title";

export interface AxisInput {
  /** Unique key: orientation + id. */
  key: string;
  id: string;
  orientation: AxisOrientation;
  position: AxisPosition;
  label?: string;
  grid: boolean;
  /** Raw extent out of the bound series (independent of the layout). */
  extent: readonly [number, number];
  domainMode: "nice" | "data" | readonly [number, number];
  tickCount?: number;
  tickFormat?: (v: number) => string;
  /** Fixed tick values instead of the 1-2-5 algorithm. */
  tickValues?: readonly number[];
  /** Operating calendar; the axis then stands in operating time. The module
      behind it builds a calendar out of the list once and keeps it. */
  calendar?: readonly OperatingInterval[];
  /** Labels of the limits on a y axis: they stand in its band beside the
      ticks, so the band is as wide as the widest of both. */
  limitLabels?: readonly string[];
}

export interface TickLayout {
  value: number;
  label: string;
  /** Pixel position on the axis (container coordinates). */
  px: number;
  /** Left edge of the label in container coordinates (x axes only). */
  labelLeft: number;
  labelWidth: number;
}

export interface AxisLayout {
  key: string;
  id: string;
  orientation: AxisOrientation;
  position: AxisPosition;
  label?: string;
  grid: boolean;
  /** Band rectangle in container coordinates. */
  band: Rect;
  /** Band width (y) or band height (x). */
  size: number;
  /** Distance of the band from the plot: 0 = directly at the plot. */
  stack: number;
  domain: readonly [number, number];
  scale: LinearScale;
  ticks: readonly TickLayout[];
  /** Formatter of this axis; the tooltip labels the x value with it too. */
  format: (v: number) => string;
  /** Height of the title text; used as the band width for rotated y titles. */
  titleSize: number;
  /** Places at which the calendar removed time, in pixels. An axis that takes a
      weekend out and says nothing claims a continuity that does not exist. */
  breaks: readonly number[];
}

export interface LayoutResult {
  width: number;
  height: number;
  plot: Rect;
  axes: readonly AxisLayout[];
}

export interface LayoutInput {
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
  /** Axes in registration order. */
  axes: readonly AxisInput[];
  measure: (text: string, className: string) => TextSize;
  /** Persistent hysteresis state per band key (R-3.4). */
  hysteresis: Map<string, number>;
}

export const EMPTY_LAYOUT: LayoutResult = {
  width: 0,
  height: 0,
  plot: { x: 0, y: 0, width: 0, height: 0 },
  axes: [],
};

/** Round to a whole number and stabilise with hysteresis (R-3.4). */
function stabilize(key: string, needed: number, hysteresis: Map<string, number>): number {
  const next = Math.ceil(needed);
  const previous = hysteresis.get(key);
  if (previous === undefined) {
    hysteresis.set(key, next);
    return next;
  }
  if (next > previous) {
    hysteresis.set(key, next);
    return next; // grows at once
  }
  if (previous - next >= HYSTERESIS) {
    hysteresis.set(key, next);
    return next; // shrinks only on a clear excess
  }
  return previous;
}

function domainOf(
  axis: AxisInput,
  tickCount: number,
): readonly [number, number] {
  const mode = axis.domainMode;
  if (Array.isArray(mode)) {
    const fixed = mode as readonly [number, number];
    if (fixed[0] === fixed[1]) return [fixed[0] - 1, fixed[1] + 1];
    return fixed;
  }
  const [min, max] = axis.extent;
  // An operating time axis gets no "nice" domain. Operating time is
  // milliseconds, and a rounded-up end would lie outside [0, total] - there is no
  // wall clock time back there, and the tick generation needs it. The data span
  // the extent, not the round number.
  if (axis.calendar !== undefined && axis.calendar.length > 0) return dataDomain(min, max);
  return mode === "data" ? dataDomain(min, max) : niceDomain(min, max, tickCount);
}

/** Default labelling of a time axis: `dd.MM. HH:mm`. Deliberately terse and
    deliberately without a choice of language: this package has no text layer, and
    whoever needs a format names one.

    Set by hand and not through `Intl`: `toLocaleString(undefined, …)` would ask
    the machine's locale, and the same axis would look different on two computers
    (library-audit 03). The notation happens to be the same as in the sister
    package. */
function timeText(wallClock: number): string {
  if (!Number.isFinite(wallClock)) return "";
  const d = new Date(wallClock);
  const two = (n: number) => String(n).padStart(2, "0");
  return `${two(d.getDate())}.${two(d.getMonth() + 1)}. ${two(d.getHours())}:${two(d.getMinutes())}`;
}

/** The tick values of an axis: named explicitly, out of the calendar, or 1-2-5.

    Out of the calendar means: candidates in WALL CLOCK TIME on readable
    boundaries, throw away those in removed intervals, map the rest. Ticks
    generated in operating time land in the middle of a shift at 14.5 - an axis
    nobody can use. */
function tickValuesFor(
  axis: AxisInput,
  domain: readonly [number, number],
  tickCount: number,
): number[] {
  const calendar = axis.calendar;
  const timed = calendar !== undefined && calendar.length > 0;
  if (axis.tickValues !== undefined) {
    // Named on the clock, like the data; one in removed time has no place.
    const values = timed ? axis.tickValues.map((v) => toOperatingTime(v, calendar)) : axis.tickValues;
    return values.filter((v) => v >= domain[0] && v <= domain[1]);
  }
  if (timed) {
    // Days and half days on LOCAL midnight, the time zone's at the domain's
    // start - the labels are local.
    // ponytail: one offset for the domain; across a clock change the day ticks
    // after it sit an hour off. An offset per candidate when that matters.
    const built = calendarFrom(calendar);
    const start = toWallClock(Math.min(Math.max(domain[0], 0), built.total), built);
    return operatingTicks(built, domain[0], domain[1], tickCount, localOffset(start));
  }
  return ticksFor(domain[0], domain[1], tickCount);
}

function formatterFor(axis: AxisInput, domain: readonly [number, number], tickCount: number) {
  const calendar = axis.calendar;
  if (calendar !== undefined && calendar.length > 0) {
    // An operating time axis carries operating time but labels the clock. The
    // caller's formatter therefore gets the point in time it expects - and the
    // same route labels the tooltip later.
    const own = axis.tickFormat;
    // Without a formatter of its own, a time and not a number: an operating time
    // axis carries time by definition, and thirteen-digit milliseconds are
    // neither readable nor narrow.
    if (own === undefined) return (v: number) => timeText(toWallClock(v, calendar));
    return (v: number) => own(toWallClock(v, calendar));
  }
  if (axis.tickFormat !== undefined) return axis.tickFormat;
  const step = tickStep(Math.abs(domain[1] - domain[0]), tickCount);
  return (v: number) => formatTick(v, step);
}

/** Complete layout calculation; derivable and testable purely from the inputs. */
export function computeLayout(input: LayoutInput): LayoutResult {
  const { width, height, padding, axes, measure, hysteresis } = input;

  const left = axes.filter((a) => a.position === "left");
  const right = axes.filter((a) => a.position === "right");
  const top = axes.filter((a) => a.position === "top");
  const bottom = axes.filter((a) => a.position === "bottom");

  const lineHeight = Math.ceil(measure("0", CLASS_TICK).height) || 14;

  /* --- Step 2: x band heights (independent of the ticks) --- */
  const xHeight = new Map<string, number>();
  for (const axis of [...top, ...bottom]) {
    const title =
      axis.label === undefined || axis.label === ""
        ? 0
        : Math.ceil(measure(axis.label, CLASS_TITLE).height) + TITLE_GAP;
    xHeight.set(axis.key, stabilize(axis.key, TICK_LEN + TICK_GAP + lineHeight + title, hysteresis));
  }

  const sum = (list: readonly AxisInput[], sizes: Map<string, number>): number => {
    let s = 0;
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      if (a === undefined) continue;
      s += sizes.get(a.key) ?? 0;
      if (i > 0) s += BAND_GAP;
    }
    return s;
  };

  const plotTop = padding.top + sum(top, xHeight);
  const plotBottom = height - padding.bottom - sum(bottom, xHeight);
  const plotHeight = Math.max(0, plotBottom - plotTop);

  /* --- Step 3: y ticks, label measurement, band widths --- */
  interface Interim {
    axis: AxisInput;
    domain: readonly [number, number];
    values: number[];
    labels: string[];
    widths: number[];
    format: (v: number) => string;
  }
  const yInterim = new Map<string, Interim>();
  const yWidth = new Map<string, number>();

  for (const axis of [...left, ...right]) {
    const tickCount = axis.tickCount ?? Math.max(2, Math.round(plotHeight / 50));
    const domain = domainOf(axis, tickCount);
    const values = tickValuesFor(axis, domain, tickCount);
    const format = formatterFor(axis, domain, tickCount);
    const labels = values.map(format);
    const widths = labels.map((t) => measure(t, CLASS_TICK).width);
    let maxWidth = 0;
    for (const b of widths) if (b > maxWidth) maxWidth = b;
    // A limit label carries 2px padding on either side (its background covers a tick).
    for (const l of axis.limitLabels ?? []) maxWidth = Math.max(maxWidth, measure(l, CLASS_TICK).width + 4);
    const title =
      axis.label === undefined || axis.label === ""
        ? 0
        : Math.ceil(measure(axis.label, CLASS_TITLE).height) + TITLE_GAP;
    yInterim.set(axis.key, { axis, domain, values, labels, widths, format });
    yWidth.set(
      axis.key,
      stabilize(axis.key, TICK_LEN + TICK_GAP + maxWidth + title, hysteresis),
    );
  }

  const plotLeft = padding.left + sum(left, yWidth);
  const plotRight = width - padding.right - sum(right, yWidth);
  const plotWidth = Math.max(0, plotRight - plotLeft);

  const plot: Rect = { x: plotLeft, y: plotTop, width: plotWidth, height: plotHeight };

  /* --- Band rectangles: stack from the inside outwards (R-3.2) --- */
  const bandRect = (
    axis: AxisInput,
    stack: number,
    offset: number,
    size: number,
  ): Rect => {
    switch (axis.position) {
      case "left":
        return { x: plotLeft - offset - size, y: plotTop, width: size, height: plotHeight };
      case "right":
        return { x: plotRight + offset, y: plotTop, width: size, height: plotHeight };
      case "top":
        return { x: plotLeft, y: plotTop - offset - size, width: plotWidth, height: size };
      default:
        return { x: plotLeft, y: plotBottom + offset, width: plotWidth, height: size };
    }
  };

  const result: AxisLayout[] = [];

  const buildY = (list: readonly AxisInput[]): void => {
    let offset = 0;
    list.forEach((axis, stack) => {
      const size = yWidth.get(axis.key) ?? 0;
      const z = yInterim.get(axis.key);
      const band = bandRect(axis, stack, offset, size);
      offset += size + BAND_GAP;
      const domain = z?.domain ?? ([0, 1] as const);
      const format = z?.format ?? ((v: number) => String(v));
      // The y range is inverted: the domain minimum lies at the bottom.
      const scale = new LinearScale(domain, [plotTop + plotHeight, plotTop]);
      const ticks: TickLayout[] = (z?.values ?? []).map((value, i) => ({
        value,
        label: z?.labels[i] ?? "",
        px: scale.toPx(value),
        labelLeft: 0,
        labelWidth: z?.widths[i] ?? 0,
      }));
      result.push({
        key: axis.key,
        id: axis.id,
        orientation: "y",
        position: axis.position,
        label: axis.label,
        grid: axis.grid,
        band,
        size,
        stack,
        domain,
        scale,
        ticks,
        format,
        titleSize:
          axis.label === undefined || axis.label === ""
            ? 0
            : Math.ceil(measure(axis.label, CLASS_TITLE).height),
        breaks: [],
      });
    });
  };

  buildY(left);
  buildY(right);

  /* --- Step 4: x ticks out of the now known plot width --- */
  const buildX = (list: readonly AxisInput[]): void => {
    let offset = 0;
    list.forEach((axis, stack) => {
      const size = xHeight.get(axis.key) ?? 0;
      const band = bandRect(axis, stack, offset, size);
      offset += size + BAND_GAP;
      const tickCount = axis.tickCount ?? Math.max(2, Math.round(plotWidth / 80));
      const domain = domainOf(axis, tickCount);
      const values = tickValuesFor(axis, domain, tickCount);
      const format = formatterFor(axis, domain, tickCount);
      const scale = new LinearScale(domain, [plotLeft, plotLeft + plotWidth]);
      const ticks: TickLayout[] = values.map((value) => {
        const label = format(value);
        const labelWidth = measure(label, CLASS_TICK).width;
        const px = scale.toPx(value);
        // Collision with the edge (R-3.3.5): the first and last label stay inside
        // the container.
        const center = px - labelWidth / 2;
        const labelLeft = Math.min(Math.max(center, 0), Math.max(0, width - labelWidth));
        return { value, label, px, labelLeft, labelWidth };
      });
      result.push({
        key: axis.key,
        id: axis.id,
        orientation: "x",
        position: axis.position,
        label: axis.label,
        grid: axis.grid,
        band,
        size,
        stack,
        domain,
        scale,
        ticks,
        format,
        titleSize:
          axis.label === undefined || axis.label === ""
            ? 0
            : Math.ceil(measure(axis.label, CLASS_TITLE).height),
        breaks:
          axis.calendar === undefined || axis.calendar.length === 0
            ? []
            : calendarBreaks(axis.calendar, domain[0], domain[1]).map((v) => scale.toPx(v)),
      });
    });
  };

  buildX(top);
  buildX(bottom);

  return { width, height, plot, axes: result };
}
