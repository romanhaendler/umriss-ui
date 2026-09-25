/* <XAxis> / <YAxis> - axis configuration (4.2).
   Instantiable any number of times; ids must be unique within their orientation
   (R-4.12). The drawing happens in the scene, the labelling is rendered by the
   HTML layer (AxesHtml). */

import { useMemo } from "react";
import { useAxis } from "./context";
import type { AxisConfig } from "./types";
import type { WorkingInterval } from "./workingTime";

interface CommonProps<T> {
  /** Axis id, through which series bind themselves (R-4.12). */
  id?: string;
  /** Value access of this axis. Compared by its source text, as a series'
      accessor is (`Accessor`) - with the same closure limit. */
  accessor: (d: T, index: number) => number;
  /** Axis title. */
  label?: string;
  /** Target value; the 1-2-5 algorithm may deviate. */
  tickCount?: number;
  /** Label of a tick. Compared by its source text: one that reads a changed
      closure variable under the same text does not relabel the axis - give it
      a new text or remount. A bound `Intl.NumberFormat#format` is compared by
      identity. */
  tickFormat?: (v: number) => string;
  /** Grid lines; the default follows R-4.15. */
  grid?: boolean;
  /** Fixed tick values instead of the 1-2-5 algorithm. For axes whose values are
      places and not numbers: the lanes of a state stack, the categories of a
      Pareto. */
  ticks?: readonly number[];
}

export interface XAxisProps<T> extends CommonProps<T> {
  /** `"nice"` widens the data's extent to ticks, `"data"` keeps it, a pair is
      fixed - the one a zoom passes back. */
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
  /** Zoom and pan, controlled: Ctrl or ⌘ with the wheel - and a pinch - zoom
      around the pointer, a drag, a horizontal wheel or Shift with the wheel pan,
      a double click proposes the whole data range. Each proposes a domain in
      the axis' units and changes nothing; the caller passes it back as
      `domain`, clamped as it likes. Without a handler the axis does not zoom,
      and the plain wheel always scrolls the page. */
  onDomainChange?: (domain: [number, number]) => void;
}

export interface YAxisProps<T> extends CommonProps<T> {
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

export function XAxis<T>(props: XAxisProps<T>): null {
  const {
    id = "x",
    position = "bottom",
    accessor,
    label,
    tickCount,
    tickFormat,
    domain = "nice",
    grid,
    ticks,
    time,
    calendar,
    onDomainChange,
  } = props;

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
        onDomainChange,
      }) as AxisConfig,
    [id, position, accessor, label, tickCount, tickFormat, domain, grid, ticks, time, calendar, onDomainChange],
  );

  useAxis("XAxis", config);
  return null;
}

export function YAxis<T>(props: YAxisProps<T>): null {
  const {
    id = "y",
    position = "left",
    accessor,
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
        accessor,
        label,
        tickCount,
        tickFormat,
        domain,
        grid,
        ticks,
        alignTicks,
      }) as AxisConfig,
    [id, position, accessor, label, tickCount, tickFormat, domain, grid, ticks, alignTicks],
  );

  useAxis("YAxis", config);
  return null;
}
