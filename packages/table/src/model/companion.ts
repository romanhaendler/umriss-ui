/* The state-holding companion of the model. It holds search, sort, page and
   page size, calls the model and carries the selection along.

   It guarantees what the application had to know until now: every change to
   search, sort or page size resets to page one. That rule stood in the caller
   five times by hand.

   A change of the filter does not belong to it (table-filters, D4). The filter
   comes from outside, and its identity says nothing: a function written in the
   call is a new one on every render, and a reset during the render turned that
   into an endless loop. Whoever changes the filter because the user chose
   something resets the page there; otherwise the model clamps it. */

import { useCallback, useMemo, useState } from "react";
import { useTableSelection } from "./useTableSelection";
import type { TableSelection } from "./useTableSelection";
import { orderColumns, tableModel } from "./tableModel";
import type { Column, SortLevel, TableInput, TableProjection } from "./tableModel";
import type { SortDirection } from "./tableModel";
import type { TableView } from "./view";
import { useVirtual } from "@umriss-ui/core";
import type { VirtualRows, VirtualOptions } from "@umriss-ui/core";

/** One sort level. The companion's older name for it; the sort itself is a
    list. */
export type Sort<K extends string> = SortLevel<K>;

export interface CompanionOptions<Z, K extends string> {
  /** A stable key per row – the basis of the selection. */
  rowKey: (row: Z) => string;
  pageSize?: number;
  /** One level or several; a single one is the list holding only it. */
  defaultSort?: Sort<K> | readonly Sort<K>[] | null;
  /**
   * An additional filter beside the free-text search. A change leaves the page
   * standing; the model clamps it.
   */
  filter?: (row: Z) => boolean;
  /**
   * The starting state, as the application kept it. Heeded only on the first
   * render – whoever wants to set the view from outside later changes the
   * component's `key`.
   */
  initialView?: TableView<K>;
  /**
   * Switches virtualisation on: only what stands in the scroll area is
   * rendered.
   *
   * Paging is off with it. Both at once would be a control that contradicts
   * itself - a page number promising something the scroll undoes again a
   * moment later. `pageSize` and `setPage` therefore stay without effect as
   * long as this is set.
   */
  virtual?: VirtualOptions;
  /** Groups the filtered set; a page and the virtual window then count lines.
      Its identity should stay while nothing in it changes. */
  grouping?: TableInput<Z, K>["grouping"];
}

export interface Companion<Z, K extends string> extends TableProjection<Z, K> {
  search: string;
  setSearch: (value: string) => void;
  /** The active levels in their order; empty means unsorted. */
  sort: readonly Sort<K>[];
  /**
   * Toggles the sort of this column.
   *
   * Without `additive` it replaces the whole list and turns between up and
   * down – the previous behaviour. With `additive` it appends a level, turns
   * it the second time and takes it out again the third; the remaining levels
   * stay untouched by that.
   */
  toggleSort: (column: K, additive?: boolean) => void;
  /** The direction of this column, otherwise undefined – straight for Th. */
  sortDirectionOf: (column: K) => SortDirection | undefined;
  /** The 1-based rank of the level, but only from two levels on – straight for
      Th. With a single level the figure would be nothing but noise. */
  sortRankOf: (column: K) => number | undefined;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  /** Ids of the columns switched away. */
  hidden: readonly K[];
  /** Switches a column away or back. Columns that are not hideable stay, even
      when they are named here. The page stays put: the set of rows does not
      change. */
  toggleColumn: (column: K) => void;
  /** A ready-made template for a column menu: the columns that can be switched
      away, in their current order, with label and visibility. Columns without a
      label and those that are not hideable are absent – in the menu they would
      be rows that do nothing. */
  columnChoices: readonly { id: K; label: string; visible: boolean }[];
  /** Dragged column widths in pixels; what is absent the browser decides. */
  widths: Readonly<Record<string, number>>;
  /** Sets a width; `undefined` gives the column back to its content. */
  setWidth: (column: K, width: number | undefined) => void;
  /** The wanted column order; empty means natural order. */
  order: readonly K[];
  setOrder: (order: readonly K[]) => void;
  /** Keys of the expanded rows. */
  expanded: readonly string[];
  /** Expands a row or collapses it; several may be open. */
  toggleRow: (key: string) => void;
  isExpanded: (key: string) => boolean;
  /** The part of the state an application can keep. The library puts it
      nowhere: whether and where belongs to the application. */
  view: TableView<K>;
  selection: TableSelection<string>;
  /**
   * The visible window when it virtualises - otherwise undefined.
   *
   * It goes to `<Table virtual={…}>` and to `<TableVirtualBody>`; `visible`
   * then carries the window instead of the page, so that a caller need not
   * touch its loop.
   */
  virtual?: VirtualRows;
}

