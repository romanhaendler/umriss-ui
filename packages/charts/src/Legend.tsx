/* <Legend> - the legend (R-4.11).
   Hovering an entry highlights the series it belongs to; the remaining series
   are drawn on the series layer at 0.25 alpha. This is not a mousemove path,
   which is why a redraw of the series layer is explicitly allowed here.

   A click hides and shows the series through the chart's view (ADR-0047):
   every entry of a named series is a button. A series without a name cannot
   be hidden, so its entry stays text - a button that changes nothing is worse
   than none. */

import { useRef, useSyncExternalStore, type ReactNode } from "react";
import { useChartScene, useLegend } from "./context";
import { DataKey } from "./DataTable";
import { hatchLines, markerPath, type Hatch, type MarkerShape } from "./marks";
import type { ChartScene, LegendMark } from "./scene";
import type { Rect } from "./types";

/** The props of `Legend`. */
export interface LegendProps {
  /** Which side of the plot area the legend stands on.
      @default "top" */
  placement?: "top" | "bottom";
}

function LegendInner({ scene, placement }: { scene: ChartScene; placement: "top" | "bottom" }): ReactNode {
  useLegend("Legend", { placement });
  /** The entry clicked first and the hidden series before that click. */
  const first = useRef<{ id: string; hidden: readonly string[] } | null>(null);
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
        return item.names.length === 0 ? (
          <span key={item.id} {...shared}>
            {content}
          </span>
        ) : (
          <button
            key={item.id}
            type="button"
            aria-pressed={!item.hidden}
            onClick={(e) => {
              const before = first.current;
              if (e.detail >= 2 && before?.id === item.id) return scene.showOnlyNames(item.names, before.hidden);
              first.current = { id: item.id, hidden: scene.hiddenNow() };
              if (e.altKey) scene.showOnlyNames(item.names);
              else scene.toggleNames(item.names);
            }}
            onKeyDown={(e) => {
              if (e.key !== "Enter" || !e.shiftKey) return;
              e.preventDefault(); // or the button clicks as well
              scene.showOnlyNames(item.names);
            }}
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

export function MarkChip({ color, mark }: { color: string; mark: LegendMark }): ReactNode {
  const area = mark.dash !== null ? mark.swatches?.[0] : undefined;
  if (area !== undefined) {
    // An area: its faint fill hatched in its own colour, its dashed outline
    // along the top - as the plot draws it.
    return (
      <svg className="uc-legend-mark" width={18} height={10} viewBox="0 0 18 10" aria-hidden="true">
        <rect y={3} width={18} height={7} fill={area.color} fillOpacity={area.opacity} />
        <path d={linesD({ x: 0, y: 3, width: 18, height: 7 }, area.hatch)} stroke={area.color} strokeWidth={1} />
        <line
          x1={1}
          y1={3}
          x2={17}
          y2={3}
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeDasharray={mark.dash !== null && mark.dash.length > 0 ? mark.dash.join(" ") : undefined}
        />
      </svg>
    );
  }
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

function linesD(box: Rect, hatch: Hatch): string {
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

/** The legend of a chart: one entry per series, or per state of a state band.
    Hovering an entry highlights its series; a click hides and shows it, a
    state's entry the whole band - through the chart's view. A double click,
    Alt+click or Shift+Enter shows only it, or all where it is the only one
    visible. Nothing hides every series: what would shows all, and the live
    region says so. */
export function Legend({ placement = "top" }: LegendProps): ReactNode {
  const scene = useChartScene("Legend");
  if (scene === null) return null; // PROD outside a Chart (R-2.3)
  return <LegendInner scene={scene} placement={placement} />;
}
