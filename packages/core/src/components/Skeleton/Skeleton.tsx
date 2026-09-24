import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import styles from "./Skeleton.module.css";

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  /** Width, e.g. "120px" or "60%". Default: 100 %. */
  width?: string | number;
  /** Height, default: 12px. */
  height?: string | number;
  /** Circular shape, e.g. for an avatar placeholder. */
  circle?: boolean;
}

/** Loading placeholder with a restrained pulse; respects prefers-reduced-motion. */
export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton(
  { width, height, circle = false, className, style, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cx(styles.skeleton, circle && styles.circle, className)}
      style={{ width, height, ...style }}
      {...rest}
    />
  );
});
