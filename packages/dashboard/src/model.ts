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