export function useCompanion<Z, K extends string = string>(
  rows: readonly Z[],
  columns: readonly Column<Z, K>[],
  options: CompanionOptions<Z, K>,
): Companion<Z, K> {
  const { rowKey, filter, defaultSort = null, initialView, virtual, grouping } = options;

  const [search, setSearchRaw] = useState(initialView?.search ?? "");
  const [sort, setSort] = useState<readonly Sort<K>[]>(() => {
    /* The view handed in beats the application's default: whoever opens a kept
       view wants to see its sort, not the house's. */
    if (initialView?.sort?.length) return [...initialView.sort];
    if (!defaultSort) return [];
    return Array.isArray(defaultSort) ? [...defaultSort] : [defaultSort as Sort<K>];
  });
  const [page, setPage] = useState(initialView?.page ?? 1);
  const [pageSize, setPageSizeRaw] = useState(
    initialView?.pageSize ?? options.pageSize ?? 10,
  );
  const [expanded, setExpanded] = useState<readonly string[]>([]);
  const [hidden, setHidden] = useState<readonly K[]>(initialView?.hidden ?? []);
  const [order, setOrder] = useState<readonly K[]>(initialView?.order ?? []);
  /* The initial widths come from the view, otherwise from the columns. */
  const [widths, setWidths] = useState<Readonly<Record<string, number>>>(() => {
    if (initialView?.widths) return { ...initialView.widths };
    const out: Record<string, number> = {};
    for (const column of columns) {
      if (column.width !== undefined) out[column.id] = column.width;
    }
    return out;
  });


  /* Virtualising means: no pages. The model is handed the size zero, which it
     reads as "everything on one page" - the same rule it already had for a
     table without paging. */
  const modelPageSize = virtual ? 0 : pageSize;

  const projection = useMemo(
    () =>
      tableModel(rows, columns, {
        search,
        filter,
        sort,
        page,
        pageSize: modelPageSize,
        hidden,
        order,
        grouping,
      }),
    [rows, columns, search, filter, sort, page, modelPageSize, hidden, order, grouping],
  );

  /* The hook always runs - the number of hooks must not hang on whether it
     virtualises. Without virtualisation it calculates over zero rows and the
     result is not handed out. */
  const rowWindow = useVirtual(virtual ? (projection.lines ?? projection.filtered).length : 0, {
    rowHeight: virtual?.rowHeight ?? 0,
    overscan: virtual?.overscan,
  });

  /* `visible` is always "what is to be rendered now": with paging the page,
     with virtualisation the window. That way the loop in the caller stays the
     same. */
  const windowLines = useMemo(
    () => (virtual && projection.lines ? projection.lines.slice(rowWindow.from, rowWindow.to) : projection.visibleLines),
    [virtual, projection.lines, projection.visibleLines, rowWindow.from, rowWindow.to],
  );
  const visible = useMemo(
    () =>
      !virtual
        ? projection.visible
        : windowLines
          ? windowLines.flatMap((l) => (l.kind === "row" ? [l.row] : []))
          : projection.filtered.slice(rowWindow.from, rowWindow.to),
    [virtual, windowLines, projection.filtered, projection.visible, rowWindow.from, rowWindow.to],
  );

  // The keys of the filtered set – that is why "select all" reaches across
  // all pages and not only across the visible one.
  const keyList = useMemo(() => projection.filtered.map(rowKey), [projection.filtered, rowKey]);
  const selection = useTableSelection(keyList);

  const setSearch = useCallback((value: string) => {
    setSearchRaw(value);
    setPage(1);
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeRaw(size);
    setPage(1);
  }, []);

  const toggleSort = useCallback((column: K, additive = false) => {
    setSort((current) => {
      const existing = current.find((level) => level.column === column);

      /* Without the modifier key: one level, and it turns between up and down.
         Deliberately no off state - that was already so before. */
      if (!additive) {
        const direction: SortDirection =
          current.length === 1 && existing?.direction === "asc" ? "desc" : "asc";
        return [{ column, direction }];
      }

      /* With the modifier key: append, turn, take out. The cycle has three
         positions here, otherwise a second level could not be got rid of
         without losing the first. */
      if (!existing) return [...current, { column, direction: "asc" }];
      if (existing.direction === "asc") {
        return current.map((level) =>
          level.column === column ? { column, direction: "desc" as SortDirection } : level,
        );
      }
      return current.filter((level) => level.column !== column);
    });
    setPage(1);
  }, []);

  /* Expanded rows survive a change of filter.

     The alternative would be to discard keys that fall out of the filtered
     set. The more frequent case speaks against it: whoever filters, looks
     something up and widens the filter again would otherwise find his row
     collapsed and wonder why. A key that occurs nowhere any more costs
     nothing. */
  const toggleRow = useCallback((key: string) => {
    setExpanded((current) =>
      current.includes(key)
        ? current.filter((s) => s !== key)
        : [...current, key],
    );
  }, []);

  const isExpanded = useCallback(
    (key: string) => expanded.includes(key),
    [expanded],
  );

  /* Hiding deliberately does NOT reset the page: unlike search, sort and page
     size it does not change the set of rows, so there is no page that could
     become invalid. */
  const toggleColumn = useCallback((column: K) => {
    setHidden((current) =>
      current.includes(column) ? current.filter((id) => id !== column) : [...current, column],
    );
  }, []);

  /* `undefined` does not mean "width zero" but "no specification" - which is
     why the entry is removed instead of being set to a value. */
  const setWidth = useCallback((column: K, width: number | undefined) => {
    setWidths((current) => {
      if (width === undefined) {
        if (!(column in current)) return current;
        const rest = { ...current };
        delete rest[column];
        return rest;
      }
      return { ...current, [column]: width };
    });
  }, []);

  const sortDirectionOf = useCallback(
    (column: K) => sort.find((level) => level.column === column)?.direction,
    [sort],
  );

  const sortRankOf = useCallback(
    (column: K) => {
      if (sort.length < 2) return undefined;
      const index = sort.findIndex((level) => level.column === column);
      return index === -1 ? undefined : index + 1;
    },
    [sort],
  );

  /* From the whole ordered list, not from the visible columns: a column that
     has been switched away must stay in the menu, otherwise there would be no
     way back to it. */
  const columnChoices = useMemo(
    () =>
      orderColumns(columns, order)
        .filter((s) => s.label !== undefined && s.hideable !== false)
        .map((s) => ({ id: s.id, label: s.label!, visible: !hidden.includes(s.id) })),
    [columns, order, hidden],
  );

  /* What is reported is what deviates from the default - otherwise every kept
     view would carry a page size although the user did nothing. The default of
     the page size is the application's setting, not the built-in ten. */
  const defaultPageSize = options.pageSize ?? 10;

  /* The widths declared in the columns are the default. Without this
     comparison every view would carry widths before the user had dragged at
     all – the same error as with the page size. */
  const defaultWidths = useMemo(() => {
    const out: Record<string, number> = {};
    for (const s of columns) {
      if (s.width !== undefined) out[s.id] = s.width;
    }
    return out;
  }, [columns]);

  const changedWidths = useMemo(() => {
    const out: Record<string, number> = {};
    for (const [id, px] of Object.entries(widths)) {
      if (defaultWidths[id] !== px) out[id] = px;
    }
    return out;
  }, [widths, defaultWidths]);

  /* The application's setting is the default for the sort as well. A view
     without a sort restores it anyway, so only a deviation carries it - and an
     untouched table yields an empty view. The comparison is against
     `defaultSort`, not against the sort of the view handed in: otherwise a kept
     view would lose exactly the sort it was kept for. */
  const defaultSortLevels = useMemo<readonly Sort<K>[]>(
    () => (!defaultSort ? [] : Array.isArray(defaultSort) ? defaultSort : [defaultSort]),
    [defaultSort],
  );
  const isDefaultSort =
    sort.length === defaultSortLevels.length &&
    sort.every(
      (level, i) =>
        level.column === defaultSortLevels[i]?.column &&
        level.direction === defaultSortLevels[i]?.direction,
    );

  const view = useMemo<TableView<K>>(
    () => ({
      ...(search ? { search } : {}),
      ...(sort.length && !isDefaultSort ? { sort } : {}),
      /* Without paging there is no page a view could carry - a page three in
         the view of a virtualised table would be a promise nobody redeems on
         opening. */
      ...(!virtual && projection.page > 1 ? { page: projection.page } : {}),
      ...(!virtual && pageSize !== defaultPageSize ? { pageSize } : {}),
      ...(hidden.length ? { hidden } : {}),
      ...(order.length ? { order } : {}),
      ...(Object.keys(changedWidths).length ? { widths: changedWidths } : {}),
    }),
    [
      virtual,
      search,
      sort,
      isDefaultSort,
      projection.page,
      pageSize,
      defaultPageSize,
      hidden,
      order,
      changedWidths,
    ],
  );

  return {
    ...projection,
    visible,
    visibleLines: windowLines,
    virtual: virtual ? rowWindow : undefined,
    view,
    search,
    setSearch,
    sort,
    toggleSort,
    sortDirectionOf,
    sortRankOf,
    setPage,
    pageSize,
    setPageSize,
    expanded,
    toggleRow,
    isExpanded,
    hidden,
    toggleColumn,
    columnChoices,
    order,
    setOrder,
    widths,
    setWidth,
    selection,
  };
}
