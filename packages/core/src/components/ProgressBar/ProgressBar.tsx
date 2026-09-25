import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import { useFormats, useWording } from "../../lib/language";
import { clampFraction, percentDisplay } from "../DataViz/scale";
import styles from "./ProgressBar.module.css";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** How far the task has come, from 0 to 1. Left out, the bar is
      indeterminate: the task runs, and nobody knows how far it is. */
  value?: number;
  /**
   * What is progressing, e.g. "Import of the batch records". A progress bar
   * needs a name from the author; without one the general term stands here.
   */
  label?: string;
  /** What a screen reader says instead of the percentage, where a count says
      it better - "3 of 12 pallets". */
  valueText?: string;
  /** The percentage beside the bar (Geist Mono). Never for an indeterminate
      bar - it has no figure to show. */
  showLabel?: boolean;
}

/* How far a task has come - and nothing more. It is not a `Meter`: a meter
   reads a measured value against limits and takes its colour from that
   verdict, a progress bar only counts towards an end and has no tone at all.
   A batch that is 90 per cent done is not a warning. (CONTEXT.md, Progress.) */
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(function ProgressBar(
  { value, label, valueText, showLabel = false, className, ...rest },
  ref,
) {
  const formats = useFormats();
  const wording = useWording();
  const determinate = value !== undefined;
  const fraction = determinate ? clampFraction(value) : 0;

  return (
    <div
      ref={ref}
      aria-label={rest["aria-labelledby"] ? undefined : (label ?? wording.progress)}
      className={cx(styles.progress, className)}
      {...rest}
      /* After `rest`: the role and the values are what the bar shows (P3 of
         core-passthrough). */
      role="progressbar"
      aria-valuemin={determinate ? 0 : undefined}
      aria-valuemax={determinate ? 100 : undefined}
      aria-valuenow={determinate ? percentDisplay(fraction) : undefined}
      aria-valuetext={determinate ? valueText : undefined}
      data-indeterminate={determinate ? undefined : ""}
    >
      <span className={styles.track}>
        <span
          className={cx(styles.fill, !determinate && styles.sweep)}
          style={determinate ? { width: `${fraction * 100}%` } : undefined}
        />
      </span>
      {showLabel && determinate && <span className={styles.label}>{formats.percent(fraction)}</span>}
    </div>
  );
});
