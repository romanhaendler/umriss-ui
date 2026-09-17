import type { HTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import styles from "./Badge.module.css";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** What the badge stands for. There is always a word beside it: a colour on
      its own is not a statement. */
  tone?: BadgeTone;
  /** Fully rounded pill shape - for counters and key figures. The default is
      the slightly rounded badge shape for status labels. */
  pill?: boolean;
}

/** Compact status label; as a `pill` for counters. */
export function Badge({ tone = "neutral", pill = false, className, children, ...rest }: BadgeProps) {
  return (
    <span className={cx(styles.badge, pill && styles.pill, styles[tone], className)} {...rest}>
      {children}
    </span>
  );
}
