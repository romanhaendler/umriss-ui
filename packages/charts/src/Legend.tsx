/* <Legend> - the legend (R-4.11).
   Hovering an entry highlights the series it belongs to; the remaining series
   are drawn on the series layer at 0.25 alpha. This is not a mousemove path,
   which is why a redraw of the series layer is explicitly allowed here.

   A click toggles only where the caller listens (`onToggle`): `hidden` is the
   caller's state, and a button that changes nothing is worse than none. */

import { useSyncExternalStore, type ReactNode } from "react";
import { useChartScene, useLegend } from "./context";
import { DataKey } from "./DataTable";
import { hatchLines, markerPath, type MarkerShape } from "./marks";
import type { ChartScene, LegendMark } from "./scene";
import type { Rect } from "./types";

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
            {item.mark === null ? (
              <span className="uc-legend-chip" style={{ background: item.color }} />
            ) : (
              <MarkChip color={item.color} mark={item.mark} />
            )}
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

/* ---------------- The chip under encoding by marks ----------------

   The canvas tells series apart by dash, marker and hatch as well as colour
   (charts-alternatives C3), so the chip has to show the same - drawn from the
   same numbers (marks.ts), as SVG, so that it stays as crisp as the text. */

const CHIP_HATCH = 3;

function MarkChip({ color, mark }: { color: string; mark: LegendMark }): ReactNode {
  if (mark.swatches !== null) {
    const w = mark.swatches.length === 1 ? 10 : 8;
    const width = w * mark.swatches.length;
    return (
      <svg className="uc-legend-mark" width={width} height={10} viewBox={`0 0 ${width} 10`} aria-hidden="true">
        {mark.swatches.map((swatch, k) => (
          // A nested svg clips its hatch to its own swatch.
          <svg key={k} x={k * w} y={0} width={w} height={10}>
            <rect width={w} height={10} fill={swatch.color} />
            <path d={linesD({ x: 0, y: 0, width: w, height: 10 }, swatch.hatch)} stroke={mark.ground} strokeWidth={1} />
          </svg>
        ))}
      </svg>
    );
  }
  return (
    <svg className="uc-legend-mark" width={18} height={10} viewBox="0 0 18 10" aria-hidden="true">
      {mark.dash !== null && (
        <line
          x1={1}
          y1={5}
          x2={17}
          y2={5}
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeDasharray={mark.dash.length > 0 ? mark.dash.join(" ") : undefined}
        />
      )}
      {mark.marker !== null && <path d={markerD(mark.marker, 9, 5, 3)} fill={color} />}
    </svg>
  );
}

function linesD(box: Rect, hatch: Parameters<typeof hatchLines>[1]): string {
  const flat = hatchLines(box, hatch, CHIP_HATCH);
  let d = "";
  for (let i = 0; i < flat.length; i += 4) d += `M${flat[i]} ${flat[i + 1]}L${flat[i + 2]} ${flat[i + 3]}`;
  return d;
}

function markerD(shape: MarkerShape, cx: number, cy: number, r: number): string {
  let d = "";
  markerPath(
    {
      moveTo: (x, y) => (d += `M${x} ${y}`),
      lineTo: (x, y) => (d += `L${x} ${y}`),
      // Only ever a whole circle: two half arcs, as SVG has no full one.
      arc: (x, y, radius) => (d += `M${x - radius} ${y}A${radius} ${radius} 0 1 0 ${x + radius} ${y}A${radius} ${radius} 0 1 0 ${x - radius} ${y}`),
      closePath: () => (d += "Z"),
    },
    shape,
    cx,
    cy,
    r,
  );
  return d;
}

export function Legend({ placement = "top", onToggle }: LegendProps): ReactNode {
  const scene = useChartScene("Legend");
  if (scene === null) return null; // PROD outside a Chart (R-2.3)
  return <LegendInner scene={scene} placement={placement} onToggle={onToggle} />;
}
