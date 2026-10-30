/* tableState.ts: the table's state - what the tableState holds. It holds search, sort, page and
   page size, calls the model and carries the selection along.

   It guarantees that every change to search, sort or page size resets to page
   one.

   A change of the filter does not belong to it. The filter
   comes from outside, and its identity says nothing: a function written in the
   call is a new one on every render, and a reset during the render would loop endlessly. Whoever changes the filter because the user chose
   something resets the page there; otherwise the model clamps it. */

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTableSelection } from "./useTableSelection";
import type { TableSelection } from "./useTableSelection";
import { filterSort, groupStage, pageStage, tableModel } from "./tableModel";
import { linesOf, rowsOf } from "./grouping";
import type { ModelColumn, SortLevel, TableInput, TableProjection } from "./tableModel";
import type { SortDirection } from "./tableModel";
import type { TableView } from "./view";
import { useVirtual } from "@umriss-ui/core";
import type { VirtualRows } from "@umriss-ui/core";

/** The widths the columns declare, by id. */
export function declaredWidths<Z, K extends string>(columns: readonly ModelColumn<Z, K>[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const column of columns) if (column.width !== undefined) out[column.id] = column.width;
  return out;
}

/** The virtual window of a projection: of its lines when it is grouped, of its
    rows otherwise. */
export function windowed<Z>(projection: TableProjection<Z>, from: number, to: number): TableProjection<Z> {
  if (!projection.lines) return { ...projection, visible: (projection.shown ?? projection.filtered).slice(from, to) };
  const visibleLines = projection.lines.slice(from, to);
  return { ...projection, visibleLines, visible: rowsOf(visibleLines) };
}

/** One sort level. The tableState's older name for it; the sort itself is a
    list. */
export type Sort<K extends string> = SortLevel<K>;

export interface TableStateOptions<Z, K extends string> {
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
   * The starting state, as the application kept it. Heeded on the first
   * render; a view handed in later goes through `restart`.
   */
  initialView?: TableView<K>;
  /**
   * Switches virtualisation on: only what stands in the scroll area is
   * rendered.
   *
   * Paging is off with it. Both at once would be a control that contradicts
   * itself - a page number promising something the scroll undoes again a
   * moment later. `pageSize` and `setPage` therefore stay without effect as
   * long as this is set. The window counts in row pitches, which the table
   * measures from its head (ADR-0042) - no height is given.
   */
  virtual?: boolean | { overscan?: number };
  /** Groups the filtered set; a page and the virtual window then count lines.
      Its identity should stay while nothing in it changes. */
  grouping?: TableInput<Z, K>["grouping"];
  /** Server mode: the rows are a server's page, `rowCount` its total. */
  server?: TableInput<Z, K>["server"];
  /** Tree rows: the rows are the roots. A tree has no pages. */
  tree?: TableInput<Z, K>["tree"];
}

export interface TableState<Z, K extends string> extends TableProjection<Z, K> {
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
  setPage: (page: number) => void;
  /** The rows a page holds now: the fitted size when the frame cut one,
      otherwise the chosen size. */
  pageSize: number;
  /** Sets the size the user or the application chose, and ends any fitted one.
      The page follows the anchor row (focus, else the current row, else the top
      row) and does not go back to page one. */
  setPageSize: (size: number) => void;
  /** The chosen size - the option until someone chooses - which the view
      carries and the frame's held height is made of; never the fitted one. */
  chosenPageSize: number;
  /** The option's size, the one a table starts with. */
  defaultPageSize: number;
  /** Who the anchor is, asked when the page size changes: the key of the row
      with focus and the current row's key. The frame sets it. */
  setAnchor: (read: () => { focus: string | null; current: string | null | undefined }) => void;
  /** The size the frame holds, apart from the chosen one: `null` for none. It
      keeps the page and the view as they are. */
  setFittedPageSize: (size: number | null) => void;
  /** Ids of the columns switched away. */
  hidden: readonly K[];
  /** Switches a column away or back. Columns that are not hideable stay, even
      when they are named here. The page stays put: the set of rows does not
      change. */
  toggleColumn: (column: K) => void;
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
  /** The part of the state an application can keep. The library puts it
      nowhere: whether and where belongs to the application. */
  view: TableView<K>;
  selection: TableSelection<string>;
  /**
   * The visible window when it virtualises - otherwise undefined.
   *
   * It goes to `<Table virtual={…}>`; `visible`
   * then carries the window instead of the page, so that a caller need not
   * touch its loop.
   */
  virtual?: VirtualRows;
  /** The row pitch the table measured from its head, for the virtual window
      (ADR-0042). Internal: the frame reports it after every layout. */
  setPitch: (pitch: number) => void;
  /** Server mode, as it was handed in. */
  server?: TableInput<Z, K>["server"];
  /** Takes a view handed in later as if it were the start: what it leaves out
      goes back to its default. */
  restart: (view: TableView<K>) => void;
}

