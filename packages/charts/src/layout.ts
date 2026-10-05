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
import { alignedTicks, niceDomain, dataDomain, tickStep, ticksFor } from "./ticks";
import {
  breaks as calendarBreaks,
  calendarFrom,
  MINUTE,
  toWorkingTime,
  toWallClock,
} from "./workingTime";
import { timeDomain, timeLabels, timeStepFor, timeText, timeTicks } from "./time";
import type { WorkingInterval } from "./workingTime";
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
  /** "visible" arrives as its extent and is then widened as "nice" is. */
  domainMode: "nice" | "data" | "visible" | readonly [number, number];
  /** A zoomed x axis: its own domain, where the view puts a span in its place. */
  ownDomainMode?: "nice" | "data" | "visible" | readonly [number, number];
  tickCount?: number;
  tickFormat?: (v: number) => string;
  /** Fixed tick values instead of the 1-2-5 algorithm. */
  tickValues?: readonly number[];
  /** The values are instants: ticks on local boundaries, labels by level. */
  time?: boolean;
  /** Working calendar; the axis then stands in working time, and carries
      time. The module behind it builds a calendar out of the list once and
      keeps it. */
  calendar?: readonly WorkingInterval[];
  /** A further y axis: its ticks on the first y axis' grid. */
  alignTicks?: boolean;
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
  /** What a zoomed x axis would show unzoomed: its own domain at this width. */
  ownDomain?: readonly [number, number];
  scale: LinearScale;
  ticks: readonly TickLayout[];
  /** Formatter of this axis; the tooltip labels the x value with it too.
      `seconds` asks a time axis without a format of its own for the seconds
      (readings less than a minute apart); every other formatter ignores it. */
  format: (v: number, seconds?: boolean) => string;
  /** Height of the title text; used as the band width for rotated y titles. */
  titleSize: number;
  /** Places at which the calendar removed time, in pixels. An axis that takes a
      weekend out and says nothing claims a continuity that does not exist. */
  breaks: readonly number[];
  /** A y axis' limit labels stand inside the plot, not beside the ticks: in
      the band they would have taken more than LIMIT_SHARE of the width. */
  limitsInside: boolean;
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

/** The calendar of an axis; an empty list is none. */
function calendarOf(axis: AxisInput): readonly WorkingInterval[] | undefined {
  return axis.calendar !== undefined && axis.calendar.length > 0 ? axis.calendar : undefined;
}

/** Does a time axis span its smallest step? Less - the [0, 1] of an axis
    without data, a millisecond of 1970 - has no tick worth a label. */
function readable(domain: readonly [number, number]): boolean {
  return domain[1] - domain[0] >= MINUTE;
}

/** The readable step of a time axis over its domain. */
function stepOf(domain: readonly [number, number], tickCount: number) {
  return timeStepFor(domain[1] - domain[0], tickCount);
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
  // A working time axis gets no "nice" domain. Working time is
  // milliseconds, and a rounded-up end would lie outside [0, total] - there is no
  // wall clock time back there, and the tick generation needs it. The data span
  // the extent, not the round number.
  if (calendarOf(axis) !== undefined) return dataDomain(min, max);
  if (mode === "data") return dataDomain(min, max);
  // Named ticks are the axis' ticks: "nice" widens to them, not to a 1-2-5
  // grid nobody sees. That grid left categories a step of blank on one side
  // and half of one on the other, and on a narrow chart a third of the plot.
  const named = axis.tickValues;
  if (named !== undefined && named.length > 0) {
    return dataDomain(Math.min(min, ...named), Math.max(max, ...named));
  }
  if (axis.time === true) {
    // "Nice" on a time axis is the step's local boundary, not a round number of
    // milliseconds - where there is a step to speak of.
    // Widened to whole units of the step, not to the step: six-hour ticks
    // would stretch a day's 05:00 to 19:00 over all 24 hours, and a narrow
    // chart would show its data in the middle half. Minutes are the
    // exception - a whole minute is no margin, and a point on the edge would
    // be cut in half.
    if (!readable([min, max])) return dataDomain(min, max);
    const step = stepOf([min, max], tickCount);
    return timeDomain(min, max, step.unit === "minute" ? step : { ...step, n: 1, ms: step.ms / step.n });
  }
  return niceDomain(min, max, tickCount);
}

