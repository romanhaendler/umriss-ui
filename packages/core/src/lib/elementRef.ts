/* The ref an element carries - in one place.

   Tooltip and Menu clone their trigger and set a ref of their own; the
   caller's ref on that trigger has to keep its element beside it. React 19
   hands an element's ref among its props, React 18 beside them - and 19 warns
   when it is read from the old place, so the place is chosen by the version
   and not tried.

   Internal. */

import { version } from "react";
import type { ReactElement, Ref } from "react";

const REF_IN_PROPS = Number(version.split(".")[0]) >= 19;

export function elementRef<T>(element: ReactElement): Ref<T> | undefined {
  return REF_IN_PROPS
    ? (element.props as { ref?: Ref<T> }).ref
    : (element as unknown as { ref?: Ref<T> }).ref;
}
