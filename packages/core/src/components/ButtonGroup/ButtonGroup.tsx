/* A contiguous group of buttons, and the split button.

   The group turns buttons standing side by side into one control: square
   inside, rounded outside, a hairline instead of a gap between them.

   The split button is that group with two fixed roles: the main action on the
   left, the trigger for its variants on the right. It opens the existing menu -
   anchoring, dismissing, outside clicks and returning focus all come from the
   popover seam and are not rebuilt here. */

import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";
import { Button } from "../Button";
import type { ButtonProps, ButtonSize, ButtonVariant } from "../Button";
import { Menu } from "../Menu";
import styles from "./ButtonGroup.module.css";
import { useWording } from "../../lib/language";

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Label of the group for the screen reader. */
  "aria-label"?: string;
}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} role="group" className={cx(styles.group, className)} {...rest}>
      {children}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* SplitButton                                                         */
/* ------------------------------------------------------------------ */

export interface SplitButtonProps extends Omit<ButtonProps, "children" | "size" | "variant"> {
  /** Label of the main action. */
  children: ReactNode;
  /** The main action. */
  onClick?: ButtonProps["onClick"];
  /** Entries of the menu - typically `MenuItem`. */
  menu: ReactNode;
  /** How loud the main action is; the trigger beside it follows suit. */
  variant?: ButtonVariant;
  /** `sm` for buttons in header bars and table rows, `md` otherwise. */
  size?: ButtonSize;
  /** Label of the trigger; default "More actions". */
  menuLabel?: string;
  /** Alignment of the menu relative to the trigger. */
  align?: "start" | "end";
}

export const SplitButton = forwardRef<HTMLButtonElement, SplitButtonProps>(function SplitButton(
  {
    children,
    menu,
    variant = "secondary",
    size = "md",
    menuLabel,
    align = "end",
    disabled,
    className,
    ...rest
  },
  ref,
) {
  const wording = useWording();
  return (
    <ButtonGroup className={cx(styles.split, className)}>
      <Button ref={ref} variant={variant} size={size} disabled={disabled} {...rest}>
        {children}
      </Button>
      <Menu
        align={align}
        trigger={
          <Button
            variant={variant}
            size={size}
            disabled={disabled}
            aria-label={menuLabel ?? wording.moreActions}
            className={styles.trigger}
          >
            <svg viewBox="0 0 10 6" width="9" height="6" aria-hidden="true" className={styles.arrow}>
              <path
                d="M1 1.2 5 4.8 9 1.2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        }
      >
        {menu}
      </Menu>
    </ButtonGroup>
  );
});
