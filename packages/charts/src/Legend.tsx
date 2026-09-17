/* <Legend> - static legend (R-4.11).
   No click toggle in V0. Hovering an entry highlights the series it belongs to;
   the remaining series are drawn on the series layer at 0.25 alpha. This is not a
   mousemove path, which is why a redraw of the series layer is explicitly allowed
   here. */

import { useSyncExternalStore, type ReactNode } from "react";
import { useChartScene, useLegend } from "./context";
import type { ChartScene } from "./scene";

export interface LegendProps {
  /** Which side of the plot area the legend stands on. Without a value, below
      it. */
  placement?: "top" | "bottom";
}

function LegendInner({
  scene,
  placement,
}: {
  scene: ChartScene;
  placement: "top" | "bottom";
}): ReactNode {
  useLegend("Legend", { placement });
  const snapshot = useSyncExternalStore(
    scene.subscribeLayout,
    scene.getLayoutSnapshot,
    scene.getLayoutServerSnapshot,
  );
  if (snapshot.series.length === 0) return null;
  return (
    <div className={`kc-legend kc-legend-${placement}`}>
      {snapshot.series.map((item) => (
        <span
          key={item.id}
          className="kc-legend-item"
          onPointerEnter={() => scene.setHighlight(item.seriesId)}
          onPointerLeave={() => scene.setHighlight(null)}
        >
          <span className="kc-legend-chip" style={{ background: item.color }} />
          {item.name}
        </span>
      ))}
    </div>
  );
}

export function Legend({ placement = "top" }: LegendProps): ReactNode {
  const scene = useChartScene("Legend");
  if (scene === null) return null; // PROD outside a Chart (R-2.3)
  return <LegendInner scene={scene} placement={placement} />;
}