/** The tick values of an axis: named explicitly, on local time, or 1-2-5.

    With a calendar: candidates in WALL CLOCK TIME on local boundaries, throw
    away those in removed intervals, map the rest. Ticks generated in working
    time land in the middle of a working interval at 14.5 - an axis nobody can use. */
function tickValuesFor(
  axis: AxisInput,
  domain: readonly [number, number],
  tickCount: number,
): number[] {
  const calendar = calendarOf(axis);
  if (axis.tickValues !== undefined) {
    // Named on the clock, like the data; one in removed time has no place.
    const values =
      calendar !== undefined ? axis.tickValues.map((v) => toWorkingTime(v, calendar)) : axis.tickValues;
    return values.filter((v) => v >= domain[0] && v <= domain[1]);
  }
  if (calendar !== undefined) {
    const built = calendarFrom(calendar);
    const inside = (v: number) => toWallClock(Math.min(Math.max(v, 0), built.total), built);
    const values: number[] = [];
    for (const wall of timeTicks(inside(domain[0]), inside(domain[1]), stepOf(domain, tickCount))) {
      const v = toWorkingTime(wall, built);
      // Removed time, or the seam an earlier candidate already stands on: two
      // labels on one pixel are one too many.
      if (Number.isNaN(v) || v === values[values.length - 1]) continue;
      if (v >= domain[0] && v <= domain[1]) values.push(v);
    }
    return values;
  }
  if (axis.time === true) return readable(domain) ? timeTicks(domain[0], domain[1], stepOf(domain, tickCount)) : [];
  return ticksFor(domain[0], domain[1], tickCount);
}

function formatterFor(axis: AxisInput, domain: readonly [number, number], tickCount: number) {
  const own = axis.tickFormat;
  const calendar = calendarOf(axis);
  if (calendar !== undefined) {
    // A working time axis carries working time but labels the clock. The
    // caller's formatter therefore gets the point in time it expects - and the
    // same route labels the tooltip later.
    return own !== undefined
      ? (v: number) => own(toWallClock(v, calendar))
      : (v: number, seconds?: boolean) => timeText(toWallClock(v, calendar), seconds);
  }
  if (own !== undefined) return (v: number) => own(v);
  if (axis.time === true) return timeText;
  const step = tickStep(Math.abs(domain[1] - domain[0]), tickCount);
  return (v: number) => formatTick(v, step);
}

/** The labels of the ticks. A time axis without a format of its own labels by
    level, and a tick's label depends on the one before it - the date stands on
    the first tick of a new day - so the labels come as a list. */
function labelsFor(
  axis: AxisInput,
  domain: readonly [number, number],
  tickCount: number,
  values: readonly number[],
  format: (v: number) => string,
): string[] {
  const calendar = calendarOf(axis);
  if (axis.tickFormat !== undefined || (axis.time !== true && calendar === undefined)) return values.map(format);
  const wall = calendar === undefined ? values : values.map((v) => toWallClock(v, calendar));
  return timeLabels(wall, stepOf(domain, tickCount));
}

/** A label's left edge, moved inside a container of `width` (R-3.3.5). */
export function insideContainer(left: number, labelWidth: number, width: number): number {
  return Math.min(Math.max(left, 0), Math.max(0, width - labelWidth));
}

/** A label broken at the space that leaves its longer line shortest; one
    word stays as it is. */
export function twoLines(label: string, width: (text: string) => number): string {
  const words = label.split(" ");
  let best = label;
  let widest = Number.POSITIVE_INFINITY;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const w = Math.max(width(a), width(b));
    if (w < widest) {
      widest = w;
      best = `${a}\n${b}`;
    }
  }
  return best;
}

/** The most of the chart's width a y band may take for its limit labels;
    beyond it they stand inside the plot. */
export const LIMIT_SHARE = 0.2;

/** Room between two x labels; closer, and two read as one word. */
export const LABEL_GAP = 8;

/** Do the labels, in ascending order, stand clear of each other? */
export function apart(ticks: readonly Pick<TickLayout, "labelLeft" | "labelWidth">[]): boolean {
  for (let i = 1; i < ticks.length; i++) {
    const before = ticks[i - 1] as TickLayout;
    if (before.labelLeft + before.labelWidth + LABEL_GAP > (ticks[i] as TickLayout).labelLeft) return false;
  }
  return true;
}

