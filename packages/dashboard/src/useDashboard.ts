/* useDashboard - where a dashboard is declared, as a table is through useTable
   (ADR-0017, ADR-0048), and where its view stands (ADR-0047).

   `Dashboard` is one component per hook and the same on every render, so
   nothing is remounted; it reads the state from the store the hook owns.
   The state is the view and, in the editing mode, the draft: a view of its own
   that every step replaces by the result of an `Edit`. */

import { createElement, useMemo, useRef, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { announce, useWording } from "@umriss-ui/core";
import { DashboardOf } from "./Dashboard";
import type { DashboardProps } from "./Dashboard";
import type { Edit } from "./edit";
import { readView } from "./model";
import type { DashboardView } from "./model";
import { WidgetType } from "./WidgetType";
import type { WidgetTypeProps } from "./WidgetType";

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
  /** Goes one step back in the draft. Does nothing at the first. */
  undo: () => void;
  /** Goes one step forward again. Does nothing at the last. */
  redo: () => void;
  /** Steps to the `defaultView`; `undo` brings the arrangement back. */
  reset: () => void;
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
  /** Tells the hook which widget types the dashboard declares, to read a view by. */
  register: (types: Map<string, WidgetTypeProps<unknown>>) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  canUndo: boolean;
  canRedo: boolean;
  canReset: boolean;
}

/** The draft: whole arrangements, the first the one "Edit" began with, and the one in view. */
interface Draft {
  steps: DashboardView[];
  at: number;
}

interface State {
  view: DashboardView;
  draft: Draft | null;
  /** Counts the changes of what a view is read by. */
  known: number;
  /** Whether the catalogue stands. */
  catalogue?: boolean;
}

const same = (a: DashboardView, b: DashboardView) => JSON.stringify(a) === JSON.stringify(b);

/** Declares a dashboard: hands back `Dashboard`, `WidgetType`, the view in
    view, `setView` and the editing actions. */
export function useDashboard({ defaultView, initialView, allowEdit = true, onViewChange, onDraftChange }: DashboardOptions): DashboardParts {
  const store = useRef<{ state: State; listeners: Set<() => void>; types: Map<string, WidgetTypeProps<unknown>>; signature: string } | null>(null);
  store.current ??= { state: { view: initialView ?? defaultView, draft: null, known: 0 }, listeners: new Set(), types: new Map(), signature: "" };
  const own = store.current;
  const wording = useWording();

  /* The latest of the caller's values, read by the actions, which stand still. */
  const latest = useRef({ defaultView, allowEdit, onViewChange, onDraftChange, wording });
  // eslint-disable-next-line react-hooks/refs
  latest.current = { defaultView, allowEdit, onViewChange, onDraftChange, wording };

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

    /* A view read against the declared types; before a dashboard has told which
       they are, it stands as it is. */
    const read = (view: DashboardView) => (own.types.size ? readView(view, own.types) : view);

    const edit = () => {
      if (!latest.current.allowEdit || own.state.draft) return;
      put({ ...own.state, draft: { steps: [read(own.state.view)], at: 0 } });
      latest.current.onDraftChange?.(true);
    };
    const leave = (keep: boolean) => {
      const { view, draft } = own.state;
      if (!draft) return;
      const current = draft.steps[draft.at]!;
      const changed = keep && !same(current, read(view));
      put({ ...own.state, view: changed ? current : view, draft: null, catalogue: false });
      latest.current.onDraftChange?.(false);
      const { wording } = latest.current;
      announce(!keep ? wording.dashboardCancelled : changed ? wording.dashboardKept : wording.dashboardLeft);
      if (changed) latest.current.onViewChange?.(current);
    };
    const setCatalogue = (open: boolean) => {
      if (own.state.draft) put({ ...own.state, catalogue: open });
    };
    const step = (change: Edit) => {
      const { draft } = own.state;
      if (!draft) return;
      const current = draft.steps[draft.at]!;
      const next = change(current);
      /* A change that changes nothing is no step: it would leave an undo that does nothing. */
      if (next !== current) put({ ...own.state, draft: { steps: [...draft.steps.slice(0, draft.at + 1), next], at: draft.at + 1 } });
    };
    const go = (by: number, said: string) => {
      const { draft } = own.state;
      if (!draft?.steps[draft.at + by]) return;
      put({ ...own.state, draft: { ...draft, at: draft.at + by } });
      announce(said);
    };
    const undo = () => go(-1, latest.current.wording.dashboardUndone);
    const redo = () => go(1, latest.current.wording.dashboardRedone);
    const reset = () => {
      if (!own.state.draft) return;
      step(() => read(latest.current.defaultView));
      announce(latest.current.wording.dashboardResetDone);
    };
    const editor = (allowed: boolean, draft: Draft | null, catalogue: boolean): Editor => ({
      allowed,
      editing: draft !== null,
      edit,
      done: () => leave(true),
      cancel: () => leave(false),
      catalogue,
      setCatalogue,
      register: (types: Map<string, WidgetTypeProps<unknown>>) => {
        own.types = types;
        /* What a view is read by changed: whoever draws it draws it again. */
        const signature = [...types].map(([name, type]) => `${name}:${type.start}:${JSON.stringify(type.sizes)}`).join("|");
        if (signature === own.signature) return;
        own.signature = signature;
        put({ ...own.state, known: own.state.known + 1 });
      },
      step,
      undo,
      redo,
      reset,
      canUndo: !!draft && draft.at > 0,
      canRedo: !!draft && draft.at < draft.steps.length - 1,
      canReset: !!draft && !same(draft.steps[draft.at]!, read(latest.current.defaultView)),
    });

    return {
      get,
      subscribe,
      edit,
      done: () => leave(true),
      cancel: () => leave(false),
      undo,
      redo,
      reset,
      catalogue: () => setCatalogue(true),
      read,
      setView: (given: DashboardView) => {
        const view = read(given);
        put({ ...own.state, view, draft: own.state.draft ? { steps: [view], at: 0 } : null });
      },
      Dashboard: (props: DashboardProps) => {
        const { view, draft, catalogue } = useSyncExternalStore(subscribe, get, get);
        return createElement(DashboardOf, { ...props, view: draft ? draft.steps[draft.at]! : view, editor: editor(latest.current.allowEdit, draft, !!catalogue) });
      },
    };
  }, [own]);

  const { view, draft, known } = useSyncExternalStore(parts.subscribe, parts.get, parts.get);
  const current = draft ? draft.steps[draft.at]! : view;
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/refs -- `known` says that what `read` reads by changed
  const read = useMemo(() => parts.read(current), [parts, current, known]);
  return {
    Dashboard: parts.Dashboard,
    WidgetType,
    view: read,
    setView: parts.setView,
    editing: draft !== null,
    edit: parts.edit,
    done: parts.done,
    cancel: parts.cancel,
    catalogue: parts.catalogue,
    undo: parts.undo,
    redo: parts.redo,
    reset: parts.reset,
  };
}
