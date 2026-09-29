import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { Spinner } from "../Spinner";
import { Tooltip } from "../Tooltip";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "plain" | "danger";
export type ButtonSize = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** How loud the button is. `primary` exactly once per surface - two main
      actions side by side are no longer a main action. `ghost` is quiet in the
      accent, `plain` quiet and neutral. */
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
      {loading && <Spinner className={styles.spinner} />}
      <span className={styles.label}>{children}</span>
    </button>
  );
});

export interface IconButtonProps
  extends Omit<ButtonProps, "aria-label" | "aria-labelledby" | "title" | "children"> {
  /** The name: what a screen reader announces and the tooltip shows. Required -
      an icon alone names nothing. */
  "aria-label": string;
  /** The icon: an SVG, a glyph of the set or an icon font's element. The
      button sets its size - `--u-icon-size`, `--u-icon-size-sm` at `sm`. */
  children: ReactNode;
  /** How loud the button is; `plain` is quiet and neutral, and the rest mean
      what they mean on a `Button`. Default: `plain` */
  variant?: ButtonVariant;
}

/** A button that shows only an icon: square, named by its `aria-label`, and
    that name shown as a tooltip. Everything else is a `Button`'s. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant = "plain", className, ...rest },
  ref,
) {
  return (
    <Tooltip content={rest["aria-label"]}>
      <Button ref={ref} variant={variant} className={cx(styles.square, className)} {...rest} />
    </Tooltip>
  );
});