/** Centres at least `size` apart, each as near its wish as the others allow:
    crowded ones form a run, centred on where its members want to stand. The
    labels of two limits a few pixels apart - a band and the line at its edge -
    would otherwise cover each other. Order is kept. */
export function spread(wanted: readonly number[], size: number): number[] {
  const order = wanted.map((_, i) => i).sort((a, b) => (wanted[a] as number) - (wanted[b] as number));
  const runs: { members: number[]; start: number }[] = [];
  for (const i of order) {
    runs.push({ members: [i], start: wanted[i] as number });
    // Merge while the newest run reaches into the one before it.
    for (;;) {
      const last = runs[runs.length - 1] as (typeof runs)[number];
      const before = runs[runs.length - 2];
      if (before === undefined || before.start + before.members.length * size <= last.start) break;
      runs.pop();
      before.members.push(...last.members);
      const mean = before.members.reduce((sum, m) => sum + (wanted[m] as number), 0) / before.members.length;
      before.start = mean - ((before.members.length - 1) * size) / 2;
    }
  }
  const out = wanted.slice();
  for (const run of runs) run.members.forEach((m, k) => (out[m] = run.start + k * size));
  return out;
}

/** Complete layout calculation; derivable and testable purely from the inputs. */
export function computeLayout(input: LayoutInput): LayoutResult {
  // Named x ticks that only fit on two lines need a band two lines high, and
  // whether they fit is known only once the plot width is. So a first pass,
  // on a copy of the hysteresis, finds them, and a second grants the line.
  const probe = new Map(input.hysteresis);
  const first = layoutPass(input, probe, null);
  if (first.wrapped.size === 0) {
    for (const [key, size] of probe) input.hysteresis.set(key, size);
    return first.layout;
  }
  return layoutPass(input, input.hysteresis, first.wrapped).layout;
}

/** One pass. `tall` null: every named x axis may wrap, as the probe;
    otherwise only those it names, which have the band for it. */
