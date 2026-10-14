/* Every change in the editing mode is one of these: a function from the view
   to a new view. The draft only ever applies them, so a history can take the
   draft's place without these knowing. A change that changes nothing returns
   the view it was given. */

import type { DashboardView, WidgetSize } from "./model";

/** One step of a draft. */
export type Edit = (view: DashboardView) => DashboardView;

/** Moves a widget to a place (counted from 0), clamped to the sequence. */
export const move =
  (id: string, to: number): Edit =>
  (view) => {
    const from = view.widgets.findIndex((widget) => widget.id === id);
    const target = Math.max(0, Math.min(view.widgets.length - 1, to));
    if (from < 0 || from === target) return view;
    const widgets = [...view.widgets];
    widgets.splice(target, 0, ...widgets.splice(from, 1));
    return { ...view, widgets };
  };

/** Gives a widget another size. */
export const resize =
  (id: string, size: WidgetSize): Edit =>
  (view) =>
    view.widgets.some((widget) => widget.id === id && widget.size !== size)
      ? { ...view, widgets: view.widgets.map((widget) => (widget.id === id ? { ...widget, size } : widget)) }
      : view;

/** Takes a widget out. */
export const remove =
  (id: string): Edit =>
  (view) =>
    view.widgets.some((widget) => widget.id === id) ? { ...view, widgets: view.widgets.filter((widget) => widget.id !== id) } : view;
