import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cx } from "../../lib/cx";
import { Spinner } from "../Spinner";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** How loud the button is. `primary` exactly once per surface - two main
      actions side by side are no longer a main action. */
  variant?: ButtonVariant;
  /** `sm` for buttons in header bars and table rows, `md` otherwise. */
  size?: ButtonSize;
  /** Shows a loading indicator and locks the button. */
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", loading = false, disabled, className, children, type, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cx(styles.button, styles[variant], styles[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner size={size === "sm" ? 12 : 14} className={styles.spinner} />}
      <span className={styles.label}>{children}</span>
    </button>
  );
});
