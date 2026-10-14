/* The toasts of a page of this demo: one deck, as in an application.

   An application has one `ToastProvider`, at its root. This demo's root is
   `main.tsx`, so every example on a page shows its toasts in that one deck.
   A few examples are about a setting of the root - where the toasts stand, how
   many, for how long, whether they are held. They cannot wrap a provider of
   their own, so they hand the setting to this root through `usePageToast` when
   the reader acts (not on mount: several of them stand on one page at once).

   The setting stays until another example changes it, and goes with the
   example that wrote it: when the page is left its examples unmount, and the
   deck is back at the defaults. The example's displayed code never shows this
   file: it shows the root an application writes (`demo-only` parts, see
   `tooling/source.ts` in `@umriss-ui/demo`). */

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { ToastProvider, UmrissProvider, useToast, type ToastProviderProps, type UmrissProviderProps } from "../src";

/** What the root of the page runs with: the `toast` of the `UmrissProvider`
    and the `held` of the `ToastProvider` there - their own props, so an example
    that sets them is read as showing them. */
export type PageToastSetting = Pick<UmrissProviderProps, "toast"> & Pick<ToastProviderProps, "held">;

type Write = (writer: object, setting: PageToastSetting | null) => void;

const PageToastContext = createContext<Write>(() => {});

/** The root of every page: the application's one `UmrissProvider` and `ToastProvider`. */
export function PageToast({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<{ writer: object; setting: PageToastSetting } | null>(null);
  const write = useCallback<Write>((writer, setting) => {
    /* Taking a setting back only counts for the one that wrote it. */
    setCurrent((now) => (setting ? { writer, setting } : now?.writer === writer ? null : now));
  }, []);
  return (
    <UmrissProvider toast={current?.setting.toast}>
      <ToastProvider held={current?.setting.held ?? false}>
        <PageToastContext value={write}>{children}</PageToastContext>
      </ToastProvider>
    </UmrissProvider>
  );
}

/** The `toast` function of the page's deck. */
type Toast = ReturnType<typeof useToast>["toast"];

/** Returns the function an example calls, on the reader's action, to set the
    page's deck.

    A toast takes duration and limit from the provider as they were when its
    `toast` function was made. So an example that shows a toast in the same
    action hands over what to show as `run`: it is called with the `toast` of
    the deck as the new setting has made it, and not with the one the click
    handler was made with. */
export function usePageToast(): (setting: PageToastSetting, run?: (toast: Toast) => void) => void {
  const write = useContext(PageToastContext);
  const { toast } = useToast();
  const latest = useRef(toast);
  useLayoutEffect(() => {
    latest.current = toast;
  });
  const writer = useRef({});
  /* The example leaves with its page: its setting goes with it. */
  useEffect(() => {
    const own = writer.current;
    return () => write(own, null);
  }, [write]);
  return useMemo(
    () => (setting, run) => {
      flushSync(() => write(writer.current, setting));
      run?.(latest.current);
    },
    [write],
  );
}
