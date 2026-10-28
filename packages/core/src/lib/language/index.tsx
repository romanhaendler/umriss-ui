/* The seam at which formatting and wording become exchangeable.

   The rule that governs everything else: without a provider every component
   behaves the same. The context has `null` as its base value, and the
   hook then returns the defaults - no provider needed, no warning.

   Overriding is entry by entry. Whoever passes `{ wording: { clear: "Clear" } }`
   changes exactly that one entry; everything else stays as the default has it. A missing entry
   falls back on the default and never on an empty text or a key name - that is
   the difference between an incomplete translation and a broken surface. */

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { builtInInstants, DEFAULT_FORMATS, formatsFor, INSTANT_ENTRIES } from "./formats";
import type { Formats } from "./formats";
import { DEFAULT_WORDING } from "./wording";
import type { Wording } from "./wording";

export { DEFAULT_FORMATS, formatsFor, writeNumber } from "./formats";
export type { Formats, NumberFormat, NumberOptions } from "./formats";
export { DEFAULT_WORDING } from "./wording";
export type { Wording } from "./wording";

/** What an application can pass in for formatting and wording. */
export interface LanguageOptions {
  /** How numbers, dates and durations are written. Overridden entry by entry;
      what is left out keeps writing as `DEFAULT_FORMATS` does - in English
      notation, whatever the wording says (ADR-0024). */
  formats?: Partial<Formats>;
  /** The presets are a register of their own and are likewise overridden entry
      by entry. */
  wording?: Partial<Omit<Wording, "presets">> & { presets?: Partial<Wording["presets"]> };
}

/** A complete language: the formats for numbers and dates, and the wording. */
export interface Language {
  formats: Formats;
  wording: Wording;
}

/** English formats and English wording - what every component uses without a
    `LanguageProvider`. */
export const DEFAULT_LANGUAGE: Language = {
  formats: DEFAULT_FORMATS,
  wording: DEFAULT_WORDING,
};

/* null means "no provider". The default does not live in the context, so that
   `useContext` can tell the two cases apart - and so that a provider passing
   nothing does not do the same work twice. */
const LanguageContext = /* @__PURE__ */ createContext<Language | null>(null);

/** Builds a complete instance from the default and a partial value. */
export function mergeLanguage(options: LanguageOptions | undefined): Language {
  if (!options) return DEFAULT_LANGUAGE;
  const { presets, ...wordingRest } = options.wording ?? {};
  return {
    formats: options.formats ? mergeFormats(options.formats) : DEFAULT_FORMATS,
    wording: options.wording
      ? {
          ...DEFAULT_WORDING,
          ...wordingRest,
          presets: presets ? { ...DEFAULT_WORDING.presets, ...presets } : DEFAULT_WORDING.presets,
        }
      : DEFAULT_WORDING,
  };
}

/* Where the merged formats name a zone, every instant entry that is a built-in
   one - of any locale or zone - is replaced by the one built for this zone;
   an entry the application wrote stays its own. */
function mergeFormats(given: Partial<Formats>): Formats {
  const merged: Formats = { ...DEFAULT_FORMATS, ...given };
  if (merged.timeZone === undefined) return merged;
  // An unknown zone throws Intl's RangeError here.
  const zoned = formatsFor(merged.locale, merged.timeZone);
  const entries = merged as unknown as Record<string, unknown>;
  for (const name of INSTANT_ENTRIES) if (builtInInstants.has(merged[name])) entries[name] = zoned[name];
  return merged;
}

/** The props of `LanguageProvider`: the parts of the formats and the wording
    that differ from the default. */
export interface LanguageProviderProps extends LanguageOptions {
  children: ReactNode;
}

/**
 * Sets formatting and wording for the subtree below. Used by the root provider,
 * and usable directly for a section as well.
 */
export function LanguageProvider({ formats, wording, children }: LanguageProviderProps) {
  const value = useMemo(() => mergeLanguage({ formats, wording }), [formats, wording]);
  return <LanguageContext value={value}>{children}</LanguageContext>;
}

/** Formatting and wording together; without a provider, the defaults. */
export const useLanguage = (): Language => useContext(LanguageContext) ?? DEFAULT_LANGUAGE;

/* Until the page has hydrated the instants are written empty: the reader's
   time zone is known only in the browser, and a server's text for an instant
   would differ from the browser's (ADR-0076). The server snapshot is
   false and the client snapshot true, so a hydration renders once more right
   after and a client-only render never sees the empty set. */
const subscribeNever = () => () => {};
const useHydrated = (): boolean =>
  useSyncExternalStore(subscribeNever, () => true, () => false);

const noInstant = () => "";
/* One empty set per format set, so the formats' identity stays stable. */
const withoutInstants = /* @__PURE__ */ new WeakMap<Formats, Formats>();

function blankInstants(formats: Formats): Formats {
  let blank = withoutInstants.get(formats);
  if (!blank) {
    blank = { ...formats };
    for (const name of INSTANT_ENTRIES) (blank as unknown as Record<string, unknown>)[name] = noInstant;
    withoutInstants.set(formats, blank);
  }
  return blank;
}

/** Only the formatting. Without a named zone, dates and times are empty until
    the page has hydrated. A named zone does not depend on the reader, so the
    server writes every instant with it. */
export function useFormats(): Formats {
  const formats = useLanguage().formats;
  const hydrated = useHydrated();
  return hydrated || formats.timeZone !== undefined ? formats : blankInstants(formats);
}

/* A zone's name as Intl spells it, so that an alias compares equal. */
const canonical = (timeZone: string): string =>
  new Intl.DateTimeFormat("en", { timeZone }).resolvedOptions().timeZone;

/**
 * The name of the formats' time zone, for a view that shows instants: set when
 * the formats name a zone, the page has hydrated, and the reader's own zone is
 * another; `null` otherwise. The reader's zone is known only in the browser,
 * so the server never writes it.
 */
export function useTimeZoneLabel(): string | null {
  const { timeZone, timeZoneName } = useLanguage().formats;
  const hydrated = useHydrated();
  return useMemo(() => {
    if (!hydrated || timeZone === undefined) return null;
    const reader = new Intl.DateTimeFormat().resolvedOptions().timeZone;
    return canonical(reader) === canonical(timeZone) ? null : timeZoneName(new Date());
  }, [hydrated, timeZone, timeZoneName]);
}

/** Only the wording. */
export const useWording = (): Wording => useLanguage().wording;

/* The two characters a notation separates with, for a caller who replaced
   `number` and has to read its own output back (ADR-0024). */
export { separatorsOf, DEFAULT_SEPARATORS } from "./formats";
export type { Separators } from "./formats";
