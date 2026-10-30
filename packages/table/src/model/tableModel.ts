// `value` may be absent; an absent value sorts last in both directions and matches no search.

/* The model of the table: from rows and a description of the columns comes the
   projection - filtered, sorted, paged.

   An application's cells are its own (trend lines, bars, badges), so columns
   are described as data only for the pipeline - for how a value is read and
   compared - never for presentation.

   The order filter -> sort -> page is guaranteed, and figures such as the
   selection's keys come from the filtered set, not from the visible page. */

import { DEFAULT_FORMATS, treeModel } from "@umriss-ui/core";
import type { FlatteningEntry, NodeReader } from "@umriss-ui/core";
import { groupRows, linesOf, pageLines, rowsOf } from "./grouping";
import type { AggregateColumn, GroupLevel, Line, RowGroup } from "./grouping";
/** The direction of one sort level: `asc` puts the smallest value on top,
    `desc` the largest. */
export type SortDirection = "asc" | "desc";

/** A column as the model reads it - what sorting, search, hiding and the
    export need of it, not its presentation. */
export interface ModelColumn<Z, K extends string = string> {
  id: K;
  /** Human-readable label – for the column menu and the CSV header row.
      Not for the presentation of the header cell: that stays compositional. */
  label?: string;
  /** The value for sorting and searching. `null`, `undefined` and `NaN` are
      absent: they stand last in both directions and match no search. */
  value?: (row: Z) => string | number | null | undefined;
  /** A comparison of one's own; otherwise by the kind of the value. */
  compare?: (a: Z, b: Z) => number;
  /** Takes part in the free-text search.
      @default false */
  searchable?: boolean;
  /** May the user switch this column away? `false` for columns that identify
      the row – without them the table is no longer readable.
      @default true */
  hideable?: boolean;
  /** May the user drag the width? A column whose content fits anyway needs
      no grip.
      @default false */
  resizable?: boolean;
  /** Initial width in pixels; without it the browser decides. */
  width?: number;
}

/** A small helper, so that the row type is inferred rather than typed out. */
export const column = <Z,>(id: string, rest: Omit<ModelColumn<Z>, "id"> = {}): ModelColumn<Z> => ({ id, ...rest });

/** One level of the sort. Several levels act in their order: the second decides
    only what the first leaves open. */
export interface SortLevel<K extends string = string> {
  column: K;
  direction: SortDirection;
}

/** The view's state the model computes a table from, beside its rows and
    columns: search, filter, sort, page, hidden columns, order, grouping, tree. */
export interface TableInput<Z = unknown, K extends string = string> {
  search?: string;
  /** An additional filter beside the free-text search, e.g. a status choice. */
  filter?: (row: Z) => boolean;
  /** One level or several. A single level means the same as a list holding
      only it. */
  sort?: SortLevel<K> | readonly SortLevel<K>[] | null;
  /** 1-based; is clamped to the valid range. */
  page?: number;
  pageSize?: number;
  /** Ids of columns switched away. Columns that are not hideable stay. */
  hidden?: readonly K[];
  /** The wanted column order. Columns not named follow in their natural
      order; unknown ids are passed over. */
  order?: readonly K[];
  /** Groups the sorted filtered set; a page then counts lines, not rows. */
  grouping?: {
    levels: readonly GroupLevel<Z>[];
    aggregates?: readonly AggregateColumn<Z>[];
    folded: ReadonlySet<string>;
    /** The collation of text keys; the provider's, where there is one. */
    compareText?: (a: string, b: string) => number;
  };
  /** Server mode: the rows are the page a server answered, and `rowCount` is
      its filtered set. The model then searches, filters, sorts, groups and
      pages nothing - it would do it over one page and call that the whole. */
  server?: { rowCount: number };
  /** Tree rows: the rows are the roots, and these read their children. The
      model then sorts every level on its own, filters by core's path rule and
      pages nothing. */
  tree?: TreeInput<Z>;
}

/** Tree rows for the model: how a row is keyed, how its children are read,
    and which branches are open. */
export interface TreeInput<Z> {
  key: (row: Z) => string;
  /** `undefined` a leaf, an array a branch - the rule of core's reader. */
  children: (row: Z) => readonly Z[] | undefined;
  /** The keys of the open branches. */
  open: ReadonlySet<string>;
  /** The pre-filter: a row it does not admit is gone with its subtree. */
  admit?: (row: Z) => boolean;
}

