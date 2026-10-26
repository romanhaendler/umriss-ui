/** The closed set of names a widget's size comes from. A widget type offers a
    subset of them. */
export type WidgetSize = "small" | "medium" | "wide" | "tall" | "large" | "full";

/** The room a size takes on the twelve columns, in columns and rows. */
export interface SizeSpan {
  /** Columns of twelve. */
  columns: number;
  /** Rows of the fixed row unit. */
  rows: number;
}

/** One widget in a view. */
export interface DashboardWidget {
  /** Unique within the view. */
  id: string;
  /** The `name` of the widget type it is an instance of. */
  type: string;
  /** One of the sizes its type offers. */
  size: WidgetSize;
  /** The type's own options, typed through the hook. */
  options: unknown;
  /** Set by the application, never by the dashboard: the reader can move the widget but not
      resize it, change its options or remove it. Only `true` locks. Kept through every edit. */
  locked?: boolean;
}

/** The arrangement of a dashboard: which widgets, in what order, at which
    sizes, with which options. An object, so that more can join it later. */
export interface DashboardView {
  /** The widgets, in the order they are drawn and read. */
  widgets: ReadonlyArray<DashboardWidget>;
}

type Types = ReadonlyMap<string, { sizes: Partial<Record<WidgetSize, SizeSpan>>; start: WidgetSize; defaultOptions: unknown }>;

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

/** Whether a stored value has the shape of a view: an object with a widgets array. */
export const isView = (value: unknown): value is DashboardView => isObject(value) && Array.isArray(value.widgets);

/** The entries of a view that have the shape of a widget: an object with a string `id` and `type`. */
const shaped = (view: DashboardView): DashboardWidget[] =>
  view.widgets.filter((widget): widget is DashboardWidget => isObject(widget) && typeof widget.id === "string" && typeof widget.type === "string");

/** A view with only the entries that are widgets; before the types are known nothing else can be told. */
export const shapedView = (view: DashboardView): DashboardView => ({ ...view, widgets: shaped(view) });

/** The widgets of a stored view whose id a reading of it does not hold: those of
    a type not declared when it was read, which the application may declare later,
    in their stored order. Told by id, not by the types declared now, which may
    have changed since the reading. */
export const unreadWidgets = (view: DashboardView, read: DashboardView): DashboardWidget[] => {
  const held = new Set(read.widgets.map((widget) => widget.id));
  return shaped(view).filter((widget) => !held.has(widget.id));
};

const isPlain = (value: unknown): value is Record<string, unknown> => isObject(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));

/** The options a stored widget is read with: plain stored options spread over plain
    defaults, one level deep; absent or non-plain stored options against plain
    defaults read as the defaults; against other defaults only absent ones do. */
const readOptions = (stored: unknown, defaults: unknown) =>
  isPlain(defaults) ? (isPlain(stored) ? { ...defaults, ...stored } : defaults) : stored === undefined ? defaults : stored;

/** A view as the declared widget types read it: entries that are no widgets,
    widgets of unknown types and every id after its first fall out; a size the
    type does not offer becomes the type's starting size. Options are read over the
    type's `defaultOptions`. */
export function readView(view: DashboardView, types: Types): DashboardView {
  const seen = new Set<string>();
  return {
    ...view,
    widgets: shaped(view).flatMap((widget) => {
      const type = types.get(widget.type);
      if (!type || seen.has(widget.id)) return [];
      seen.add(widget.id);
      return [{ ...widget, size: type.sizes[widget.size] ? widget.size : type.start, options: readOptions(widget.options, type.defaultOptions) }];
    }),
  };
}
