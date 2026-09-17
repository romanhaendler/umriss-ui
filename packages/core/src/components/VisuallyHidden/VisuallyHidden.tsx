/* Text that only the screen reader hears.

   Accessibility is part of the Definition of Done, and the technique for it
   has so far been derived anew in every project. It is simple enough to get
   wrong: `display: none` takes the text out of the accessibility tree, and a
   shift by -9999px scrolls the page sideways in right-to-left contexts.

   With `focusable` the content becomes visible as soon as it receives the
   focus - that is how a skip link works. */

import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ElementType, ForwardedRef } from "react";
import { cx } from "../../lib/cx";
import styles from "./VisuallyHidden.module.css";

/* Polymorphic, because the most important case is a skip link: `as="a"`
   needs `href`, and without the attributes of the chosen element it is
   exactly that one which could not be built. */
export type VisuallyHiddenProps<E extends ElementType = "span"> = {
  /** Element to render as. Default `span`. */
  as?: E;
  /** Becomes visible as soon as the content receives the focus (skip link). */
  focusable?: boolean;
} & Omit<ComponentPropsWithoutRef<E>, "as">;

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
