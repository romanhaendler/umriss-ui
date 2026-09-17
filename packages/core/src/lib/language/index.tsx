/* The seam at which formatting and wording become exchangeable.

   The rule that governs everything else: without a provider every component
   behaves as it did before. The context has `null` as its base value, and the
   hook then returns the defaults - no provider needed, no warning, no
   difference. A library whose components work one by one can be introduced
   component by component, and that is worth more than the slightly shorter
   code a mandatory provider would give.

   Overriding is entry by entry. Whoever passes `{ wording: { clear: "Clear" } }`
   changes exactly that one entry; everything else stays German. A missing entry
   falls back on the default and never on an empty text or a key name - that is
   the difference between an incomplete translation and a broken surface. */

import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { DEFAULT_FORMATS } from "./formats";
import type { Formats } from "./formats";
import { DEFAULT_WORDING } from "./wording";
import type { Wording } from "./wording";

export { DEFAULT_FORMATS } from "./formats";
export type { Formats } from "./formats";
export { DEFAULT_WORDING } from "./wording";
export type { Wording } from "./wording";

/** What an application can pass in for formatting and wording. */
export interface LanguageOptions {
  /** How numbers, dates and durations are written. Overridden entry by entry;
      what is left out keeps writing as `DEFAULT_FORMATS` does - in `de-DE`,
      whatever the wording says (ADR-0019). */
  formats?: Partial<Formats>;
  /** The presets are a register of their own and are likewise overridden entry
      by entry. */
  wording?: Partial<Omit<Wording, "presets">> & { presets?: Partial<Wording["presets"]> };
}

export interface Language {
  formats: Formats;
  wording: Wording;
}

export const DEFAULT_LANGUAGE: Language = {
  formats: DEFAULT_FORMATS,
  wording: DEFAULT_WORDING,
};

/* null means "no provider". The default does not live in the context, so that
   `useContext` can tell the two cases apart - and so that a provider passing
   nothing does not do the same work twice. */
const LanguageContext = createContext<Language | null>(null);

/** Builds a complete instance from the default and a partial value. */
export function mergeLanguage(optionen: LanguageOptions | undefined): Language {
  if (!optionen) return DEFAULT_LANGUAGE;
  const { presets, ...wortlautRest } = optionen.wording ?? {};
  return {
    formats: optionen.formats ? { ...DEFAULT_FORMATS, ...optionen.formats } : DEFAULT_FORMATS,
    wording: optionen.wording
      ? {
          ...DEFAULT_WORDING,
          ...wortlautRest,
          presets: presets ? { ...DEFAULT_WORDING.presets, ...presets } : DEFAULT_WORDING.presets,
        }
      : DEFAULT_WORDING,
  };
}

export interface LanguageProviderProps extends LanguageOptions {
  children: ReactNode;
}

/**
 * Sets formatting and wording for the subtree below. Used by the root provider,
 * and usable directly for a section as well.
 */
export function LanguageProvider({ formats, wording, children }: LanguageProviderProps) {
  const value = useMemo(() => mergeLanguage({ formats, wording }), [formats, wording]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/** Formatting and wording together; without a provider, the defaults. */
export const useLanguage = (): Language => useContext(LanguageContext) ?? DEFAULT_LANGUAGE;

/** Only the formatting. */
export const useFormats = (): Formats => useLanguage().formats;

/** Only the wording. */
export const useWording = (): Wording => useLanguage().wording;

/* The two characters a notation separates with, for a caller who replaced
   `number` and has to read its own output back (ADR-0024). */
export { separatorsOf, DEFAULT_SEPARATORS } from "./formats";
export type { Separators } from "./formats";
