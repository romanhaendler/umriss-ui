/* <XAxis> / <YAxis> - axis configuration (4.2).
   Instantiable any number of times; ids must be unique within their orientation
   (R-4.12). The drawing happens in the scene, the labelling is rendered by the
   HTML layer (AxesHtml). */

import { useMemo } from "react";
import { useAxis } from "./context";
import type { AxisConfig } from "./types";
import type { OperatingInterval } from "./operatingTime";

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
  domain?: "nice" | "data" | readonly [number, number];
  /** Grid lines; the default follows R-4.15. */
  grid?: boolean;
  /** Fixed tick values instead of the 1-2-5 algorithm. For axes whose values are
      places and not numbers: the lanes of a state stack, the categories of a
      Pareto. */
  ticks?: readonly number[];
}

export interface XAxisProps<T> extends CommonProps<T> {
  /** Which edge the axis stands at. A second x axis on the opposite edge is how
      a series counts in a unit of its own. */
  position?: "bottom" | "top";
  /** The values are instants (milliseconds since the epoch): ticks on local
      boundaries from the minute to the month, labels by level in en-GB with a
      24-hour clock - `15:00`, `17 Mar`, `Mar 2026` - and the date on the first
      tick of a new day (`17 Mar 00:00`). Another language is a `tickFormat`,
      which is handed the instant. `calendar` implies it. */
  time?: boolean;
  /** Operating calendar: the intervals in which time counts. With it the axis
      stands in operating time - weekends and night shifts are out, and every
      removed span gets a break mark. The scale stays affine; the mapping happens
      in materialisation (ADR-0001). */
  calendar?: readonly OperatingInterval[];
}

export interface YAxisProps<T> extends CommonProps<T> {
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
      }) as AxisConfig,
    [id, position, accessor, label, tickCount, tickFormat, domain, grid, ticks, time, calendar],
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
      }) as AxisConfig,
    [id, position, accessor, label, tickCount, tickFormat, domain, grid, ticks],
  );

  useAxis("YAxis", config);
  return null;
}
