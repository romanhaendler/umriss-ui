/* HTML layer of the axes (R-2.8: axes, labels, legend and tooltip are HTML, not
   canvas text). The positions come unchanged out of the layout calculation;
   nothing is recalculated here.

   Tick labels of the right and top positions mirror their alignment (R-4.16),
   y titles stand rotated outside their axis. */

import { useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import type { ChartScene, LimitLabel } from "./scene";
import { TICK_GAP, TICK_LEN, type AxisLayout } from "./layout";
import type { Rect } from "./types";

function renderAxis(axis: AxisLayout, limits: readonly LimitLabel[], plot: Rect): ReactNode {
  const { band, position, orientation } = axis;
  const bandStyle: CSSProperties = {
    left: `${band.x}px`,
    top: `${band.y}px`,
    width: `${band.width}px`,
    height: `${band.height}px`,
  };
  const offset = TICK_LEN + TICK_GAP;

  return (
    <div
      key={axis.key}
      className={`uc-axis uc-axis-${orientation} uc-axis-${position}`}
      style={bandStyle}
      data-axis={axis.id}
    >
      <span className="uc-axis-line" />
      {axis.ticks.map((tick) => {
        // Anchor on whole pixels: that coincides exactly with the grid line on
        // the canvas, which is aligned to half pixels (R-3.5).
        if (orientation === "y") {
          const anchor = Math.round(tick.px - band.y);
          // A limit's label is the weightier statement and covers the tick's;
          // half a number showing beside it would be read as part of it.
          const covered = limits.some((g) => !g.inside && Math.abs(g.px - tick.px) < g.height);
          return (
            <span key={tick.value} className="uc-tick" style={{ top: `${anchor}px` }}>
              <span className="uc-tick-mark" />
              {!covered && (
                <span
                  className="uc-tick-label"
                  style={{ [position === "left" ? "right" : "left"]: `${offset}px` }}
                >
                  {tick.label}
                </span>
              )}
            </span>
          );
        }
        const anchor = Math.round(tick.px - band.x);
        // As on a y axis: the limit's label covers the tick label it reaches over.
        const covered = limits.some(
          (g) => g.labelLeft < tick.labelLeft + tick.labelWidth && tick.labelLeft < g.labelLeft + g.width,
        );
        return (
          <span key={tick.value} className="uc-tick" style={{ left: `${anchor}px` }}>
            <span className="uc-tick-mark" />
            {!covered && (
              <span
                className="uc-tick-label"
                style={{
                  left: `${Math.round(tick.labelLeft - band.x) - anchor}px`,
                  [position === "top" ? "bottom" : "top"]: `${offset}px`,
                }}
              >
                {tick.label}
              </span>
            )}
          </span>
        );
      })}
      {/* A break says that time was removed here. It stands in the band, in
          HTML, like every other axis decoration - no text on the canvas. */}
      {axis.breaks.map((px, i) => (
        <span
          key={`break-${i}`}
          className="uc-break"
          style={{ left: `${Math.round(px - band.x)}px` }}
          aria-hidden="true"
        />
      ))}
      {/* The label of a limit says what the number means: a line at 90 does not
          explain what 90 is. */}
      {limits.map((g) =>
        orientation === "y" ? (
          <span
            key={`limit-${g.id}`}
            className="uc-limit-label"
            data-severity={g.severity}
            data-role={g.role}
            data-own={g.color === undefined ? undefined : ""}
            style={{
              top: `${Math.round(g.px - band.y)}px`,
              // Inside: against the plot's far edge, 4 px in.
              ...(g.inside
                ? position === "left"
                  ? { right: `${band.x + band.width - (plot.x + plot.width) + 4}px` }
                  : { left: `${plot.x - band.x + 4}px` }
                : {}),
            }}
          >
            {limitText(g)}
          </span>
        ) : (
          <span
            key={`limit-${g.id}`}
            className="uc-limit-label"
            data-severity={g.severity}
            data-role={g.role}
            data-own={g.color === undefined ? undefined : ""}
            style={{
              left: `${Math.round(g.labelLeft - band.x)}px`,
              [position === "top" ? "bottom" : "top"]: `${offset}px`,
            }}
          >
            {limitText(g)}
          </span>
        ),
      )}
      {axis.label !== undefined && axis.label !== "" && (
        <span className="uc-axis-title">{axis.label}</span>
      )}
    </div>
  );
}

/** A limit's label in its own colour would be text in a colour the caller
    chose for a line, legible in one theme at best. So the text stays in the
    axis's text colour, and a short stroke before it - the line's own pattern,
    drawn by the stylesheet per role - carries the colour. */
function limitText(g: LimitLabel): ReactNode {
  if (g.color === undefined) return g.label;
  return (
    <>
      <span className="uc-limit-mark" style={{ color: g.color }} aria-hidden="true" />
      {g.label}
    </>
  );
}

export function AxesHtml({ scene, empty }: { scene: ChartScene; empty: ReactNode }): ReactNode {
  const snapshot = useSyncExternalStore(
    scene.subscribeLayout,
    scene.getLayoutSnapshot,
    scene.getLayoutServerSnapshot,
  );
  const { layout } = snapshot;
  if (layout.plot.width <= 0 || layout.plot.height <= 0) return null;
  const { plot } = layout;
  return (
    <div className="uc-axes">
      {snapshot.empty && (
        <div
          className="uc-empty"
          style={{ left: `${plot.x}px`, top: `${plot.y}px`, width: `${plot.width}px`, height: `${plot.height}px` }}
        >
          {empty}
        </div>
      )}
      {layout.axes.map((axis) =>
        renderAxis(
          axis,
          snapshot.limits.filter((g) => g.axisKey === axis.key),
          plot,
        ),
      )}
    </div>
  );
}
