/* <Tooltip> - configuration of hit testing and tooltip content.
   Renders nothing itself; the tooltip element belongs to the HTML layer of the
   container (TooltipHtml). Without a <Tooltip> there is neither a crosshair nor a
   hover marker - the interaction is explicitly opt-in. */

import { useMemo } from "react";
import { useTooltip } from "./context";
import type { TooltipConfig, TooltipHit } from "./types";
import type { ReactNode } from "react";

/** The props of `Tooltip`. */
export interface TooltipProps<T> {
  /** "x": every series at the x position; "nearest": only the nearest point. */
  mode?: "x" | "nearest";
  /** Adds a row for every labelled `LimitLine` and `LimitBand` on the hit's y
      axis - its label and value in that axis' format - to the built-in
      tooltip, and the same to what a key reads out. Limits are not series and
      stay out of the tooltip unless asked for.
      @default false */
  limits?: boolean;
  /** Render prop for content of one's own. Compared by its source text, like
      `tickFormat` - with the same closure limit.
      @default the built-in tooltip */
  render?: (hit: TooltipHit<T>) => ReactNode;
}

/** Turns on the pointer's interaction with a chart: crosshair, hover markers
    and the tooltip, built in or from `render`. Without it the chart does not
    answer the pointer. */
export function Tooltip<T>(props: TooltipProps<T>): null {
  const { mode = "x", limits = false, render } = props;
  const config = useMemo<TooltipConfig>(
    () => ({ mode, limits, render: render as TooltipConfig["render"] }),
    [mode, limits, render],
  );
  useTooltip("Tooltip", config);
  return null;
}
