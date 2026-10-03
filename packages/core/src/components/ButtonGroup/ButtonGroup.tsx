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
import { ControlSizeProvider, useControlSize } from "../../lib/controlSize";
import { Button } from "../Button";
import type { ButtonProps, ButtonSize, ButtonVariant } from "../Button";
import { Menu } from "../Menu";
import styles from "./ButtonGroup.module.css";
import { useWording } from "../../lib/language";

/** The props of `ButtonGroup`. */
export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Label of the group for the screen reader. */
  "aria-label"?: string;
  /** The size of the buttons in it that do not say their own - one group,
      one height.
      @default the size around it, else `"md"` */
  size?: ButtonSize;
}

/** Buttons standing side by side as one control: square inside, rounded
    outside, a hairline between them. `size` sets one height for all. */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { size, className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} role="group" className={cx(styles.group, className)} {...rest}>
      {size ? <ControlSizeProvider size={size}>{children}</ControlSizeProvider> : children}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* SplitButton                                                         */
/* ------------------------------------------------------------------ */

/** The props of `SplitButton`: a `Button`'s for the main action, plus the
    menu's entries. */
export interface SplitButtonProps extends Omit<ButtonProps, "children" | "size" | "variant"> {
  /** Label of the main action. */
  children: ReactNode;
  /** The main action. */
  onClick?: ButtonProps["onClick"];
  /** Entries of the menu - typically `MenuItem`. */
  menu: ReactNode;
  /** How loud the main action is; the trigger beside it follows suit. */
  variant?: ButtonVariant;
  /** `sm` for buttons in header bars and table rows, `md` otherwise.
      @default the size around it, else `"md"` */
  size?: ButtonSize;
  /** Label of the trigger.
      @default the wording's "More actions" */
  menuLabel?: string;
  /** Alignment of the menu relative to the trigger. */
  align?: "start" | "end";
}

/** A main action with a menu of its variants: the button on the left runs
    `onClick`, the arrow on the right opens `menu`. The ref goes to the main
    button. */
export const SplitButton = forwardRef<HTMLButtonElement, SplitButtonProps>(function SplitButton(
  {
    children,
    menu,
    variant = "secondary",
    size: ownSize,
    menuLabel,
    align = "end",
    disabled,
    className,
    ...rest
  },
  ref,
) {
  const wording = useWording();
  const size = useControlSize(ownSize);
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
            <svg viewBox="0 0 10 6" aria-hidden="true" className={styles.arrow}>
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
