/* <StateBand> - the fifth series kind (ADR-0007).

   The `value` yields a NUMBER: the index of the state in the state list. That
   keeps the materialised series at the same three channels as every other kind,
   the drawing loop monomorphic and the affine scale contract untouched. A caller
   whose data carries strings maps them in a `value` function - one line, once per point
   during materialisation. Giving up R-5.2 for that would be a bad trade for
   cosmetic reasons.

   The lane stands in domain units of the y axis, not in pixels and not in
   fractions of the plot height. Four resources are one axis with a domain of four
   units and four series of one each - labelled through the tickFormat the axis
   has anyway. No new lane concept, no new layout, no pixel arithmetic on the
   caller's side. */

import { useMemo } from "react";
import { useSeries } from "./context";
import { readerOf } from "./value";
import type { ValueFunction, Value, StateEntry, StateSeriesConfig } from "./types";

/** The props of `StateBand`. */
export interface StateBandProps<T> {
  /** Index of the state in `states` - a number field of the row or a
      function of it; null/undefined/NaN/±Infinity is a gap -
      and a gap stays a hole, it gets no colour for "unknown". A colour would
      be a claim about the interval. */
  value: Value<T>;
  /** The closed set of states, in the order of their codes. */
  states: readonly StateEntry[];
  /** Binding to an x axis.
      @remarks R-4.12 */
  xAxisId?: string;
  /** Binding to a y axis.
      @remarks R-4.12 */
  yAxisId?: string;
  /** Series-own data; overrides the container data.
      @remarks R-2.4 */
  data?: readonly T[];
  /** The name in legend and tooltip. Without one a warning stands in DEV - an
      unnamed series is a colour nobody can look up.
      @default "Series n", after its place in the chart */
  name?: string;
  /** Lower edge of the lane in domain units of the y axis. */
  laneFrom?: number;
  /** Upper edge of the lane in domain units of the y axis. */
  laneTo?: number;
}

/** A band of states: each point's state holds from its x until the next
    point's. The last one holds until the latest reading of the chart - the
    last x of any visible series on the same x axis - and where the band itself
    reports last, one median step of its own x values past its last point;
    never beyond the x domain. A state is claimed for as long as it was
    reported, not until the axis' rounded end. */
export function StateBand<T>(props: StateBandProps<T>): null {
  const {
    states,
    xAxisId = "x",
    yAxisId = "y",
    data,
    name,
    laneFrom,
    laneTo,
  } = props;
  const accessor = readerOf<ValueFunction<T>>(props.value);

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
        laneFrom,
        laneTo,
      }) as StateSeriesConfig,
    [accessor, states, xAxisId, yAxisId, data, name, laneFrom, laneTo],
  );

  useSeries("StateBand", config);
  return null;
}
