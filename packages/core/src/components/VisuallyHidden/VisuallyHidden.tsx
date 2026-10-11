/* Text that only the screen reader hears.

   `display: none` takes the text out of the accessibility tree, and a shift
   by -9999px scrolls the page sideways in right-to-left contexts.

   With `focusable` the content becomes visible as soon as it receives the
   focus - that is how a skip link works. */

import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ElementType, ForwardedRef } from "react";
import { cx } from "../../lib/cx";
import styles from "./VisuallyHidden.module.css";

/* Polymorphic, so that a skip link (`as="a"`) can take `href`. */
/** The props of `VisuallyHidden`: those of the element `as` names, `span` by
    default. */
export type VisuallyHiddenProps<E extends ElementType = "span"> = {
  /** Element to render as.
      @default "span" */
  as?: E;
  /** Becomes visible as soon as the content receives the focus (skip link). */
  focusable?: boolean;
} & Omit<ComponentPropsWithoutRef<E>, "as">;

/** Content for the screen reader only: out of sight, but read out. With
    `focusable` it shows once it has the focus - a skip link. */
export const VisuallyHidden = forwardRef(function VisuallyHidden<E extends ElementType = "span">(
  { as, focusable = false, className, children, ...rest }: VisuallyHiddenProps<E>,
  ref: ForwardedRef<HTMLElement>,
) {
  const Element = (as ?? "span") as ElementType;
  return (
    <Element
      ref={ref}
      className={cx(styles.hidden, focusable && styles.focusable, className)}
      {...rest}
    >
      {children}
    </Element>
  );
}) as <E extends ElementType = "span">(
  props: VisuallyHiddenProps<E> & { ref?: ForwardedRef<HTMLElement> },
) => React.ReactElement;