/** How many lines the filtered set has: its rows, a grouping's headers and a tree's shown rows counted. */
export const lineCount = (projection: Pick<TableProjection<unknown>, "lines" | "shown" | "filtered">) =>
  (projection.lines ?? projection.shown ?? projection.filtered).length;

/** The table's pipeline as a pure function - filter, sort, page over rows and model columns. */
export interface TableProjection<Z, K extends string = string> {
  /** The visible columns in their order – the basis for the header row, the
      column menu and the CSV export. */
  columns: readonly ModelColumn<Z, K>[];
  /** Everything the filter leaves – the basis for figures and the selection. */
  filtered: Z[];
  /** Only the current page - with a grouping, the rows among its lines. */
  visible: Z[];
  /** With a grouping: the groups, outermost first. */
  groups?: RowGroup<Z>[];
  /** With a grouping: every line of the filtered set. */
  lines?: Line<Z>[];
  /** With a grouping: the lines of the current page, with what it repeats. */
  visibleLines?: Line<Z>[];
  /** Tree rows: the flattening - the rows shown, in reading order, with
      their level and state. `visible` holds their rows. */
  entries?: readonly FlatteningEntry<Z>[];
  /** Tree rows: every row the flattening shows, before a virtual window. */
  shown?: Z[];
  /** Tree rows: the roots that match or lead to a match - what a footer
      sums, since a parent already holds its children. */
  roots?: Z[];
  /** Tree rows: every row of the filtered tree in reading order, open or
      not, path rows included - what the export writes. */
  exported?: readonly FlatteningEntry<Z>[];
  /** Tree rows: how many rows the tree has on every level - what "of 1,204"
      counts, as the rows the pre-filter admits do for a flat table. */
  total?: number;
  /** The clamped page actually shown. */
  page: number;
  pageCount: number;
  columnCount: number;
}

/**
 * Brings the columns into the wanted order. Named ones first, in the order
 * they are named; unnamed ones follow in natural order; unknown ids are
 * passed over.
 *
 * The table state uses the same function for the column menu, so there is one
 * order.
 */
export function orderColumns<Z, K extends string = string>(
  columns: readonly ModelColumn<Z, K>[],
  order: readonly K[] | undefined,
): readonly ModelColumn<Z, K>[] {
  if (!order?.length) return columns;
  return [
    ...order
      .map((id) => columns.find((s) => s.id === id))
      .filter((s): s is ModelColumn<Z, K> => s !== undefined),
    ...columns.filter((s) => !order.includes(s.id)),
  ];
}

/* The collation comes from the language seam. The model is pure calculation and
   can read no context; whoever must sort differently gives the column a
   `compare` of its own - the way that already exists for it. */
const absent = (value: string | number | null | undefined): value is null | undefined =>
  value === null || value === undefined || (typeof value === "number" && Number.isNaN(value));

const defaultCompare = (a: string | number, b: string | number): number =>
  typeof a === "number" && typeof b === "number"
    ? a - b
    : DEFAULT_FORMATS.compareText(String(a), String(b));

/* The free-text search and the additional filter together. */
function matcherOf<Z, K extends string>(
  columns: readonly ModelColumn<Z, K>[],
  search: string | undefined,
  filter: ((row: Z) => boolean) | undefined,
) {
  const term = (search ?? "").trim().toLowerCase();
  const searchColumns = columns.filter((s) => s.searchable && s.value);
  const matchesSearch = (row: Z) =>
    !term ||
    searchColumns.some((s) => {
      const value = s.value!(row);
      return !absent(value) && String(value).toLowerCase().includes(term);
    });
  return { term, matches: (row: Z) => matchesSearch(row) && (filter ? filter(row) : true) };
}

/* A row with the values the sort reads from it. */
interface Keyed<Z> {
  row: Z;
  keys: (string | number | null | undefined)[];
}

/* Sort - stable, so that equal values keep their order. Levels act in
   turn: the next one comes into play only where the previous stays
   undecided. Levels without a matching column are passed over - a stale
   reference (from a stored link, say) must not blow up the
   projection. */
