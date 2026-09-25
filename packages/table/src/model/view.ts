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
  /** The pinned columns, whole, once the user's choice deviates from what the
      columns declare - `{}` when every declared pin was undone. A column that
      does not exist falls out. */
  pinned?: Readonly<Record<string, Pin>>;
}

/** The view as manual mode reports it to `onViewChange`: the parts that decide
    the rows - search, conditions, sort, page and page size - are always there,
    at their default as well. A server has no default of the table's to fall
    back on, and a view it has to complete is one it completes wrongly. */
export type ManualView<K extends string = string> = TableView<K> &
  Required<Pick<TableView<K>, "search" | "conditions" | "sort" | "page" | "pageSize">>;
