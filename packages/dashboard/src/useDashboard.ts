/* useDashboard - where a dashboard is declared, as a table is through useTable
   (ADR-0017, ADR-0048), and where its view stands (ADR-0047).

   `Dashboard` is one component per hook and the same on every render, so
   nothing is remounted; it reads the view from the store the hook owns. */

import { createElement, useMemo, useRef, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { DashboardOf } from "./Dashboard";
import type { DashboardProps } from "./Dashboard";
import type { DashboardView } from "./model";
import { WidgetType } from "./WidgetType";

/** What `useDashboard` takes. */
export interface DashboardOptions {
  /** The arrangement the application gives a reader who has none of their own. */
  defaultView: DashboardView;
  /** The reader's kept arrangement, read once when the hook first runs; a
      different value on a later render is ignored, as React ignores a changed
      `defaultValue`. To go to another, call `setView`.
      @default the `defaultView` */
  initialView?: DashboardView;
}

/** What `useDashboard` hands back. */
export interface DashboardParts {
  /** The dashboard. One per `useDashboard`. */
  Dashboard: (props: DashboardProps) => ReactNode;
  /** Declares a widget type inside `Dashboard`. */
  WidgetType: typeof WidgetType;
  /** The arrangement in view. */
  view: DashboardView;
  /** Goes to a whole arrangement. Not reported. */
  setView: (view: DashboardView) => void;
}

/** Declares a dashboard: hands back `Dashboard`, `WidgetType`, the view in
    view and `setView`. */
export function useDashboard({ defaultView, initialView }: DashboardOptions): DashboardParts {
  const store = useRef<{ view: DashboardView; listeners: Set<() => void> } | null>(null);
  store.current ??= { view: initialView ?? defaultView, listeners: new Set() };
  const own = store.current;

  const parts = useMemo(() => {
    const subscribe = (listener: () => void) => {
      own.listeners.add(listener);
      return () => void own.listeners.delete(listener);
    };
    const get = () => own.view;
    return {
      get,
      subscribe,
      setView: (view: DashboardView) => {
        own.view = view;
        own.listeners.forEach((listener) => listener());
      },
      Dashboard: (props: DashboardProps) => {
        const view = useSyncExternalStore(subscribe, get, get);
        return createElement(DashboardOf, { ...props, view });
      },
    };
  }, [own]);

  const view = useSyncExternalStore(parts.subscribe, parts.get, parts.get);
  return { Dashboard: parts.Dashboard, WidgetType, view, setView: parts.setView };
}
