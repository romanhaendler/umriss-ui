/* <LimitLine> and <LimitBand> - limits on the chart (judging-values 02).

   Both render nothing themselves: children are configuration collectors, the
   drawing happens in the scene (R-2.1). And both are explicitly not series - no
   accessor, no data, no legend entry, no hit. A limit belongs to no series, it
   belongs to the axis.

   The component is called LimitLine and not Limit because **Limit** is the model
   type of this package, the one ADR-0006 keeps in step with @umriss-ui/core; one
   module cannot export both under that name. The pair reads as what it is - a
   line and a band - and matches its own configuration types LimitLineConfig and
   LimitBandConfig. See CONTEXT.md on module and public names.

   Why inExtent defaults to true: of the two mistakes only one is visible. An
   excluded limit outside the data yields a chart that looks right and does not
   show its most important line - and that is noticed on the day it matters. An
   included one yields a visibly squashed plot, which the author repairs in a
   minute. So the default falls on the mistake that reports itself. */

import { useMemo } from "react";
import { useLimit } from "./context";
import type { LimitBandConfig, LimitLineConfig, LimitRole, Severity } from "./types";

interface CommonProps {
  /** Axis on which the value lies. Without one, the axis of the orientation's
      default id - "y", or "x" for `orientation="x"`. */
  axisId?: string;
  /** Whether the value lies on the x or on the y axis. Without one, y: a limit
      is nearly always a value and not a moment. */
  orientation?: "x" | "y";
  /** Two severities, not five: five urgencies are five colours, and five colours
      on a plant screen are noise. */
  severity?: Severity;
  /** What the value means. A line at 90 does not say what 90 is. */
  label?: string;
  /** Any CSS colour value, in place of the one the severity yields. A colour
      handed in instead of a severity puts the rule in the application and the
      presentation in the library, and the two drift apart as soon as a bound
      moves - so this is for the case that has no severity, not for taste. */
  color?: string;
  /** Whether the value widens the axis extent, so that the limit is certainly
      visible. Default true; the head of this file says why. */
  inExtent?: boolean;
  /** A chosen specification limit (the default) or a calculated control limit.
      They look different because they mean different things (ADR-0008). */
  role?: LimitRole;
}

export interface LimitLineProps extends CommonProps {
  /** Where the line lies, in domain units of its axis. */
  value: number;
}

export interface LimitBandProps extends CommonProps {
  /** Lower edge of the band, in domain units of its axis. */
  from: number;
  /** Upper edge. A band drawn backwards (`from` above `to`) is drawn between
      the two all the same - the pair is a range, not a direction. */
  to: number;
}

export function LimitLine(props: LimitLineProps): null {
  const {
    value,
    orientation = "y",
    axisId = orientation,
    severity = "alarm",
    label,
    color,
    inExtent = true,
    role = "specification",
  } = props;

  const config = useMemo<LimitLineConfig>(
    () => ({
      kind: "line",
      value,
      axisId,
      orientation,
      severity,
      role,
      label,
      color,
      inExtent,
    }),
    [value, axisId, orientation, severity, role, label, color, inExtent],
  );

  useLimit("LimitLine", config);
  return null;
}

export function LimitBand(props: LimitBandProps): null {
  const {
    from,
    to,
    orientation = "y",
    axisId = orientation,
    severity = "warning",
    label,
    color,
    inExtent = true,
    role = "specification",
  } = props;

  const config = useMemo<LimitBandConfig>(
    () => ({
      kind: "band",
      from,
      to,
      axisId,
      orientation,
      severity,
      role,
      label,
      color,
      inExtent,
    }),
    [from, to, axisId, orientation, severity, role, label, color, inExtent],
  );

  useLimit("LimitBand", config);
  return null;
}
