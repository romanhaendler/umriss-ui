/* A dividing line as a layout primitive, beside Stack and Grid.

   Without a label it is decorative and taken out of the accessibility tree;
   with a label it really separates something and becomes a named
   separator. */

import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";
import type { RefProp } from "../../lib/refProp";
import styles from "./Divider.module.css";

/** The props of `Divider`. */
export interface DividerProps extends HTMLAttributes<HTMLDivElement>, RefProp<HTMLDivElement> {
  /** Horizontally it separates rows, vertically it separates columns. */
  orientation?: "horizontal" | "vertical";
  /** A stronger line - for section boundaries rather than row separation. */
  strong?: boolean;
  /** A label in the middle. It makes the line a named separator. */
  label?: ReactNode;
}

/** A line between rows or columns; with `label` a named separator. */
export function Divider({ ref, orientation = "horizontal", strong = false, label, className, ...rest }: DividerProps) {
  const shared = cx(
    styles.divider,
    orientation === "vertical" ? styles.vertical : styles.horizontal,
    strong && styles.strong,
    className,
  );

  if (label === undefined) {
    return (
      /* Without a label the line carries no statement: then it is decorative
         and *not* a separator. To claim both at once - `role="separator"` and
         `aria-hidden` - contradicts itself. */
      <div ref={ref} aria-hidden="true" className={shared} {...rest} />
    );
  }

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      className={cx(shared, styles.withLabel)}
      {...rest}
    >
      <span className={styles.label}>{label}</span>
    </div>
  );
}
