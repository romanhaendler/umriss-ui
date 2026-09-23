/* <Tooltip> - configuration of hit testing and tooltip content (4.4).
   Renders nothing itself; the tooltip element belongs to the HTML layer of the
   container (TooltipHtml). Without a <Tooltip> there is neither a crosshair nor a
   hover marker - the interaction is explicitly opt-in. */

import { useMemo } from "react";
import { useTooltip } from "./context";
import type { TooltipConfig, TooltipHit } from "./types";
import type { ReactNode } from "react";

export interface TooltipProps<T> {
  /** "x": every series at the x position; "nearest": only the nearest point. */
  mode?: "x" | "nearest";
  /** Render prop for content of one's own; without it the built-in tooltip
      applies. Compared by its source text, like `tickFormat` - with the same
      closure limit. */
  render?: (hit: TooltipHit<T>) => ReactNode;
}

export function Tooltip<T>(props: TooltipProps<T>): null {
  const { mode = "x", render } = props;
  const config = useMemo<TooltipConfig>(
    () => ({ mode, render: render as TooltipConfig["render"] }),
    [mode, render],
  );
  useTooltip("Tooltip", config);
  return null;
}
