/* The root provider's context - kept apart from index.tsx.

   index.tsx is the public export: what stands there stands in the bundle. Here
   stands what only the library itself reads. The occasion was density
   (library-audit 07): a component has to be able to tell whether a provider
   SAYS "comfortable" or whether nobody said anything - the alarm list is
   compact of its own accord and must not be pulled to "regular" by a provider
   that is silent about density. `useDensity()` returns "comfortable" in both
   cases and stays as it is. */

import { createContext, useContext } from "react";
import type { UmrissConfig } from "./index";

export interface UmrissContextValue extends UmrissConfig {
  /** Has the provider explicitly configured a density? */
  densityGiven: boolean;
}

/* null means "no provider" - the default does not live in the context, so that
   the hooks can tell the two cases apart. */
export const UmrissContext = createContext<UmrissContextValue | null>(null);

/**
 * A component's `density`: its own value, else the density the provider
 * explicitly configured, else its own default.
 *
 * "comfortable" means "regular" here. A compact set of tokens does not exist -
 * that is work package B.13; here only what exists is wired up.
 */
export function useDensityFor(
  own: "regular" | "compact" | undefined,
  fallback: "regular" | "compact",
): "regular" | "compact" {
  const value = useContext(UmrissContext);
  if (own !== undefined) return own;
  if (!value?.densityGiven) return fallback;
  return value.density === "compact" ? "compact" : "regular";
}
