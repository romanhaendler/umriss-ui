/* <XAxis> / <YAxis> - axis configuration (4.2).
   Instantiable any number of times; ids must be unique within their orientation
   (R-4.12). The drawing happens in the scene, the labelling is rendered by the
   HTML layer (AxesHtml). */

import { useMemo } from "react";
import { useAxis } from "./context";
import { readerOf } from "./value";
import type { AxisConfig, NumberField } from "./types";
import type { WorkingInterval } from "./workingTime";
import type { ZoomLimits } from "./view";

interface CommonProps {
  /** Axis id, through which series bind themselves.
      @remarks R-4.12 */
  id?: string;
  /** Axis title. */
  label?: string;
  /** Target value; the 1-2-5 algorithm may deviate. */
  tickCount?: number;
  /** Label of a tick. Compared by its source text: one that reads a changed
      closure variable under the same text does not relabel the axis - give it
      a new text or remount. A bound `Intl.NumberFormat#format` is compared by
      identity. */
  tickFormat?: (v: number) => string;
  /** Grid lines.
      @default only on the first axis of its orientation
      @remarks R-4.15 */
  grid?: boolean;
  /** Fixed tick values instead of the 1-2-5 algorithm. For axes whose values are
      places and not numbers: the lanes of a state stack, the categories of a
      Pareto. */
  ticks?: readonly number[];
}

/** The props of `XAxis`. */
export interface XAxisProps<T> extends CommonProps {
  /** Where a row lies on this axis: a number field of the row, compared by
      its name, or a function of it, compared by its source text as a series'
      is (`Accessor`) - with the same closure limit. The axis reads the rows of
      every series bound to it; where those bring their own `data`, name
      their row: `<XAxis<HourCount> value="hour" />`. */
  value: NumberField<T> | ((d: T, index: number) => number);
  /** `"nice"` widens the data's extent to ticks - to named `ticks` where
      there are any, on a time axis to whole units of a step of hours or
      longer -, `"data"` keeps it, a pair is fixed. On a `zoomable` axis it is
      the start: what the axis shows while the chart's view names no span for
      it. */
  domain?: "nice" | "data" | readonly [number, number];
  /** Which edge the axis stands at. A second x axis on the opposite edge is how
      a series counts in a unit of its own. */
  position?: "bottom" | "top";
  /** The values are instants (milliseconds since the epoch): ticks on local
      boundaries from the minute to the month, labels by level in en-GB with a
      24-hour clock - `15:00`, `17 Mar`, `Mar 2026` - and the date on the first
      tick and on the first of a new day (`17 Mar 00:00`); a day tick there
      carries the year. The tooltip's x value carries the seconds where the
      readings lie less than a minute apart. Another language is a `tickFormat`,
      which is handed the instant. `calendar` implies it. */
  time?: boolean;
  /** Working calendar: the intervals in which time counts. With it the axis
      stands in working time - nights and weekends are out, and every
      removed span gets a break mark. The scale stays affine; the mapping happens
      in materialisation (ADR-0001). */
  calendar?: readonly WorkingInterval[];
  /** Zoom and pan: Ctrl or ⌘ with the wheel - and a pinch - zoom around the
      pointer, a drag, a horizontal wheel or Shift with the wheel pan, a double
      click goes back to `domain`; with the focus on the chart, + and − zoom,
      Shift with ← or → pans and 0 goes back. The span shown is part of the
      chart's view, by this axis' `id` (`useChart`'s `initialView`,
      `onViewChange`, `setDomain`). The plain wheel always scrolls the page.
      @default false */
  zoomable?: boolean;
  /** The narrowest and the widest span zoom may reach, in the axis' units -
      milliseconds on a time axis.
      @default at most the data's extent or this axis' own `domain`, whichever
      is wider, at least three data steps */
  zoomLimits?: ZoomLimits;
}

/** The props of `YAxis`. It reads no value of its own: where a row lies
    along y is its series' `value`. */
export interface YAxisProps extends CommonProps {
  /** As on the x axis, and `"visible"`: what the series show inside their x
      axis' domain - a zoomed hour gets the hour's range, not the week's -,
      widened to ticks as `"nice"` is. Where the x domain is not fixed that is
      every point. */
  domain?: "nice" | "data" | "visible" | readonly [number, number];
  /** On a further y axis: take the first y axis' tick count and widen this
      axis' domain until its ticks fall on that one's grid lines, the steps
      still 1-2-5 - one grid serves both. `tickCount` then does not apply; on
      the first y axis it changes nothing. */
  alignTicks?: boolean;
  /** Which edge the axis stands at. Several y axes per side are stacked
      outwards, so that extents of clearly different magnitude stay readable. */
  position?: "left" | "right";
}

/** A horizontal axis: where a datum lies along x, its ticks, title and grid.
    A chart may have several; series bind to one by its `id`. With `time` or a
    `calendar` it reads instants, with `zoomable` it zooms. It reads the
    rows of every series bound to it. */
export function XAxis<T>(props: XAxisProps<T>): null {
  const {
    id = "x",
    position = "bottom",
    label,
    tickCount,
    tickFormat,
    domain = "nice",
    grid,
    ticks,
    time,
    calendar,
    zoomable,
    zoomLimits,
  } = props;
  const limitMin = zoomLimits?.min;
  const limitMax = zoomLimits?.max;
  const accessor = readerOf<(d: T, index: number) => number>(props.value);

  const config = useMemo<AxisConfig>(
    () =>
      ({
        id,
        orientation: "x",
        position,
        accessor,
        label,
        tickCount,
        tickFormat,
        domain,
        grid,
        ticks,
        time,
        calendar,
        zoomable,
        zoomLimits: limitMin === undefined || limitMax === undefined ? undefined : { min: limitMin, max: limitMax },
      }) as AxisConfig,
    [id, position, accessor, label, tickCount, tickFormat, domain, grid, ticks, time, calendar, zoomable, limitMin, limitMax],
  );

  useAxis("XAxis", config);
  return null;
}

/** A vertical axis: the scale series draw their values on, its ticks, title
    and grid. A chart may have several; series bind to one by its `id`. */
export function YAxis(props: YAxisProps): null {
  const {
    id = "y",
    position = "left",
    label,
    tickCount,
    tickFormat,
    domain = "nice",
    grid,
    ticks,
    alignTicks,
  } = props;

  const config = useMemo<AxisConfig>(
    () =>
      ({
        id,
        orientation: "y",
        position,
        label,
        tickCount,
        tickFormat,
        domain,
        grid,
        ticks,
        alignTicks,
      }) as AxisConfig,
    [id, position, label, tickCount, tickFormat, domain, grid, ticks, alignTicks],
  );

  useAxis("YAxis", config);
  return null;
}
