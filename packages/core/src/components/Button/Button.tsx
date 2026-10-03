import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { useControlSize } from "../../lib/controlSize";
import type { ControlSize } from "../../lib/controlSize";
import { Spinner } from "../Spinner";
import { Tooltip } from "../Tooltip";
import styles from "./Button.module.css";

/** How loud a button is: `primary` for the one main action, `secondary` by
    default, `ghost` quiet in the accent, `plain` quiet and neutral, `danger`
    for a destructive action. */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "plain" | "danger";
/** A button's two heights - the controls' (`ControlSize`). */
export type ButtonSize = ControlSize;

/** The props of `Button`: a native button's attributes and its look. */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** How loud the button is. `primary` exactly once per surface - two main
      actions side by side are no longer a main action. `ghost` is quiet in the
      accent, `plain` quiet and neutral. */
  variant?: ButtonVariant;
  /** `sm` for buttons in header bars and table rows, `md` otherwise. Default:
      the size of a `ControlSizeProvider` around it, else `md`. */
  size?: ButtonSize;
  /** Shows a loading indicator and locks the button. */
  loading?: boolean;
}

/** A button with a label. `primary` once per surface; `loading` shows a
    spinner and locks it. `type` is `button` unless you say otherwise. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size: ownSize, loading = false, disabled, className, children, type, ...rest },
  ref,
) {
  const size = useControlSize(ownSize);
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

/** The props of `IconButton`: a `Button`'s, with a required `aria-label` and
    the icon as its only child. */
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