function layoutPass(
  input: LayoutInput,
  hysteresis: Map<string, number>,
  tall: ReadonlySet<string> | null,
): { layout: LayoutResult; wrapped: Set<string> } {
  const { width, height, padding, axes, measure } = input;
  const wrapped = new Set<string>();

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
    const lines = tall?.has(axis.key) === true ? 2 : 1;
    xHeight.set(axis.key, stabilize(axis.key, TICK_LEN + TICK_GAP + lines * lineHeight + title, hysteresis));
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
    limitsInside: boolean;
  }
  const yInterim = new Map<string, Interim>();
  const yWidth = new Map<string, number>();

  // The first y axis in registration order goes first: an aligned axis takes
  // its grid.
  const firstY = axes.find((a) => a.orientation === "y");
  for (const axis of [...left, ...right].sort((a, b) => (a === firstY ? -1 : b === firstY ? 1 : 0))) {
    const tickCount = axis.tickCount ?? Math.max(2, Math.round(plotHeight / 50));
    const grid = firstY === undefined ? undefined : yInterim.get(firstY.key);
    // A fixed domain is widened from itself, any other from the extent.
    const [min, max] = Array.isArray(axis.domainMode) ? domainOf(axis, tickCount) : axis.extent;
    const aligned =
      axis.alignTicks === true && axis !== firstY && grid !== undefined
        ? alignedTicks(min, max, grid.domain, grid.values)
        : null;
    const domain = aligned?.domain ?? domainOf(axis, tickCount);
    const values = aligned?.ticks ?? tickValuesFor(axis, domain, tickCount);
    const format =
      aligned === null ? formatterFor(axis, domain, tickCount) : (axis.tickFormat ?? ((v: number) => formatTick(v, aligned.step)));
    const labels = labelsFor(axis, domain, tickCount, values, format);
    const widths = labels.map((t) => measure(t, CLASS_TICK).width);
    let maxWidth = 0;
    for (const b of widths) if (b > maxWidth) maxWidth = b;
    // A limit label carries 2px padding on either side (its background covers a tick).
    let limitWidth = 0;
    for (const l of axis.limitLabels ?? []) limitWidth = Math.max(limitWidth, measure(l, CLASS_TICK).width + 4);
    const title =
      axis.label === undefined || axis.label === ""
        ? 0
        : Math.ceil(measure(axis.label, CLASS_TITLE).height) + TITLE_GAP;
    // "Objective 300 ms" beside the ticks took a third of a phone's chart and
    // left the course a strip; inside the plot it costs no width.
    const limitsInside = limitWidth > maxWidth && TICK_LEN + TICK_GAP + limitWidth + title > width * LIMIT_SHARE;
    if (!limitsInside) maxWidth = Math.max(maxWidth, limitWidth);
    yInterim.set(axis.key, { axis, domain, values, labels, widths, format, limitsInside });
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
        limitsInside: z?.limitsInside ?? false,
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
      let count = axis.tickCount ?? Math.max(2, Math.round(plotWidth / 80));
      // The domain comes from the count asked for; fewer labels below do not
      // widen it to a coarser step.
      const domain = domainOf(axis, count);
      const own = axis.ownDomainMode;
      const ownDomain = own === undefined ? undefined : domainOf({ ...axis, domainMode: own }, count);
      const scale = new LinearScale(domain, [plotLeft, plotLeft + plotWidth]);
      // Every `keep`-th tick at `tickCount`, measured and placed; `wrap`
      // breaks each label onto two lines.
      const place = (tickCount: number, keep: number, wrap = false) => {
        const all = tickValuesFor(axis, domain, tickCount);
        const values = all.filter((_, i) => i % keep === 0);
        const format = formatterFor(axis, domain, tickCount);
        // Labelled after thinning: a time label's date moves to the first tick
        // that is kept.
        const plain = labelsFor(axis, domain, tickCount, values, format);
        const labels = wrap ? plain.map((l) => twoLines(l, (t) => measure(t, CLASS_TICK).width)) : plain;
        const ticks: TickLayout[] = values.map((value, i) => {
          const label = labels[i] ?? "";
          const labelWidth = measure(label, CLASS_TICK).width;
          const px = scale.toPx(value);
          // Collision with the edge (R-3.3.5): the first and last label stay inside
          // the container.
          const labelLeft = insideContainer(px - labelWidth / 2, labelWidth, width);
          return { value, label, px, labelLeft, labelWidth };
        });
        return { format, ticks, total: all.length };
      };
      // Collision between the labels, measured and not guessed from a width
      // per tick. Generated ticks first ask for fewer, so their step stays
      // 1-2-5 or a calendar unit, as long as two remain; then - and named ticks,
      // the categories, at once - every k-th is kept.
      let placed = place(count, 1);
      if (axis.tickValues === undefined) {
        // One label cannot place a point: a week asked for three ticks gets a
        // week's step and one tick. Ask for more until there are two; should
        // they collide, keeping every other one below still leaves two.
        for (const most = count + 8; placed.total < 2 && count < most; ) placed = place(++count, 1);
        while (!apart(placed.ticks) && count > 1) {
          const next = place(count - 1, 1);
          if (next.total < 2) break;
          count--;
          placed = next;
        }
        // Below four ticks the steps jump far - six hours after three, a week
        // after two days -, and ten hours on a phone got two labels. A narrow
        // axis takes a denser step while its labels still stand apart.
        if (axis.tickCount === undefined) {
          for (let more = count + 1; placed.total < 4 && more <= count + 3; more++) {
            const next = place(more, 1);
            if (next.total <= placed.total) continue;
            if (!apart(next.ticks)) break;
            placed = next;
          }
        }
        for (let keep = 2; !apart(placed.ticks) && placed.ticks.length > 1; keep++) placed = place(count, keep);
      } else {
        // Named ticks are categories, and their names are the content: two
        // lines before any is left out, and at every thinning again.
        const wrap = tall === null || tall.has(axis.key);
        ladder: for (let keep = 1; ; keep++) {
          for (const lines of wrap ? [false, true] : [false]) {
            placed = place(count, keep, lines);
            if (apart(placed.ticks) || placed.ticks.length <= 1) {
              if (lines) wrapped.add(axis.key);
              break ladder;
            }
          }
        }
      }
      const { format, ticks } = placed;
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
        ...(ownDomain !== undefined && { ownDomain }),
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
        limitsInside: false,
      });
    });
  };

  buildX(top);
  buildX(bottom);

  return { layout: { width, height, plot, axes: result }, wrapped };
}
