/* HTML layer of the tooltip (R-4.8, R-4.9).
   The content is re-rendered only when the hit changes - the positioning runs
   imperatively in the scene through transform, so that a mouse movement without a
   change of hit triggers no React render. */

import { useCallback, useEffect, useSyncExternalStore, type ReactNode } from "react";
import type { ChartScene } from "./scene";
import { formatValue } from "./format";
import type { TooltipPoint } from "./types";

/* What stands in the value column. A state has a name and no meaningful number;
   a matrix has a number that is not its y position. Deciding both here saves
   every caller a render prop of their own just to keep a state code from being
   shown. */
function valueText(point: TooltipPoint): string {
  const label = point.segment?.label;
  if (label !== undefined && label !== "") return label;
  if (point.value !== undefined) return formatValue(point.value);
  return formatValue(point.yValue);
}

export function TooltipHtml({ scene }: { scene: ChartScene }): ReactNode {
  const snapshot = useSyncExternalStore(
    scene.subscribeHover,
    scene.getHoverSnapshot,
    scene.getHoverServerSnapshot,
  );

  // A callback ref instead of an effect: the tooltip element only comes into
  // being once a <Tooltip> is registered - an effect with [scene] would miss
  // that.
  const bindRef = useCallback(
    (el: HTMLDivElement | null) => {
      scene.bindTooltip(el);
    },
    [scene],
  );

  // Reposition after every change of content: only after the commit is the
  // actual tooltip size known (R-4.9).
  useEffect(() => {
    scene.markOverlayDirty();
  }, [scene, snapshot.version]);

  if (snapshot.tooltip === null) return null;
  const hover = snapshot.hover;

  return (
    <div className="kc-tooltip" ref={bindRef} role="presentation">
      {hover === null
        ? null
        : snapshot.tooltip.render !== undefined
          ? snapshot.tooltip.render(hover.hit)
          : (
              <>
                <div className="kc-tooltip-head">{snapshot.xLabel}</div>
                <div className="kc-tooltip-list">
                  {hover.hit.points.map((point) => (
                    <div className="kc-tooltip-row" key={`${point.seriesName}-${point.index}`}>
                      <span className="kc-tooltip-chip" style={{ background: point.color }} />
                      <span className="kc-tooltip-name">{point.seriesName}</span>
                      <span className="kc-tooltip-value">{valueText(point)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
    </div>
  );
}
