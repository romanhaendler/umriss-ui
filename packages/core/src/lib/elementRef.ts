/* The ref an element carries - in one place.

   Tooltip and Menu clone their trigger and set a ref of their own; the
   caller's ref on that trigger has to keep its element beside it. React 19
   keeps an element's ref among its props, and reading it anywhere else warns.

   Internal. */

import type { ReactElement, Ref } from "react";

export function elementRef<T>(element: ReactElement): Ref<T> | undefined {
  return (element.props as { ref?: Ref<T> }).ref;
}
