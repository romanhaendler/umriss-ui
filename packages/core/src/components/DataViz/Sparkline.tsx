import { forwardRef, useId } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import { project } from "./scale";
import styles from "./DataViz.module.css";

export interface SparklineProps extends HTMLAttributes<HTMLSpanElement> {
  /** Values in chronological order; at least two. */
  data: readonly number[];
  /** Width in pixels. Default 96 - a row width, not a chart width. */
  width?: number;
  /** Height in pixels. Default 28 - as high as a table row. */
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

  const padding = 3;
  const points = project(data, width, height, padding);

  const line = points.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `M${padding},${height - padding} L${line.replace(/ /g, " L")} L${width - padding},${height - padding} Z`;
  const [endX, endY] = points[points.length - 1] ?? [0, 0];

  return (
    <span ref={ref} className={cx(styles.sparkline, tone === "accent" && styles.sparklineAccent, className)} {...rest}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
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
        />
        <circle cx={endX} cy={endY} r="2.2" className={styles.sparklineDot} />
      </svg>
    </span>
  );
});
