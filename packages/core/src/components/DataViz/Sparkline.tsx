import { forwardRef, useId } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import { project } from "./scale";
import styles from "./DataViz.module.css";

export interface SparklineProps extends HTMLAttributes<HTMLSpanElement> {
  /** Values in chronological order; at least two. */
  data: readonly number[];
  /** Width in pixels. Default 96 - a row width, not a chart width. `"fill"`
      takes the width of its container, as a tile's history does; the line
      keeps its stroke and the end point stays round. */
  width?: number | "fill";
  /** Height in pixels. Default 28 - as high as a table row. With `width`
      `"fill"` a stylesheet may set the height instead: the drawing follows
      its box. */
  height?: number;
  /** The line is ink, not meaning: `accent` only where exactly one line among
      several is to be emphasised. */
  tone?: "ink" | "accent";
}

/** A miniature trend line for table cells; the end point carries the accent. */
export const Sparkline = forwardRef<HTMLSpanElement, SparklineProps>(function Sparkline(
  { data, width = 96, height = 28, tone = "ink", className, ...rest },
  ref,
) {
  const id = useId();
  if (data.length < 2) return null;

  const fill = width === "fill";
  /* Filling, the drawing is stretched to its box in both directions: it is
     laid out on a field of 100 × 100 without padding, the stroke does not
     scale with it, and it may draw past its edge rather than be cut. The end
     point is no part of the stretched drawing: a circle there is pulled into
     an ellipse, and a round cap on a zero-length stroke was drawn stretched
     by Safari. It is an element of its own, set at the end in per cent. */
  const w = fill ? 100 : width;
  const h = fill ? 100 : height;
  const padding = fill ? 0 : 3;
  const points = project(data, w, h, padding);

  const line = points.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `M${padding},${h - padding} L${line.replace(/ /g, " L")} L${w - padding},${h - padding} Z`;
  const [endX, endY] = points[points.length - 1] ?? [0, 0];

  return (
    <span
      ref={ref}
      className={cx(styles.sparkline, fill && styles.sparklineFill, tone === "accent" && styles.sparklineAccent, className)}
      {...rest}
      style={fill ? { height, ...rest.style } : rest.style}
    >
      <svg
        width={fill ? "100%" : width}
        height={fill ? "100%" : height}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio={fill ? "none" : undefined}
        overflow={fill ? "visible" : undefined}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.14" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${id})`} />
        <polyline
          points={line}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect={fill ? "non-scaling-stroke" : undefined}
        />
        {!fill && <circle cx={endX} cy={endY} r="2.2" className={styles.sparklineDot} />}
      </svg>
      {fill && <span className={styles.sparklineEnd} style={{ left: `${endX}%`, top: `${endY}%` }} />}
    </span>
  );
});
