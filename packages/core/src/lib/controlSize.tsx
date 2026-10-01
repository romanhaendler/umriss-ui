/* One size for the controls in a place (control-sizes 01, ADR-0041).

   A control with two heights takes `size`, `sm` or `md`. A container that sets
   one size for everything in it - @umriss-ui/table's toolbar - says it once
   with `ControlSizeProvider`, and every control inside takes it unless it says
   its own. Without a provider a control is `md`, as it always was.

   A surface of its own starts without it: a popover, a dialog, a tooltip, a
   toast. React carries a context through a portal, and a dialog opened from a
   small toolbar would otherwise have taken small buttons - the size belongs to
   the place, not to whatever was opened from it. */

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

/** The two heights of a control: `sm` for a toolbar and dense forms, `md`
    otherwise. */
export type ControlSize = "sm" | "md";

const ControlSizeContext = createContext<ControlSize | null>(null);

export interface ControlSizeProviderProps {
  /** The size of every control inside that does not say its own. */
  size: ControlSize;
  /** The place the size holds for. */
  children: ReactNode;
}

/** Sets the size of the controls inside it - every control with `size` takes
    it unless it says its own. A popover, dialog, tooltip or toast opened from
    inside starts without it. */
export function ControlSizeProvider({ size, children }: ControlSizeProviderProps) {
  return <ControlSizeContext.Provider value={size}>{children}</ControlSizeContext.Provider>;
}

/** Where a surface of its own begins: no size from the place it was opened
    from. */
export function SurfaceSizeReset({ children }: { children: ReactNode }) {
  return <ControlSizeContext.Provider value={null}>{children}</ControlSizeContext.Provider>;
}

/** A control's size: its own, else the provider's around it, else `md`. */
export function useControlSize(own: ControlSize | undefined): ControlSize {
  const around = useContext(ControlSizeContext);
  return own ?? around ?? "md";
}
