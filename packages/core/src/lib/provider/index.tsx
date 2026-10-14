/* One place where the library can be configured.

   It holds exactly four things: the density, the portal target for overlays, the
   setting for toasts, and the configuration of formats and wording. No more. It
   holds no theme: light and dark are the application's `color-scheme`, which the
   tokens follow on their own (ADR-0021) - and it writes nothing onto the
   document, because a provider that did would reach beyond its subtree. It sets
   no component's variant: that would be a second interface beside the
   components' own props.

   It is optional, and its absence is the tested normal case: every component
   renders and behaves without it, so the library can be introduced component
   by component. */

import { useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { LanguageProvider, useLanguage } from "../language";
import type { LanguageOptions } from "../language";
import { UmrissContext } from "./context";
import type { UmrissContextValue } from "./context";

/** How densely the library builds. A component with a density of its own
    takes it through `useDensityFor` as the default for its `density` - in
    @umriss-ui/table the table, in @umriss-ui/calculation
    the calculation; a compact set of tokens does not exist. */
export type Density = "comfortable" | "compact";

/**
 * Where overlays portal to.
 *
 * A function is evaluated on every opening - a target that only comes into the
 * tree later cannot be given otherwise. `null`, or a result of `null`, means
 * "as before".
 */
export type PortalTarget = HTMLElement | (() => HTMLElement | null) | null;

/** Where the toasts stand: an edge of the window and a place along it. On a
    phone they take the width of the window, and only the edge counts. */
export type ToastPosition = "top-start" | "top-center" | "top-end" | "bottom-start" | "bottom-center" | "bottom-end";

/** The defaults for every toast, set on `UmrissProvider`'s `toast`. */
export interface ToastConfig {
  /** Display duration in ms, where the individual toast names none.
      @default 5000 */
  duration?: number;
  /** Where the toasts stand. There is no position per toast - toasts that
      stand in different places are not read as one.
      @default "bottom-end" */
  position?: ToastPosition;
  /** How many toasts that leave by themselves stand at once; the oldest of
      them gives way to a new one, as if it had been closed. A toast that
      stays (`duration: 0`) or is still at work (`loading`) neither counts nor
      gives way.
      @default 3 */
  limit?: number;
}

/** The settings of `UmrissProvider` as the components read them, every value
    filled in. */
export interface UmrissConfig {
  density: Density;
  portalTarget: PortalTarget;
  toast: ToastConfig;
}

const DEFAULTS: UmrissConfig = {
  density: "comfortable",
  portalTarget: null,
  toast: {},
};

/* `useDensityFor` distinguishes "the provider says comfortable" from "nobody
   said anything". @umriss-ui/table reads it from here. */
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

/** The props of `UmrissProvider`. */
export interface UmrissProviderProps {
  /**
   * The default for the `density` of every component that reads it with
   * `useDensityFor` - in `@umriss-ui/table` `Table`, in
   * `@umriss-ui/calculation` `Calculation` ("comfortable" means "regular").
   *
   * @default none - a component keeps its own density
   */
  density?: Density;
  /**
   * Where overlays portal to, unless an open dialog takes them. A function is
   * evaluated on every opening - a target that only enters the tree later
   * cannot be given otherwise; `null` means "as before".
   * The callers' own rules take precedence: the popover seam portals into the
   * nearest `<dialog>` ancestor, because a portal at the body does not reach
   * the top layer, and the toasts follow the topmost modal dialog, because a
   * toast outside it lies behind it and is inert.
   */
  portalTarget?: PortalTarget;
  /** The setting for toasts: the display duration where the individual toast
      names none, where they stand, and how many stand at once. */
  toast?: ToastConfig;
  /**
   * Formats and wording, entry by entry - see [Language](#/language).
   *
   * @default none - the surrounding language holds, English at the root
   */
  language?: LanguageOptions;
  /** The subtree the settings apply to. */
  children: ReactNode;
}

/**
 * The root provider. Optional: without it everything behaves as it does today.
 *
 * It wraps the language provider, so that an application has to set only one
 * component; whoever needs only wording can still use `LanguageProvider` on its
 * own.
 */
export function UmrissProvider({
  density,
  portalTarget = null,
  toast,
  language,
  children,
}: UmrissProviderProps) {
  /* Without a language of its own the provider passes the surrounding one on,
     so a nested provider for a toast or a portal target does not reset the
     subtree to English; the element stays the same, so the subtree is not
     remounted when `language` comes or goes. */
  const outer = useLanguage();
  const value = useMemo<UmrissContextValue>(
    () => ({
      density: density ?? "comfortable",
      densityGiven: density !== undefined,
      portalTarget,
      toast: toast ?? {},
    }),
    [density, portalTarget, toast],
  );

  return (
    <UmrissContext value={value}>
      <LanguageProvider
        formats={language ? language.formats : outer.formats}
        wording={language ? language.wording : outer.wording}
      >
        {children}
      </LanguageProvider>
    </UmrissContext>
  );
}
