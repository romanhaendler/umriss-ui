/* <StateBand> - the fifth series kind (ADR-0007).

   The accessor yields a NUMBER: the index of the state in the state list. That
   keeps the materialised series at the same three channels as every other kind,
   the drawing loop monomorphic and the affine scale contract untouched. A caller
   whose data carries strings maps them in the accessor - one line, once per point
   during materialisation. Giving up R-5.2 for that would be a bad trade for
   cosmetic reasons.

   The lane stands in domain units of the y axis, not in pixels and not in
   fractions of the plot height. Four machines are one axis with a domain of four
   units and four series of one each - labelled through the tickFormat the axis
   has anyway. No new lane concept, no new layout, no pixel arithmetic on the
   caller's side. */

import { useMemo } from "react";
import { useSeries } from "./context";
import type { Accessor, StateEntry, StateSeriesConfig } from "./types";

export interface StateBandProps<T> {
  /** Index of the state in `states`; null/undefined/NaN/±Infinity is a gap -
      and a gap stays a hole, it gets no colour for "unknown". A colour would
      be a claim about the interval. */
  accessor: Accessor<T>;
  /** The closed set of states, in the order of their codes. */
  states: readonly StateEntry[];
  /** Binding to an x axis (R-4.12). */
  xAxisId?: string;
  /** Binding to a y axis (R-4.12). */
  yAxisId?: string;
  /** Series-own data; overrides the container data (R-2.4). */
  data?: readonly T[];
  /** The name in legend and tooltip. Without one the series is called
      "Series n" and a warning stands in DEV - an unnamed series is a colour
      nobody can look up. */
  name?: string;
  /** Not drawn, not hit and not counted for its axes' extent - a fixed
      `domain` keeps the axis still. Its legend entry stays, drawn back.
      Controlled: the caller sets it, typically from `Legend onToggle`. */
  hidden?: boolean;
  /** Lower edge of the lane in domain units of the y axis. */
  laneFrom?: number;
  /** Upper edge of the lane in domain units of the y axis. */
  laneTo?: number;
}

export function StateBand<T>(props: StateBandProps<T>): null {
  const {
    accessor,
    states,
    xAxisId = "x",
    yAxisId = "y",
    data,
    name,
    hidden,
    laneFrom,
    laneTo,
  } = props;

  const config = useMemo<StateSeriesConfig>(
    () =>
      ({
        kind: "state",
        accessor,
        states,
        xAxisId,
        yAxisId,
        data,
        name,
        hidden,
        laneFrom,
        laneTo,
      }) as StateSeriesConfig,
    [accessor, states, xAxisId, yAxisId, data, name, hidden, laneFrom, laneTo],
  );

  useSeries("StateBand", config);
  return null;
}