function sorterOf<Z, K extends string>(
  columns: readonly ModelColumn<Z, K>[],
  sort: TableInput<Z, K>["sort"],
) {
  const levels = (Array.isArray(sort) ? sort : sort ? [sort] : []) as readonly SortLevel<K>[];

  /* Each level reads its value once per row and sort, not once per comparison:
     the rows are decorated with their values, sorted, and undecorated. */
  const readers: (((row: Z) => string | number | null | undefined) | undefined)[] = [];
  const comparators = levels
    .map((level) => {
      /* `found`, not `column`: within this module the name `column` already
         belongs to the exported helper, and shadowing it here makes two
         things look like one when reading. */
      const found = columns.find((s) => s.id === level.column);
      if (!found || (!found.compare && !found.value)) return null;
      const direction = level.direction === "asc" ? 1 : -1;
      const own = found.compare;
      const read = found.value;
      const slot = readers.length;
      readers.push(read);
      if (!read) return (a: Keyed<Z>, b: Keyed<Z>) => own!(a.row, b.row) * direction;
      /* Absence is decided BEFORE the direction: multiplied by it, an absent
         value would stand first when descending. That holds even before a
         comparison of one's own, as soon as the column has a value from which
         "absent" can be read. */
      return (a: Keyed<Z>, b: Keyed<Z>) => {
        const va = a.keys[slot];
        const vb = b.keys[slot];
        if (absent(va) || absent(vb)) return absent(va) === absent(vb) ? 0 : absent(va) ? 1 : -1;
        return (own ? own(a.row, b.row) : defaultCompare(va!, vb!)) * direction;
      };
    })
    .filter((v): v is (a: Keyed<Z>, b: Keyed<Z>) => number => v !== null);

  const sorted = (list: readonly Z[]): Z[] =>
    // Array#sort is stable (ES2019), equal values keep their order.
    comparators.length === 0
      ? [...list]
      : list
          .map((row) => ({ row, keys: readers.map((read) => read?.(row)) }))
          .sort((a, b) => {
            for (const compare of comparators) {
              const result = compare(a, b);
              if (result !== 0) return result;
            }
            return 0;
          })
          .map((entry) => entry.row);
  return { levels, sorted };
}

/* The pipeline is three stages, each reading only what it names, so that a
   caller can hold the result of one while a later input changes:
   1. `filterSort` - rows, the columns' values, search, filter, sort.
   2. `groupStage` and `linesOf` - the result of 1 and the grouping; folding
      touches only `linesOf`.
   3. `pageStage` - the result of 2, the page, the order and visibility of
      columns. */

/** Stage 1: the rows the search and the filter leave, sorted. `levels` are the
    sort levels as the grouping needs them. */
export function filterSort<Z, K extends string = string>(
  rows: readonly Z[],
  columns: readonly ModelColumn<Z, K>[],
  input: Pick<TableInput<Z, K>, "search" | "filter" | "sort">,
): { filtered: Z[]; levels: readonly SortLevel<K>[] } {
  const { matches } = matcherOf(columns, input.search, input.filter);
  const { levels, sorted } = sorterOf(columns, input.sort);
  return { filtered: sorted(rows.filter(matches)), levels };
}

/** Stage 2: the groups of the sorted set, with their aggregates - after the
    sort, so that the rows within a group keep its order. */
export function groupStage<Z, K extends string = string>(
  filtered: readonly Z[],
  levels: readonly SortLevel<K>[],
  grouping: NonNullable<TableInput<Z, K>["grouping"]>,
): RowGroup<Z>[] {
  return groupRows(filtered, { levels: grouping.levels, aggregates: grouping.aggregates, compareText: grouping.compareText, sort: levels });
}

/** Stage 3: the visible columns and the page. With a grouping a page counts
    lines, not rows; the page count is never zero, so that display and controls
    cannot contradict each other. */
export function pageStage<Z, K extends string = string>(
  columns: readonly ModelColumn<Z, K>[],
  input: Pick<TableInput<Z, K>, "page" | "pageSize" | "hidden" | "order">,
  filtered: Z[],
  grouped?: { groups: RowGroup<Z>[]; lines: Line<Z>[] },
): TableProjection<Z, K> {
  const { page = 1, pageSize, hidden, order } = input;
  const visibleColumns = visibleOf(columns, hidden, order);
  if (grouped) {
    const paged = pageLines(grouped.lines, page, pageSize ?? 0);
    return {
      columns: visibleColumns,
      filtered,
      visible: rowsOf(paged.lines),
      groups: grouped.groups,
      lines: grouped.lines,
      visibleLines: paged.lines,
      page: paged.page,
      pageCount: paged.pageCount,
      columnCount: visibleColumns.length,
    };
  }
  const size = pageSize && pageSize > 0 ? pageSize : filtered.length || 1;
  const pageCount = Math.max(1, Math.ceil(filtered.length / size));
  const currentPage = Math.min(Math.max(1, page), pageCount);
  return {
    columns: visibleColumns,
    filtered,
    visible: filtered.slice((currentPage - 1) * size, currentPage * size),
    page: currentPage,
    pageCount,
    columnCount: visibleColumns.length,
  };
}

