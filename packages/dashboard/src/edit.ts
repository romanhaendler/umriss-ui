/* Every change in the editing mode is one of these: a function from the view
   to a new view. The draft only ever applies them, so a history can take the
   draft's place without these knowing. A change that changes nothing returns
   the view it was given. */

import type { DashboardView, DashboardWidget, WidgetSize } from "./model";

/** A locked widget is changed by nothing but a move; the application's `locked: true` is the only lock. */
const free = (view: DashboardView, id: string) => view.widgets.some((widget) => widget.id === id && widget.locked !== true);

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
    view.widgets.some((widget) => widget.id === id && widget.locked !== true && widget.size !== size)
      ? { ...view, widgets: view.widgets.map((widget) => (widget.id === id ? { ...widget, size } : widget)) }
      : view;

/** Takes a widget out. */
export const remove =
  (id: string): Edit =>
  (view) =>
    free(view, id) ? { ...view, widgets: view.widgets.filter((widget) => widget.id !== id) } : view;

/** An id no widget of the view has: the type's name and the first free number. */
export const newId = (view: DashboardView, type: string): string => {
  let n = 1;
  while (view.widgets.some((widget) => widget.id === `${type}-${n}`)) n++;
  return `${type}-${n}`;
};

/** Appends a widget. */
export const add =
  (widget: DashboardWidget): Edit =>
  (view) => ({ ...view, widgets: [...view.widgets, widget] });

/** Gives a widget other options. */
export const setOptions =
  (id: string, options: unknown): Edit =>
  (view) => (free(view, id) ? { ...view, widgets: view.widgets.map((widget) => (widget.id === id ? { ...widget, options } : widget)) } : view);
