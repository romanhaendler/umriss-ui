/* The size of a table toolbar's controls: `Toolbar` says it once, and every
   part the table puts into it - search, column menu, export, "reset", the bulk
   actions, "new row" - stands at it, unless the part says its own. Outside a
   toolbar the parts are `sm`, as they always were. */

import { createContext, useContext } from "react";

export type ToolbarSize = "sm" | "md";

export const ToolbarSizeContext = createContext<ToolbarSize>("sm");

/** The part's own size, or the toolbar's around it. */
export function useToolbarSize(own?: ToolbarSize): ToolbarSize {
  const around = useContext(ToolbarSizeContext);
  return own ?? around;
}