/* Order first, then hide - the order must not change because of what happens
   to be away. Hiding is pure presentation: the pipeline works with all
   columns, so that a sort by a hidden column is preserved. */
const visibleOf = <Z, K extends string>(
  columns: readonly ModelColumn<Z, K>[],
  hidden: readonly K[] | undefined,
  order: readonly K[] | undefined,
) => {
  const ordered = orderColumns(columns, order);
  return hidden?.length ? ordered.filter((s) => s.hideable === false || !hidden.includes(s.id)) : ordered;
};

/** The table's pipeline as a pure function - filter, sort, page over rows and model columns. */
export function tableModel<Z, K extends string = string>(
  rows: readonly Z[],
  columns: readonly ModelColumn<Z, K>[],
  input: TableInput<Z, K>,
): TableProjection<Z, K> {
  const { page = 1, pageSize, hidden, order } = input;

  /* Server mode: the rows stand as the server sent them. Only the page count
     is the table's, from the server's total; the page is clamped only against
     a total that is known - with none yet (the first request is still out),
     the page of a view handed in would otherwise fall back to one. */
  if (input.server) {
    const visibleColumns = visibleOf(columns, hidden, order);
    const { rowCount } = input.server;
    const size = pageSize && pageSize > 0 ? pageSize : Math.max(rowCount, 1);
    const pageCount = Math.max(1, Math.ceil(rowCount / size));
    const currentPage = rowCount > 0 ? Math.min(Math.max(1, page), pageCount) : Math.max(1, page);
    return {
      columns: visibleColumns,
      filtered: [...rows],
      visible: [...rows],
      page: currentPage,
      pageCount,
      columnCount: visibleColumns.length,
    };
  }

  if (input.tree) {
    const { term, matches } = matcherOf(columns, input.search, input.filter);
    const { sorted } = sorterOf(columns, input.sort);
    return treeProjection(rows, input.tree, sorted, term || input.filter ? matches : undefined, visibleOf(columns, hidden, order));
  }

  const { filtered, levels } = filterSort(rows, columns, input);
  if (!input.grouping?.levels.length) return pageStage(columns, input, filtered);
  const groups = groupStage(filtered, levels, input.grouping);
  return pageStage(columns, input, filtered, { groups, lines: linesOf(groups, input.grouping.folded) });
}

/* Tree rows: the levels are sorted one by one and handed to core's
   flattening, never walked a second way. Sorting happens per level - siblings
   among siblings - so a child never leaves its parent. */
function treeProjection<Z, K extends string>(
  rows: readonly Z[],
  tree: TreeInput<Z>,
  sorted: (list: readonly Z[]) => Z[],
  matches: ((row: Z) => boolean) | undefined,
  columns: readonly ModelColumn<Z, K>[],
): TableProjection<Z, K> {
  const { admit } = tree;
  const level = (list: readonly Z[]) => sorted(admit ? list.filter(admit) : list);
  const childrenOf = new Map<Z, readonly Z[] | undefined>();
  const reader: NodeReader<Z> = {
    key: tree.key,
    children: (row) => {
      if (!childrenOf.has(row)) {
        const children = tree.children(row);
        childrenOf.set(row, children && level(children));
      }
      return childrenOf.get(row);
    },
    label: () => "",
    matches,
  };
  const roots = level(rows);
  const state = { expanded: tree.open, checked: new Set<string>(), active: null, anchor: null, search: "" };
  const entries = treeModel(roots, reader, state);

  /* Every branch open: the whole filtered tree, for the export and the sets. */
  const everyKey = new Set<string>();
  let total = 0;
  const walk = (list: readonly Z[]) => {
    for (const row of list) {
      total++;
      const children = reader.children(row);
      if (children) {
        everyKey.add(tree.key(row));
        walk(children);
      }
    }
  };
  walk(roots);
  const whole = treeModel(roots, reader, { ...state, expanded: everyKey });
  const shown = entries.map((e) => e.node);

  return {
    columns,
    filtered: whole.filter((e) => e.matches).map((e) => e.node),
    visible: shown,
    entries,
    shown,
    roots: whole.filter((e) => e.level === 0).map((e) => e.node),
    exported: whole.filter((e) => e.matches || e.pathOnly),
    total,
    page: 1,
    pageCount: 1,
    columnCount: columns.length,
  };
}

/** A sum over a set of rows - meant for `filtered`, not for `visible`. */
export const sum = <Z,>(rows: readonly Z[], value: (row: Z) => number): number =>
  rows.reduce((total, row) => total + value(row), 0);
