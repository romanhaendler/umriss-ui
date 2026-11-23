/* The root provider's context - kept apart from index.tsx.

   index.tsx is the public export: what stands there stands in the bundle. Here
   stands what only the library itself reads. For density, a component has to
   be able to tell whether anybody set a density - the table is compact of its
   own accord and must not be pulled to "regular" by a provider that is silent
   about density. `useDensity()` returns `undefined` then. */

import { createContext, useContext } from "react";
import type { UmrissConfig } from "./index";

export type UmrissContextValue = UmrissConfig;

/* null means "no provider" - the default does not live in the context, so that
   the hooks can tell the two cases apart. */
export const UmrissContext = /* @__PURE__ */ createContext<UmrissContextValue | null>(null);

/**
 * A component's `density`: its own value, else the density the provider
 * explicitly configured, else its own default.
 */
export function useDensityFor(
  own: "regular" | "compact" | undefined,
  fallback: "regular" | "compact",
): "regular" | "compact" {
  const value = useContext(UmrissContext);
  if (own !== undefined) return own;
  return value?.density ?? fallback;
}
