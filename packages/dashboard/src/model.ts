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
}

/** The arrangement of a dashboard: which widgets, in what order, at which
    sizes, with which options. An object, so that more can join it later. */
export interface DashboardView {
  /** The widgets, in the order they are drawn and read. */
  widgets: ReadonlyArray<DashboardWidget>;
}

/** A view as the declared widget types read it: widgets of unknown types and
    every id after its first fall out; a size the type does not offer becomes
    the type's starting size. Options stay as they are. */
export function readView(view: DashboardView, types: ReadonlyMap<string, { sizes: Partial<Record<WidgetSize, SizeSpan>>; start: WidgetSize }>): DashboardView {
  const seen = new Set<string>();
  return {
    ...view,
    widgets: view.widgets.flatMap((widget) => {
      const type = types.get(widget.type);
      if (!type || seen.has(widget.id)) return [];
      seen.add(widget.id);
      return [type.sizes[widget.size] ? widget : { ...widget, size: type.start }];
    }),
  };
}
