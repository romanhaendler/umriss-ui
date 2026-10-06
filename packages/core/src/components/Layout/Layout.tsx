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
/* Grid – a fixed column count, columns of their own widths, or        */
/* responsive auto-fit                                                 */
/* ------------------------------------------------------------------ */

/* A share of the rest that a long line cannot widen - a count's columns and
   a "fill" are the same track. */
const FILL = "minmax(0, 1fr)";

/** The width of one column in `Grid`'s list: a number in pixels, or
    `"fill"` for a share of what the other columns leave. */
export type GridColumnWidth = number | "fill";

/** The props of `Grid`. */
export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** How many columns, all of one width - or a list with one width per
      column: a number in pixels, or `"fill"` for a share of what is left.
      Overridden by minItemWidth. */
  columns?: number | readonly GridColumnWidth[];
  /** Responsive: as many columns as fit at this minimum width; wins over
      `columns`, a list included. */
  minItemWidth?: string;
  /** Spacing as a step of the 4 px spacing steps (1–8); applies in both
      directions. */
  gap?: SpaceStep;
}

/** Children in a grid: a fixed number of columns, a list of column widths,
    or as many columns as fit at `minItemWidth`. */
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
          : typeof columns === "number"
            ? `repeat(${columns}, ${FILL})`
            : columns.map((width) => (width === "fill" ? FILL : `${width}px`)).join(" "),
        gap: gapVar(gap),
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
});
