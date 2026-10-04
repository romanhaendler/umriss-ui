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

import { useEffect, useMemo, useRef, useState } from "react";
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
import { fnEqual } from "./scene";
import { readerOf } from "./value";
import type { Accessor, Value } from "./types";
import type { ReactNode } from "react";

/** The props of `ControlChart`. */
export interface ControlChartProps<T> {
  /** The values of the chart - a number field of its `data`'s rows or a
      function of them. */
  value: Value<T>;
  /** Required: the limits arise out of these values, not out of what happens to
      be visible. */
  data: readonly T[];
  /** Given, or from a named reference window - never tacitly from everything on
      the screen (ADR-0008). */
  origin: ControlLimitOrigin;
  /** Binding to an x axis.
      @remarks R-4.12 */
  xAxisId?: string;
  /** Binding to a y axis.
      @remarks R-4.12 */
  yAxisId?: string;
  /** The name in legend and tooltip. Without one a warning stands in DEV - an
      unnamed series is a colour nobody can look up.
      @default "Series n", after its place in the chart */
  name?: string;
  /** The value as the tooltip writes it - on the line and on the violations.
      @default the y axis' `tickFormat`, else the built-in number format */
  format?: (value: number) => string;
  /** Any CSS colour value.
      @default the palette's `--uc-series-N` */
  color?: string;
  /** A role instead of a colour value for the line; the theme resolves it.
      The violations are always "alarm". */
  tone?: "ok" | "warning" | "alarm";
  /** Switchable one by one; run lengths are parameters. */
  rules?: Partial<RuleOptions>;
  /** The faint zone lines at one and two sigma. Rule 4 is about the two-sigma
      zone; without them a reader cannot check it. */
  zoneLines?: boolean;
  /** Label of the upper control limit in the axis band. The package brings no
      text along, not even "UCL" and "LCL".
      @default no label */
  labelUpper?: string;
  /** The same for the lower control limit. Named separately because a chart may
      well want one of the two labelled and not the other.
      @default no label */
  labelLower?: string;
  /** Name of the scatter of violations in the legend and the tooltip. Without
      one a legend warns once in DEV. Before this, a German suffix stood on the
      name of the chart.
      @default "Series n", after its place in the chart */
  violationName?: string;
  /** The violations as data - they can be listed beside the chart as well as
      marked on it. */
  onViolations?: (found: readonly Violation[]) => void;
}

/** The value of the previous render while it equals the new one. A caller
    writes a value function and origin inline, and every render hands them over with a
    new identity - as dependencies of a memo they would recompute the limits on
    every render. Boxed, because React would call a function it is handed. */
function useKept<V>(value: V, equal: (a: V, b: V) => boolean): V {
  const [kept, setKept] = useState({ value });
  if (kept.value === value || equal(kept.value, value)) return kept.value;
  setKept({ value });
  return value;
}

function originEqual(a: ControlLimitOrigin, b: ControlLimitOrigin): boolean {
  if (a.kind === "given" && b.kind === "given") return a.center === b.center && a.sigma === b.sigma;
  if (a.kind === "referenceWindow" && b.kind === "referenceWindow") return a.from === b.from && a.to === b.to;
  return false;
}

function violationsEqual(a: readonly Violation[], b: readonly Violation[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i] as Violation;
    const y = b[i] as Violation;
    if (x.rule !== y.rule || x.indices.length !== y.indices.length) return false;
    for (let k = 0; k < x.indices.length; k++) if (x.indices[k] !== y.indices[k]) return false;
  }
  return true;
}

/** A control chart inside a `Chart`: the values as a line, the control limits
    and zones computed from them, and the points that break a rule marked.
    It draws nothing of its own - it composes `Line`, `LimitLine` and
    `Scatter`, so that limits, zones and violations come from the same values. */
export function ControlChart<T>(props: ControlChartProps<T>): ReactNode {
  const {
    data,
    xAxisId = "x",
    yAxisId = "y",
    name,
    format,
    color,
    tone,
    rules,
    zoneLines = true,
    labelUpper,
    labelLower,
    violationName,
    onViolations,
  } = props;
  // Compared as the scene compares a series' value: a field by its name, a
  // function by its source text.
  const accessor = useKept(readerOf<Accessor<T>>(props.value), fnEqual);
  const origin = useKept(props.origin, originEqual);

  const values = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const raw = accessor(data[i] as T, i);
      out.push(raw === null || raw === undefined ? Number.NaN : raw);
    }
    return out;
  }, [data, accessor]);

  const limits = useMemo(() => controlLimits(values, origin), [values, origin]);
  // By content: new limits or new rules that find the same violations are no
  // news to the caller.
  const found = useKept(
    useMemo(() => violations(values, limits, rules ?? {}), [values, limits, rules]),
    violationsEqual,
  );

  const marked = useMemo(() => new Set(violatedIndices(found)), [found]);

  // Reporting during the render would mean setting the state of another
  // component while rendering - React warns with reason, StrictMode calls it
  // twice, and a discarded render would report all the same.
  // The callback is read through a ref: an inline one is new on every render,
  // and a caller that sets state in it would be called again by its own render.
  const report = useRef(onViolations);
  useEffect(() => {
    report.current = onViolations;
  }, [onViolations]);
  useEffect(() => {
    report.current?.(found);
  }, [found]);

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
      <Line value={accessor} data={data} xAxisId={xAxisId} yAxisId={yAxisId} name={name} format={format} color={color} tone={tone} />
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
        value={violationAccessor}
        data={violationData}
        xAxisId={xAxisId}
        yAxisId={yAxisId}
        name={violationName}
        format={format}
        tone="alarm"
        radius={4}
      />
    </>
  );
}
