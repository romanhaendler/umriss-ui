/* The view: the part of the table's state an application hands in on the first
   render (`initialView`) and can read back (`t.view`).

   The table puts it nowhere - not in the address, not in any storage. Whether
   and where a view is kept is the application's decision (table-filters): a
   library that writes the address bar dictates what its callers' URLs contain.
   That is why the view is an object and not a string. */

import type { SortLevel } from "./tableModel";
import type { Pin } from "./pinning";

/** Search, conditions, sort levels, page, page size, hidden columns, order,
    dragged widths, the grouping and the pinned columns. Whatever is at its
    default is absent. The pre-filter never belongs to it: it is a function of
    the application. */
export interface TableView<K extends string = string> {
  search?: string;
  /** The conditions of the column filters, per column. A condition for a column
      that does not exist, or whose filter is of another kind, falls out. */
  conditions?: Readonly<Record<string, unknown>>;
  sort?: readonly SortLevel<K>[];
  page?: number;
  pageSize?: number;
  hidden?: readonly K[];
  order?: readonly K[];
  /** Column widths the user has dragged, in pixels. */
  widths?: Readonly<Record<string, number>>;
  /** The columns and group keys the table is grouped by, the outermost first. */
  grouping?: readonly K[];
  /** The paths of the folded groups. A path that no longer occurs falls out. */
  folded?: readonly string[];
  /** Tree rows: the keys of the open branches. A key that no longer occurs falls out. */
  branches?: readonly string[];
  /** The pinned columns, whole, once the user's choice deviates from what the
      columns declare - `{}` when every declared pin was undone. A column that
      does not exist falls out. */
  pinned?: Readonly<Record<string, Pin>>;
}

/** The view as manual mode reports it to `onRequest`: the parts that decide
    the rows - search, conditions, sort, page and page size - are always there,
    at their default as well. A server has no default of the table's to fall
    back on, and a view it has to complete is one it completes wrongly. */
export type ManualView<K extends string = string> = TableView<K> &
  Required<Pick<TableView<K>, "search" | "conditions" | "sort" | "page" | "pageSize">>;

/** What manual mode compares to report a view once: the five parts that decide
    the rows, and nothing else - a new width fetches nothing. Conditions are
    compared as JSON, which is what a server receives of them. */
export const manualViewKey = (view: ManualView): string =>
  JSON.stringify([view.search, view.conditions, view.sort, view.page, view.pageSize]);

/** What a view handed in is compared by (ADR-0047): its content, not its
    identity - a view written in the call is a new object on every render.
    Object keys are sorted, so the order they were written in does not count;
    lists keep theirs, since a sort's or an order's is its content. */
export const viewKey = (view: TableView): string =>
  JSON.stringify(view, (_, value: unknown) =>
    value && typeof value === "object" && !Array.isArray(value)
      ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
      : value,
  );

/** The view without names that no registered column carries. As long as none
    has registered it stays as it is - otherwise the first render would erase
    every view. */
export function onlyKnown(view: TableView, known: ReadonlySet<string>): TableView {
  if (known.size === 0) return view;
  const sort = view.sort?.filter((s) => known.has(s.column));
  const hidden = view.hidden?.filter((id) => known.has(id));
  const order = view.order?.filter((id) => known.has(id));
  const widths = view.widths
    ? Object.fromEntries(Object.entries(view.widths).filter(([id]) => known.has(id)))
    : undefined;
  const unchanged =
    sort?.length === view.sort?.length &&
    hidden?.length === view.hidden?.length &&
    order?.length === view.order?.length &&
    Object.keys(widths ?? {}).length === Object.keys(view.widths ?? {}).length;
  if (unchanged) return view;
  return {
    ...(view.search ? { search: view.search } : {}),
    ...(view.page ? { page: view.page } : {}),
    ...(view.pageSize ? { pageSize: view.pageSize } : {}),
    ...(sort?.length ? { sort } : {}),
    ...(hidden?.length ? { hidden } : {}),
    ...(order?.length ? { order } : {}),
    ...(widths && Object.keys(widths).length ? { widths } : {}),
  };
}
