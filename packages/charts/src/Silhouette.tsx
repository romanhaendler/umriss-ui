/* The silhouette (chart-loading 03): what stands in the plot area while a
   chart is loading with nothing to show. Variant A of the prototype, picked
   by eye (chart-loading 01): a quiet outline of the chart that is coming,
   shaped by its first series' kind, and one band that sweeps across every
   shape together - in pixels, so that a wide chart does not race and a narrow
   one does not crawl.

   The shapes are fixed and decorative: the same on every render, derived from
   no data. They are a mask; beneath it lie a faint ground and the band, so
   that the band lights every shape at once. Drawn in HTML and CSS over the
   plot, not on the canvas, which would need an animation loop of its own. */

import { useEffect, useId, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import type { ChartScene } from "./scene";
import type { Rect, SeriesKind } from "./types";

/** The kind the silhouette takes its shape from: the first series', "none"
    without a series. */
export type SilhouetteKind = SeriesKind | "none";

/** The silhouette a chart shows, and whether it is fading out. */
export interface SilhouetteState {
  kind: SilhouetteKind;
  leaving: boolean;
}

/** How long the silhouette fades out and the course in, in ms - the
    `--u-duration-medium` that `--uc-fade` in charts.css falls back on. */
const FADE = 240;

/** The band's width and speed. A speed, not core's `--u-duration-shimmer`: a
    duration would race over a wide chart and crawl over a narrow one - the
    user's pick in chart-loading 01. */
const BAND = 220;
const SPEED = 240;
/** The share of a cycle the band sweeps; the rest it waits out of sight -
    the 80 % of `uc-silhouette-sweep` in charts.css. */
const SWEEP = 0.8;
/** Air between the shapes and the frame. */
const AIR = 6;

type Shape = "columns" | "wave" | "filled" | "strips";

function shapeOf(kind: SilhouetteKind): Shape {
  switch (kind) {
    case "bar":
    case "box":
      return "columns";
    case "line":
    case "scatter":
      return "wave";
    case "area":
      return "filled";
    default:
      return "strips";
  }
}

const HEIGHTS = [0.62, 0.8, 0.48, 0.9, 0.7, 0.56, 0.84, 0.66, 0.42, 0.76, 0.58, 0.88, 0.5, 0.72, 0.64, 0.8, 0.54, 0.7];

function columns(w: number, h: number): ReactNode {
  const n = Math.max(6, Math.min(18, Math.round(w / 34)));
  const step = w / n;
  const width = Math.min(step * 0.6, 36);
  return HEIGHTS.slice(0, n).map((f, i) => {
    const top = h - f * h * 0.86;
    return <rect key={i} x={i * step + (step - width) / 2} y={top} width={width} height={h - top} rx={4} fill="white" />;
  });
}

function wave(w: number, h: number): string {
  const points: string[] = [];
  for (let x = 6; x <= w - 6; x += 6) {
    const t = x / w;
    const y = h * (0.5 + 0.17 * Math.sin(t * Math.PI * 2 * 1.15 + 0.6) + 0.06 * Math.sin(t * Math.PI * 2 * 3.1));
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return points.join(" ");
}

function shapes(shape: Shape, w: number, h: number): ReactNode {
  if (shape === "columns") return columns(w, h);
  if (shape === "strips") {
    return [0.25, 0.5, 0.75, 1].map((f) => <rect key={f} y={Math.min(h * f, h - 2)} width={w} height={2} rx={1} fill="white" />);
  }
  const points = wave(w, h);
  return (
    <>
      {shape === "filled" && <polygon points={`6,${h} ${points} ${w - 6},${h}`} fill="white" fillOpacity={0.4} />}
      <polyline points={points} fill="none" stroke="white" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

/** The silhouette while there is nothing to keep. When the answer is laid
    out it stays for its fade, the course fading in beneath it; under reduced
    motion it goes at once. */
export function useSilhouette(scene: ChartScene): SilhouetteState | null {
  const kind = useSyncExternalStore(
    scene.subscribeLayout,
    () => scene.getLayoutSnapshot().silhouette,
    () => null,
  );
  const [state, setState] = useState<SilhouetteState | null>(null);
  if (kind !== null && (state === null || state.leaving || state.kind !== kind)) {
    setState({ kind, leaving: false });
  } else if (kind === null && state !== null && !state.leaving) {
    setState({ ...state, leaving: true });
  }
  const leaving = state?.leaving === true;
  useEffect(() => {
    if (!leaving) return;
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
    const timer = setTimeout(() => setState(null), still ? 0 : FADE);
    return () => clearTimeout(timer);
  }, [leaving]);
  return state;
}

export function Silhouette({ kind, plot, leaving }: SilhouetteState & { plot: Rect }): ReactNode {
  const id = useId();
  const shape = shapeOf(kind);
  const w = Math.max(0, plot.width - AIR * 2);
  const h = Math.max(0, plot.height - AIR * 2);
  const travel = w + BAND;
  return (
    <div
      className="uc-silhouette"
      data-shape={shape}
      data-leaving={leaving || undefined}
      aria-hidden="true"
      style={{ left: `${plot.x + AIR}px`, top: `${plot.y + AIR}px`, width: `${w}px`, height: `${h}px` }}
    >
      <svg width={w} height={h}>
        <defs>
          {/* On the band's own coordinates: it starts left of the plot. */}
          <linearGradient id={`${id}band`} gradientUnits="userSpaceOnUse" x1={-BAND} x2={0} y1={0} y2={0}>
            <stop offset="0" className="uc-silhouette-glint" stopOpacity={0} />
            <stop offset="0.5" className="uc-silhouette-glint" stopOpacity={0.9} />
            <stop offset="1" className="uc-silhouette-glint" stopOpacity={0} />
          </linearGradient>
          {/* White is the mask's full strength, not a colour anyone sees. */}
          <mask id={`${id}shapes`} maskUnits="userSpaceOnUse" x={0} y={0} width={w} height={h}>
            {shapes(shape, w, h)}
          </mask>
        </defs>
        <g mask={`url(#${id}shapes)`}>
          <rect className="uc-silhouette-ground" width={w} height={h} />
          <rect
            className="uc-silhouette-band"
            x={-BAND}
            width={BAND}
            height={h}
            fill={`url(#${id}band)`}
            style={{ "--uc-travel": `${travel}px`, animationDuration: `${travel / SPEED / SWEEP}s` } as CSSProperties}
          />
        </g>
      </svg>
    </div>
  );
}
