/* One place where the library can be configured.

   It holds exactly five things: the theme, the density, the portal target for
   overlays, the setting for toasts, and the configuration of formats and
   wording. No more. The moment it can set the default variant of a button it
   is no longer a small decision but a second interface beside the components'
   own props - and two ways of saying the same thing are worse than one.

   The more important rule stands beside it: it is optional, and its absence is
   the tested normal case. Every component renders and behaves without it
   exactly as it does today. Once the provider exists the temptation grows to
   require it, because the code would be shorter with configuration always
   present. As long as there are users who do not use it, that is the wrong
   trade: a library whose components work one by one can be introduced
   component by component, and that is worth more than the shortening. */

import { useContext, useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { LanguageProvider } from "../language";
import type { LanguageOptions } from "../language";
import { UmrissContext } from "./context";
import type { UmrissContextValue } from "./context";

export type Theme = "light" | "dark" | "system";

/** How densely the library builds. A component with a density of its own
    takes it through `useDensityFor` as the default for its `density` - in
    @umriss-ui/table the table and the alarm list; a compact set of tokens
    exists only with work package B.13. */
export type Density = "comfortable" | "compact";

/**
 * Where overlays portal to.
 *
 * A function is evaluated on every opening - a target that only comes into the
 * tree later cannot be given otherwise. `null`, or a result of `null`, means
 * "as before".
 */
export type PortalTarget = HTMLElement | (() => HTMLElement | null) | null;

export interface ToastConfig {
  /** Display duration in ms, where the individual toast names none. */
  duration?: number;
}

export interface UmrissConfig {
  theme?: Theme;
  density: Density;
  portalTarget: PortalTarget;
  toast: ToastConfig;
}

const DEFAULTS: UmrissConfig = {
  theme: undefined,
  density: "comfortable",
  portalTarget: null,
  toast: {},
};

/* `useDensityFor` distinguishes "the provider says comfortable" from "nobody
   said anything". It used to be meant for the library itself only; the table
   moved to @umriss-ui/table and needs it from there (umriss-table 04). */
export { useDensityFor } from "./context";

/** The whole configuration; without a provider, the defaults. */
export const useUmriss = (): UmrissConfig => useContext(UmrissContext) ?? DEFAULTS;

/** The configured density; without a provider, "comfortable". */
export const useDensity = (): Density => useUmriss().density;

/** The setting for toasts; without a provider, empty. */
export const useToastConfig = (): ToastConfig => useUmriss().toast;

/**
 * Resolves the configured portal target.
 *
 * `null` means expressly "no statement" and not "to the body": the callers have
 * rules of their own that take precedence - the popover seam portals into the
 * nearest `<dialog>` ancestor, because a portal at the body does not reach the
 * top layer. That rule beats the setting; otherwise a panel inside a modal
 * would be invisible.
 */
export function usePortalTarget(): () => HTMLElement | null {
  const { portalTarget } = useUmriss();
  return useMemo(
    () => (typeof portalTarget === "function" ? portalTarget : () => portalTarget),
    [portalTarget],
  );
}

export interface UmrissProviderProps {
  /**
   * Sets `data-theme` at the root - the attribute the token layers already
   * listen to; nothing changes about the tokens themselves. "system" means
   * subscribe: a change at runtime is taken along. Without a value the provider
   * does not touch the attribute, so that an application setting its own theme
   * is left undisturbed.
   */
  theme?: Theme;
  /**
   * Sets `data-density` at the root and is the default for the `density` of
   * every component that reads it with `useDensityFor` - in @umriss-ui/table
   * `Table` and `AlarmList` ("comfortable" means "regular"). Without a value
   * the provider touches neither the attribute nor a component: one that is
   * compact of its own accord stays compact.
   */
  density?: Density;
  /**
   * Where overlays portal to. A function is evaluated on every opening - a
   * target that only enters the tree later cannot be given otherwise; `null`
   * means "as before". The callers' own rules take precedence: the popover
   * seam portals into the nearest `<dialog>` ancestor, because a portal at the
   * body does not reach the top layer.
   */
  portalTarget?: PortalTarget;
  /** The setting for toasts: the display duration where the individual toast
      names none. */
  toast?: ToastConfig;
  /** Formats and wording, entry by entry. See `lib/language`. */
  language?: LanguageOptions;
  /** The subtree the settings apply to. */
  children: ReactNode;
}

/** Sets `data-theme` and takes a system change along. */
function useThemeOnDocument(theme: Theme | undefined) {
  /* Whatever stood there before the provider is put back on teardown. Otherwise
     a provider mounted once would stay visible forever - in tests as a colour
     left over from the previous test. */
  const before = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    before.current = root.dataset.theme;

    const restore = () => {
      if (before.current === undefined) delete root.dataset.theme;
      else root.dataset.theme = before.current;
    };

    if (theme !== "system") {
      root.dataset.theme = theme;
      return restore;
    }

    /* Following means subscribing, not reading once. */
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      root.dataset.theme = query.matches ? "dark" : "light";
    };
    apply();
    query.addEventListener("change", apply);
    return () => {
      query.removeEventListener("change", apply);
      restore();
    };
  }, [theme]);
}

/** Sets `data-density` for as long as a density is configured. */
function useDensityOnDocument(density: Density | undefined) {
  useEffect(() => {
    if (!density) return;
    const root = document.documentElement;
    const before = root.dataset.density;
    root.dataset.density = density;
    return () => {
      if (before === undefined) delete root.dataset.density;
      else root.dataset.density = before;
    };
  }, [density]);
}

/**
 * The root provider. Optional: without it everything behaves as it does today.
 *
 * It wraps the language provider, so that an application has to set only one
 * component; whoever needs only wording can still use `LanguageProvider` on its
 * own.
 */
export function UmrissProvider({
  theme,
  density,
  portalTarget = null,
  toast,
  language,
  children,
}: UmrissProviderProps) {
  useThemeOnDocument(theme);
  useDensityOnDocument(density);

  const value = useMemo<UmrissContextValue>(
    () => ({
      theme,
      density: density ?? "comfortable",
      densityGiven: density !== undefined,
      portalTarget,
      toast: toast ?? {},
    }),
    [theme, density, portalTarget, toast],
  );

  return (
    <UmrissContext.Provider value={value}>
      <LanguageProvider formats={language?.formats} wording={language?.wording}>
        {children}
      </LanguageProvider>
    </UmrissContext.Provider>
  );
}