export function useTableState<Z, K extends string = string>(
  rows: readonly Z[],
  columns: readonly ModelColumn<Z, K>[],
  options: TableStateOptions<Z, K>,
): TableState<Z, K> {
  const { rowKey, filter, defaultSort = null, initialView, virtual, grouping, server, tree } = options;

  /* What a view sets, and what it leaves out falls back to: the start as well
     as a view handed in later (`restart`). */
  const sortOf = (view: TableView<K> | undefined): readonly Sort<K>[] => {
    /* The view handed in beats the application's default: whoever opens a kept
       view wants to see its sort, not the house's. */
    if (view?.sort?.length) return [...view.sort];
    if (!defaultSort) return [];
    return Array.isArray(defaultSort) ? [...defaultSort] : [defaultSort as Sort<K>];
  };
  /* The widths come from the view, otherwise from the columns. */
  const widthsOf = (view: TableView<K> | undefined): Readonly<Record<string, number>> => {
    if (view?.widths) return { ...view.widths };
    return declaredWidths(columns);
  };
  const [search, setSearchRaw] = useState(initialView?.search ?? "");
  const [sort, setSort] = useState<readonly Sort<K>[]>(() => sortOf(initialView));
  const [page, setPageRaw] = useState(initialView?.page ?? 1);
  const [pageSize, setPageSizeRaw] = useState(
    initialView?.pageSize ?? options.pageSize ?? 10,
  );
  const [fitted, setFittedRaw] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<readonly string[]>([]);
  const [hidden, setHidden] = useState<readonly K[]>(initialView?.hidden ?? []);
  const [order, setOrder] = useState<readonly K[]>(initialView?.order ?? []);
  const [widths, setWidths] = useState<Readonly<Record<string, number>>>(() => widthsOf(initialView));
  /** Takes a view as if it were the start: what it leaves out goes back to its default. */
  const restart = (view: TableView<K>) => {
    setSearchRaw(view.search ?? "");
    setSort(sortOf(view));
    setPageRaw(view.page ?? 1);
    setPageSizeRaw(view.pageSize ?? options.pageSize ?? 10);
    setFittedRaw(null);
    setHidden(view.hidden ?? []);
    setOrder(view.order ?? []);
    setWidths(widthsOf(view));
  };

  /* Virtualising means: no pages. The model is handed the size zero, which it
     reads as "everything on one page" - the same rule it already had for a
     table without paging. */
  const modelPageSize = virtual || tree ? 0 : fitted ?? pageSize;

  /* The projection in the model's stages, each held while what it reads is
     unchanged: a page, a fold, a hidden or moved column does not filter and
     sort again. Server mode and tree rows are not staged; the model computes
     them whole. */
  const staged = !server && !tree;
  const sortedSet = useMemo(
    () => (staged ? filterSort(rows, columns, { search, filter, sort }) : null),
    [staged, rows, columns, search, filter, sort],
  );
  const groupLevels = grouping?.levels.length ? grouping : undefined;
  const groups = useMemo(
    () => (sortedSet && groupLevels ? groupStage(sortedSet.filtered, sortedSet.levels, groupLevels) : undefined),
    // The fold is not an input of the grouping: it only chooses lines.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortedSet, groupLevels?.levels, groupLevels?.aggregates, groupLevels?.compareText],
  );
  const lines = useMemo(
    () => (groups && groupLevels ? linesOf(groups, groupLevels.folded) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [groups, groupLevels?.folded],
  );
  const projection = useMemo(
    () =>
      sortedSet
        ? pageStage(columns, { page, pageSize: modelPageSize, hidden, order }, sortedSet.filtered, groups && lines ? { groups, lines } : undefined)
        : tableModel(rows, columns, { search, filter, sort, page, pageSize: modelPageSize, hidden, order, grouping, server, tree }),
    [sortedSet, groups, lines, columns, page, modelPageSize, hidden, order, rows, search, filter, sort, grouping, server, tree],
  );

  /* The hook always runs - the number of hooks must not hang on whether it
     virtualises. Without virtualisation it calculates over zero rows and the
     result is not handed out. */
  /* The pitch of a regular row until the table has measured its own. */
  const [pitch, setPitch] = useState(36);
  const rowWindow = useVirtual(virtual ? (projection.lines ?? projection.shown ?? projection.filtered).length : 0, {
    rowHeight: virtual ? pitch : 0,
    overscan: typeof virtual === "object" ? virtual.overscan : undefined,
  });

  /* `visible` is always "what is to be rendered now": with paging the page,
     with virtualisation the window. That way the loop in the caller stays the
     same. */
  const inWindow = useMemo(
    () => (virtual ? windowed(projection, rowWindow.from, rowWindow.to) : projection),
    [virtual, projection, rowWindow.from, rowWindow.to],
  );
  const windowLines = inWindow.visibleLines;
  const visible = inWindow.visible;

  // The keys of the filtered set – that is why "select all" reaches across
  // all pages and not only across the visible one.
  const keyList = useMemo(() => projection.filtered.map(rowKey), [projection.filtered, rowKey]);
  const selection = useTableSelection(keyList);

  /* A search or a column condition (both come through here) starts a virtual
     table at its top; any other shrinking keeps the position the browser clamps to. */
  const [tops, setTops] = useState(0);
  const scrollArea = rowWindow.scrollRef;
  useLayoutEffect(() => {
    const area = scrollArea.current;
    if (tops > 0) area?.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per request, not per render of the window
  }, [tops]);
  const setPage = useCallback((next: number) => {
    setPageRaw(next);
    if (next === 1) setTops((n) => n + 1);
  }, []);

  const setSearch = useCallback((value: string) => {
    setSearchRaw(value);
    setPage(1);
  }, [setPage]);

  /* The page that keeps the anchor row on a page of `size` lines: the row
     with focus, else the current row if this page shows it, else the top row.
     Read at the moment of the change, from the projection last rendered. */
  const latest = useRef({ projection, chosen: pageSize });
  useLayoutEffect(() => {
    latest.current = { projection, chosen: pageSize };
  });
  const anchorKey = useRef<() => { focus: string | null; current: string | null | undefined }>(() => ({ focus: null, current: null }));
  const pageKeeping = useCallback((size: number) => {
    const shown = latest.current.projection;
    const all: readonly Z[] = shown.lines ? shown.lines.flatMap((line) => (line.kind === "row" ? [line.row] : [])) : shown.filtered;
    const keys = all.map(rowKey);
    const onPage = new Set(shown.visible.map(rowKey));
    const { focus, current } = anchorKey.current();
    const at = [focus, current && onPage.has(current) ? current : null, shown.visible[0] ? rowKey(shown.visible[0]) : null]
      .map((key) => (key == null ? -1 : keys.indexOf(key)))
      .find((index) => index >= 0);
    return at === undefined ? 1 : Math.floor(at / size) + 1;
  }, [rowKey]);

  const setPageSize = useCallback((size: number) => {
    setPageRaw(pageKeeping(size));
    setPageSizeRaw(size);
    setFittedRaw(null);
  }, [pageKeeping]);

  const setFittedPageSize = useCallback((size: number | null) => {
    setPageRaw(pageKeeping(size ?? latest.current.chosen));
    setFittedRaw(size);
  }, [pageKeeping]);

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
    setPageRaw(1);
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

  /* What is reported is what deviates from the default - otherwise every kept
     view would carry a page size although the user did nothing. The default of
     the page size is the application's setting, not the built-in ten. */
  const defaultPageSize = options.pageSize ?? 10;

  /* The widths declared in the columns are the default. Without this
     comparison every view would carry widths before the user had dragged at
     all – the same error as with the page size. */
  const defaultWidths = useMemo(() => declaredWidths(columns), [columns]);

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
    setPitch,
    server,
    restart,
    view,
    search,
    setSearch,
    sort,
    toggleSort,
    setPage,
    pageSize: fitted ?? pageSize,
    setPageSize,
    chosenPageSize: pageSize,
    setAnchor: (read) => {
      anchorKey.current = read;
    },
    defaultPageSize,
    setFittedPageSize,
    expanded,
    toggleRow,
    hidden,
    toggleColumn,
    order,
    setOrder,
    widths,
    setWidth,
    selection,
  };
}
