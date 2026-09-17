/* HTML layer of the axes (R-2.8: axes, labels, legend and tooltip are HTML, not
   canvas text). The positions come unchanged out of the layout calculation;
   nothing is recalculated here.

   Tick labels of the right and top positions mirror their alignment (R-4.16),
   y titles stand rotated outside their axis. */

import { useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import type { ChartScene, LimitLabel } from "./scene";
import { TICK_GAP, TICK_LEN, type AxisLayout } from "./layout";

function renderAxis(axis: AxisLayout, limits: readonly LimitLabel[]): ReactNode {
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
      className={`kc-axis kc-axis-${orientation} kc-axis-${position}`}
      style={bandStyle}
      data-axis={axis.id}
    >
      <span className="kc-axis-line" />
      {axis.ticks.map((tick) => {
        // Anchor on whole pixels: that coincides exactly with the grid line on
        // the canvas, which is aligned to half pixels (R-3.5).
        if (orientation === "y") {
          const anchor = Math.round(tick.px - band.y);
          return (
            <span key={tick.value} className="kc-tick" style={{ top: `${anchor}px` }}>
              <span className="kc-tick-mark" />
              <span
                className="kc-tick-label"
                style={{ [position === "left" ? "right" : "left"]: `${offset}px` }}
              >
                {tick.label}
              </span>
            </span>
          );
        }
        const anchor = Math.round(tick.px - band.x);
        return (
          <span key={tick.value} className="kc-tick" style={{ left: `${anchor}px` }}>
            <span className="kc-tick-mark" />
            <span
              className="kc-tick-label"
              style={{
                left: `${Math.round(tick.labelLeft - band.x) - anchor}px`,
                [position === "top" ? "bottom" : "top"]: `${offset}px`,
              }}
            >
              {tick.label}
            </span>
          </span>
        );
      })}
      {/* A break says that time was removed here. It stands in the band, in
          HTML, like every other axis decoration - no text on the canvas. */}
      {axis.breaks.map((px, i) => (
        <span
          key={`break-${i}`}
          className="kc-break"
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
            className="kc-limit-label"
            data-severity={g.severity}
            data-role={g.role}
            style={{ top: `${Math.round(g.px - band.y)}px` }}
          >
            {g.label}
          </span>
        ) : (
          <span
            key={`limit-${g.id}`}
            className="kc-limit-label"
            data-severity={g.severity}
            data-role={g.role}
            style={{
              left: `${Math.round(g.px - band.x)}px`,
              [position === "top" ? "bottom" : "top"]: `${offset}px`,
            }}
          >
            {g.label}
          </span>
        ),
      )}
      {axis.label !== undefined && axis.label !== "" && (
        <span className="kc-axis-title">{axis.label}</span>
      )}
    </div>
  );
}

export function AxesHtml({ scene }: { scene: ChartScene }): ReactNode {
  const snapshot = useSyncExternalStore(
    scene.subscribeLayout,
    scene.getLayoutSnapshot,
    scene.getLayoutServerSnapshot,
  );
  const { layout } = snapshot;
  if (layout.plot.width <= 0 || layout.plot.height <= 0) return null;
  return (
    <div className="kc-axes">
      {layout.axes.map((axis) =>
        renderAxis(
          axis,
          snapshot.limits.filter((g) => g.axisKey === axis.key),
        ),
      )}
    </div>
  );
}
