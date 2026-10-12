/* The `ref` of a component that takes it as a prop - in one place.

   A component's props type extends `RefProp<Element>`, with the element the
   pass-through guard names as its root, and the function reads `ref` with the
   rest of its props. The description below is the one every props table and
   `API.md` shows. */

import type { Ref } from "react";

/** The `ref` of a component: the element it renders at its root. */
export interface RefProp<E extends Element> {
  /** Receives the component's root element. */
  ref?: Ref<E>;
}
