import type { SVGAttributes } from "react";
import { cx } from "../../lib/cx";
import styles from "./Spinner.module.css";
import { useWording } from "../../lib/language";

export interface SpinnerProps extends SVGAttributes<SVGSVGElement> {
  /** Edge length in pixels. */
  size?: number;
}

/** Restrained loading indicator; inherits the text colour of its context. */
export function Spinner({ size = 14, className, ...rest }: SpinnerProps) {
  const wording = useWording();
  return (
    <svg
      className={cx(styles.spinner, className)}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      role="status"
      aria-label={wording.loading}
      {...rest}
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M14.5 8A6.5 6.5 0 0 0 8 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
