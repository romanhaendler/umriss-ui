import type { HTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import type { RefProp } from "../../lib/refProp";
import styles from "./Skeleton.module.css";

/** The props of `Skeleton`. */
export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement>, RefProp<HTMLSpanElement> {
  /** Width, e.g. "120px" or "60%".
      @default "100%" */
  width?: string | number;
  /** Height, e.g. "12px" or 16.
      @default "12px" */
  height?: string | number;
  /** Circular shape, e.g. for an avatar placeholder. */
  circle?: boolean;
}

/** Loading placeholder with a restrained pulse; respects prefers-reduced-motion. */
export function Skeleton({ ref, width, height, circle = false, className, style, ...rest }: SkeletonProps) {
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cx(styles.skeleton, circle && styles.circle, className)}
      style={{ width, height, ...style }}
      {...rest}
    />
  );
}
