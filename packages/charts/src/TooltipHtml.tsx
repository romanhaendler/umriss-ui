/* HTML layer of the tooltip (R-4.8, R-4.9).
   The content is re-rendered only when the hit changes - the positioning runs
   imperatively in the scene through transform, so that a mouse movement without a
   change of hit triggers no React render. */

import { Fragment, useCallback, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { MarkChip } from "./Legend";
import type { ChartScene } from "./scene";

/* What stands in the value column - a state's name, a cell's value, every
   other value in its y axis' format - the scene writes out once per hit
   (`HoverSnapshot.rows`): it knows the axes. Deciding it there saves every
   caller a render prop of their own just to keep a state code from being
   shown. */

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
    <div className="uc-tooltip" ref={bindRef} role="presentation">
      {hover === null
        ? null
        : snapshot.tooltip.render !== undefined
          ? snapshot.tooltip.render(hover.hit)
          : (
              <>
                <div className="uc-tooltip-head">{snapshot.xLabel}</div>
                <div className="uc-tooltip-list">
                  {hover.hit.points.map((point, k) => {
                    const row = snapshot.rows[k];
                    return (
                      <Fragment key={`${point.seriesName}-${point.index}`}>
                        <div className="uc-tooltip-row">
                          {row?.chip != null ? (
                            <MarkChip color={row.chip.color} mark={row.chip.mark} />
                          ) : (
                            <span className="uc-tooltip-chip" style={{ background: point.color }} />
                          )}
                          <span className="uc-tooltip-name">
                            {point.seriesName}
                            {row !== undefined && row.x !== "" ? (
                              <span className="uc-tooltip-x">{row.x}</span>
                            ) : null}
                          </span>
                          <span className="uc-tooltip-value">{row?.value}</span>
                        </div>
                        {/* A stack's total follows its last member (charts-stacking K4). */}
                        {snapshot.totals
                          .filter((t) => t.after === k)
                          .map((t) => (
                            <div className="uc-tooltip-row" key="total">
                              <span className="uc-tooltip-name uc-tooltip-total">{t.name}</span>
                              <span className="uc-tooltip-value">{t.value}</span>
                            </div>
                          ))}
                      </Fragment>
                    );
                  })}
                </div>
              </>
            )}
    </div>
  );
}
