/* useDashboard - where a dashboard is declared, as a table is through useTable
   (ADR-0017, ADR-0048), and where its view stands (ADR-0047).

   `Dashboard` is one component per hook and the same on every render, so
   nothing is remounted; it reads the state from the store the hook owns.
   The state is the view and, in the editing mode, the draft: a view of its own
   that every step replaces by the result of an `Edit`. */

import { createElement, useMemo, useRef, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { DashboardOf } from "./Dashboard";
import type { DashboardProps } from "./Dashboard";
import type { Edit } from "./edit";
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
  /** Whether the reader may edit. Without it no bar is drawn and the mode cannot be entered.
      @default true */
  allowEdit?: boolean;
  /** Called once per "Done" that changed something, with the whole arrangement. Not called by `setView`. */
  onViewChange?: (view: DashboardView) => void;
  /** Called with `true` when a draft opens and with `false` when it closes - to warn before navigation. */
  onDraftChange?: (open: boolean) => void;
}

/** What `useDashboard` hands back. */
export interface DashboardParts {
  /** The dashboard. One per `useDashboard`. */
  Dashboard: (props: DashboardProps) => ReactNode;
  /** Declares a widget type inside `Dashboard`. */
  WidgetType: typeof WidgetType;
  /** The arrangement in view: the draft while the mode is on. */
  view: DashboardView;
  /** Goes to a whole arrangement. Not reported. */
  setView: (view: DashboardView) => void;
  /** Whether the editing mode is on. */
  editing: boolean;
  /** Enters the editing mode. Does nothing where editing is not allowed. */
  edit: () => void;
  /** Leaves the mode, keeps the changes and reports them once if there are any. */
  done: () => void;
  /** Opens the catalogue. Does nothing outside the editing mode. */
  catalogue: () => void;
  /** Leaves the mode and puts the arrangement back as it was before `edit`. */
  cancel: () => void;
}

/** The part of the hook `Dashboard` draws the mode from. */
export interface Editor {
  allowed: boolean;
  editing: boolean;
  edit: () => void;
  done: () => void;
  cancel: () => void;
  /** Whether the catalogue stands, and the means to open and close it. */
  catalogue: boolean;
  setCatalogue: (open: boolean) => void;
  /** Applies one change to the draft. */
  step: (edit: Edit) => void;
}

interface State {
  view: DashboardView;
  draft: DashboardView | null;
  /** Whether the catalogue stands. */
  catalogue?: boolean;
}

/** Declares a dashboard: hands back `Dashboard`, `WidgetType`, the view in
    view, `setView` and the editing actions. */
export function useDashboard({ defaultView, initialView, allowEdit = true, onViewChange, onDraftChange }: DashboardOptions): DashboardParts {
  const store = useRef<{ state: State; listeners: Set<() => void> } | null>(null);
  store.current ??= { state: { view: initialView ?? defaultView, draft: null }, listeners: new Set() };
  const own = store.current;

  /* The latest of the caller's values, read by the actions, which stand still. */
  const latest = useRef({ allowEdit, onViewChange, onDraftChange });
  // eslint-disable-next-line react-hooks/refs
  latest.current = { allowEdit, onViewChange, onDraftChange };

  const parts = useMemo(() => {
    const subscribe = (listener: () => void) => {
      own.listeners.add(listener);
      return () => void own.listeners.delete(listener);
    };
    const get = () => own.state;
    const put = (state: State) => {
      own.state = state;
      own.listeners.forEach((listener) => listener());
    };

    const edit = () => {
      if (!latest.current.allowEdit || own.state.draft) return;
      put({ ...own.state, draft: own.state.view });
      latest.current.onDraftChange?.(true);
    };
    const leave = (keep: boolean) => {
      const { view, draft } = own.state;
      if (!draft) return;
      const changed = keep && JSON.stringify(draft) !== JSON.stringify(view);
      put({ view: changed ? draft : view, draft: null, catalogue: false });
      latest.current.onDraftChange?.(false);
      if (changed) latest.current.onViewChange?.(draft);
    };
    const setCatalogue = (open: boolean) => {
      if (own.state.draft) put({ ...own.state, catalogue: open });
    };
    const editor = (allowed: boolean, editing: boolean, catalogue: boolean): Editor => ({
      allowed,
      editing,
      edit,
      done: () => leave(true),
      cancel: () => leave(false),
      catalogue,
      setCatalogue,
      step: (change) => {
        const { draft } = own.state;
        if (draft) put({ ...own.state, draft: change(draft) });
      },
    });

    return {
      get,
      subscribe,
      edit,
      done: () => leave(true),
      cancel: () => leave(false),
      catalogue: () => setCatalogue(true),
      setView: (view: DashboardView) => put({ ...own.state, view, draft: own.state.draft ? view : null }),
      Dashboard: (props: DashboardProps) => {
        const { view, draft, catalogue } = useSyncExternalStore(subscribe, get, get);
        return createElement(DashboardOf, { ...props, view: draft ?? view, editor: editor(latest.current.allowEdit, draft !== null, !!catalogue) });
      },
    };
  }, [own]);

  const { view, draft } = useSyncExternalStore(parts.subscribe, parts.get, parts.get);
  return {
    Dashboard: parts.Dashboard,
    WidgetType,
    view: draft ?? view,
    setView: parts.setView,
    editing: draft !== null,
    edit: parts.edit,
    done: parts.done,
    cancel: parts.cancel,
    catalogue: parts.catalogue,
  };
}
