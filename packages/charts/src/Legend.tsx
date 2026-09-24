/* <Legend> - the legend (R-4.11).
   Hovering an entry highlights the series it belongs to; the remaining series
   are drawn on the series layer at 0.25 alpha. This is not a mousemove path,
   which is why a redraw of the series layer is explicitly allowed here.

   A click toggles only where the caller listens (`onToggle`): `hidden` is the
   caller's state, and a button that changes nothing is worse than none. */

import { useSyncExternalStore, type ReactNode } from "react";
import { useChartScene, useLegend } from "./context";
import { DataKey } from "./DataTable";
import type { ChartScene } from "./scene";

export interface LegendProps {
  /** Which side of the plot area the legend stands on. Without a value, above
      it. */
  placement?: "top" | "bottom";
  /** Called with an entry's name when it is clicked - the series' name, or a
      state's label. The caller flips `hidden` on the series it means. Without
      it the legend is not clickable. */
  onToggle?: (name: string) => void;
}

function LegendInner({
  scene,
  placement,
  onToggle,
}: {
  scene: ChartScene;
  placement: "top" | "bottom";
  onToggle?: (name: string) => void;
}): ReactNode {
  useLegend("Legend", { placement });
  const snapshot = useSyncExternalStore(
    scene.subscribeLayout,
    scene.getLayoutSnapshot,
    scene.getLayoutServerSnapshot,
  );
  const table = snapshot.dataTable;
  if (snapshot.series.length === 0 && table === null) return null;
  return (
    <div className={`uc-legend uc-legend-${placement}`}>
      {snapshot.series.map((item) => {
        const shared = {
          className: "uc-legend-item",
          "data-hidden": item.hidden ? "" : undefined,
          onPointerEnter: () => scene.setHighlight(item.seriesIds),
          onPointerLeave: () => scene.setHighlight(null),
        };
        const content = (
          <>
            <span className="uc-legend-chip" style={{ background: item.color }} />
            {item.name}
          </>
        );
        return onToggle === undefined ? (
          <span key={item.id} {...shared}>
            {content}
          </span>
        ) : (
          <button
            key={item.id}
            type="button"
            aria-pressed={!item.hidden}
            onClick={() => onToggle(item.name)}
            {...shared}
          >
            {content}
          </button>
        );
      })}
      {/* The data table's key stands at the legend's end (charts-alternatives
          C1): the legend is where a reader looks for what the colours mean,
          and the table is the other answer to that question. */}
      {table !== null && <DataKey scene={scene} state={table} />}
    </div>
  );
}

export function Legend({ placement = "top", onToggle }: LegendProps): ReactNode {
  const scene = useChartScene("Legend");
  if (scene === null) return null; // PROD outside a Chart (R-2.3)
  return <LegendInner scene={scene} placement={placement} onToggle={onToggle} />;
}
