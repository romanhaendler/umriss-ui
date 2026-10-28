/* The wording for every chart below it (ADR-0031). A chart merges the English
   default, then this, then its own `wording` prop. */

import { createContext, type ReactNode } from "react";
import type { ChartsWording } from "./wording";

export const ChartsWordingContext = /* @__PURE__ */ createContext<Partial<ChartsWording> | undefined>(undefined);

/** The props of `ChartsWordingProvider`. */
export interface ChartsWordingProviderProps {
  /** Entries left out stay English. German: `GERMAN_CHARTS_WORDING` from
      `@umriss-ui/charts/wording/de`. A chart's own `wording` wins over it. */
  wording: Partial<ChartsWording>;
  children?: ReactNode;
}

/** Sets the wording of every chart below it, also one inside another package's widget. */
export function ChartsWordingProvider({ wording, children }: ChartsWordingProviderProps) {
  return <ChartsWordingContext.Provider value={wording}>{children}</ChartsWordingContext.Provider>;
}
