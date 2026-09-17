import type { HTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import { clampFraction, percentDisplay } from "./scale";
import styles from "./DataViz.module.css";
import { useFormats, useWording } from "../../lib/language";

export type MeterTone = "neutral" | "accent" | "success" | "warning" | "danger";

export interface MeterProps extends HTMLAttributes<HTMLSpanElement> {
  /** Fill level from 0 to 1. */
  value: number;
  /** The colour of the bar. It comes from an assessment and not from taste:
      beside the bar there is always the number or a word, so that the colour
      is never the only statement. */
  tone?: MeterTone;
  /** The percentage to the right of the bar (Geist Mono). */
  showLabel?: boolean;
  /**
   * What is being measured, e.g. "Utilisation".
   *
   * A role of `meter` needs a name from the author - the visible percentage
   * inside it does not count for that, and neither does the column heading
   * beside it. Without a value the general term stands here; whoever knows
   * what the bar measures says it better.
   */
  label?: string;
}

/** A narrow fill-level bar, e.g. for utilisation in table cells. */
export function Meter({
  value,
  tone = "accent",
  showLabel = true,
  label,
  className,
  ...rest
}: MeterProps) {
  const formats = useFormats();
  const wording = useWording();
  const fraction = clampFraction(value);

  return (
    <span
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentDisplay(value)}
      aria-label={rest["aria-labelledby"] ? undefined : (label ?? wording.fillLevel)}
      className={cx(styles.meter, className)}
      {...rest}
    >
      <span className={styles.track}>
        <span className={cx(styles.fill, styles[tone])} style={{ width: `${fraction * 100}%` }} />
      </span>
      {showLabel && <span className={styles.meterLabel}>{formats.percent(fraction)}</span>}
    </span>
  );
}
