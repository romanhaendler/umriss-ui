import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import styles from "./Layout.module.css";

/** A step of the spacing scale, from 1 (4 px) to 8 (40 px) - the tokens
    `--u-space-1` to `--u-space-8`. */
export type SpaceStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const gapVar = (step: SpaceStep) => `var(--u-space-${step})`;

/* ------------------------------------------------------------------ */
/* Stack – flex primitive with token spacing                           */
/* ------------------------------------------------------------------ */

/** The props of `Stack`. */
export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /** Below one another or beside one another. Below is the direction content
      stands in anyway, without being asked. */
  direction?: "row" | "column";
  /** Spacing as a step of the 4 px spacing steps (1–8). */
  gap?: SpaceStep;
  /** Alignment across the direction – `alignItems` unchanged. */
  align?: CSSProperties["alignItems"];
  /** Distribution along the direction – `justifyContent` unchanged. */
  justify?: CSSProperties["justifyContent"];
  /** Lets the children wrap when the line does not suffice. */
  wrap?: boolean;
}

/** Children below or beside one another, spaced by a step of the spacing
    scale. */
export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  { direction = "column", gap = 3, align, justify, wrap = false, className, style, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx(styles.stack, className)}
      style={{
        flexDirection: direction,
        gap: gapVar(gap),
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? "wrap" : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Grid – a grid with a fixed column count or responsive auto-fit      */
/* ------------------------------------------------------------------ */

/** The props of `Grid`. */
export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** Fixed column count; overridden by minItemWidth. */
  columns?: number;
  /** Responsive: as many columns as fit at this minimum width. */
  minItemWidth?: string;
  /** Spacing as a step of the 4 px spacing steps (1–8); applies in both
      directions. */
  gap?: SpaceStep;
}

/** Children in a grid: a fixed number of columns, or as many as fit at
    `minItemWidth`. */
export const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid(
  { columns = 2, minItemWidth, gap = 4, className, style, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx(styles.grid, className)}
      style={{
        gridTemplateColumns: minItemWidth
          ? `repeat(auto-fit, minmax(min(${minItemWidth}, 100%), 1fr))`
          : `repeat(${columns}, minmax(0, 1fr))`,
        gap: gapVar(gap),
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
});
