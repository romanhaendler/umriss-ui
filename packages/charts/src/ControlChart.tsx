/* <ControlChart> - the control chart, as a composition (ADR-0008).

   This component DRAWS NOTHING. It is one line, two control limits, the faint
   zone lines and a scatter of the violating points - all parts that already
   exist. It exists not because something was missing, but because the
   composition has enough pieces that a caller could wire them up
   inconsistently: limits from one series, violations from another, zones from an
   old sigma.

   If it ever gets a canvas call of its own, the composition was wrong, and the
   missing capability belongs in the parts.

   It requires `data` explicitly: to calculate control limits it needs the values
   themselves, and the container data live in the scene, not in the props.
   Requiring that explicitly is more honest than fetching them by a detour. */

import { useEffect, useMemo } from "react";
import { Line } from "./Line";
import { Scatter } from "./Scatter";
import { LimitLine } from "./LimitLine";
import {
  controlLimits,
  violatedIndices,
  violations,
  zones,
  type ControlLimitOrigin,
  type RuleOptions,
  type Violation,
} from "./controlLimits";
import type { Accessor } from "./types";
import type { ReactNode } from "react";

export interface ControlChartProps<T> {
  /** The values of the chart. */
  accessor: Accessor<T>;
  /** Required: the limits arise out of these values, not out of what happens to
      be visible. */
  data: readonly T[];
  /** Given, or from a named reference window - never tacitly from everything on
      the screen (ADR-0008). */
  origin: ControlLimitOrigin;
  /** Binding to an x axis (R-4.12). */
  xAxisId?: string;
  /** Binding to a y axis (R-4.12). */
  yAxisId?: string;
  /** The name in legend and tooltip. Without one the series is called
      "Series n" and a warning stands in DEV - an unnamed series is a colour
      nobody can look up. */
  name?: string;
  /** Any CSS colour value; without one the palette --uc-series-N. */
  color?: string;
  /** Switchable one by one; run lengths are parameters. */
  rules?: Partial<RuleOptions>;
  /** The faint zone lines at one and two sigma. Rule 4 is about the two-sigma
      zone; without them a reader cannot check it. */
  zoneLines?: boolean;
  /** Labels of the control limits in the axis band. Without a value, none: the
      package brings no text along, not even "UCL" and "LCL". */
  labelUpper?: string;
  /** The same for the lower control limit. Named separately because a chart may
      well want one of the two labelled and not the other. */
  labelLower?: string;
  /** Name of the scatter of violations in the legend and the tooltip. Without a
      value, none: a legend then carries it as "Series n" and warns once in DEV.
      Before this, a German suffix stood on the name of the chart. */
  violationName?: string;
  /** The violations as data - they can be listed beside the chart as well as
      marked on it. */
  onViolations?: (found: readonly Violation[]) => void;
}

export function ControlChart<T>(props: ControlChartProps<T>): ReactNode {
  const {
    accessor,
    data,
    origin,
    xAxisId = "x",
    yAxisId = "y",
    name,
    color,
    rules,
    zoneLines = true,
    labelUpper,
    labelLower,
    violationName,
    onViolations,
  } = props;

  const values = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const raw = accessor(data[i] as T, i);
      out.push(raw === null || raw === undefined ? Number.NaN : raw);
    }
    return out;
  }, [data, accessor]);

  const limits = useMemo(() => controlLimits(values, origin), [values, origin]);
  const found = useMemo(
    () => violations(values, limits, rules ?? {}),
    [values, limits, rules],
  );

  const marked = useMemo(() => new Set(violatedIndices(found)), [found]);

  // Reporting during the render would mean setting the state of another
  // component while rendering - React warns with reason, StrictMode calls it
  // twice, and a discarded render would report all the same.
  useEffect(() => {
    onViolations?.(found);
  }, [found, onViolations]);

  // The violations are an ordinary scatter over the same data: whatever does not
  // violate is a gap. No new series kind, no new drawing code.
  const violationAccessor = useMemo<Accessor<T>>(
    () => (d, i) => (marked.has(i) ? accessor(d, i) : null),
    [marked, accessor],
  );

  /* And a data reference of its own to go with it.

     The scene recognises a changed series partly by the source text of its
     accessor - and that is the same here on every render, although the closure
     reads a different set. This is the limit scene.ts writes down itself: "in
     that case the app must pass a new data reference". Here this app is the app.
     Without it the red points would stay at the state of the first evaluation
     while the limits move - a picture that looks as though one had understood
     it. */
  const violationData = useMemo(
    () => (marked.size === 0 ? data : data.slice()),
    [data, marked],
  );

  const zoneList = useMemo(
    () => (zoneLines ? zones(limits, [1, 2]) : []),
    [zoneLines, limits],
  );

  const usable = Number.isFinite(limits.center);

  return (
    <>
      <Line accessor={accessor} data={data} xAxisId={xAxisId} yAxisId={yAxisId} name={name} color={color} />
      {usable && (
        <>
          {zoneList.map((z) => (
            <LimitLine
              key={`zone-${z.k}-upper`}
              value={z.upper}
              axisId={yAxisId}
              role="zone"
              inExtent={false}
            />
          ))}
          {zoneList.map((z) => (
            <LimitLine
              key={`zone-${z.k}-lower`}
              value={z.lower}
              axisId={yAxisId}
              role="zone"
              inExtent={false}
            />
          ))}
          <LimitLine value={limits.center} axisId={yAxisId} role="control" />
          <LimitLine value={limits.upper} axisId={yAxisId} role="control" label={labelUpper} />
          <LimitLine value={limits.lower} axisId={yAxisId} role="control" label={labelLower} />
        </>
      )}
      <Scatter
        accessor={violationAccessor}
        data={violationData}
        xAxisId={xAxisId}
        yAxisId={yAxisId}
        name={violationName}
        tone="alarm"
        radius={4}
      />
    </>
  );
}
