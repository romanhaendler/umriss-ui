// Extended by absent values (umriss-table 07): `value` may be absent, and an
// absent value sorts last in both directions and matches no search.

/* The model of the table: from rows and a description of the columns comes the
   projection - filtered, sorted, paged.

   The rendering parts (Table, Th, Td) stay as they are: an application's cells
   are its own (trend lines, bars, badges) and are meant to stay that way.
   Columns are therefore described as data only for the pipeline - for how a
   value is read and compared - never for presentation.

   The order filter -> sort -> page is guaranteed, and figures such as the
   selection's keys come from the filtered set, not from the visible page.
   That is exactly what the application had to know, and to assemble correctly
   itself, until now. */

import { DEFAULT_FORMATS, treeModel } from "@umriss-ui/core";
import type { FlatteningEntry, NodeReader } from "@umriss-ui/core";
import { groupRows, linesOf, pageLines, rowsOf } from "./grouping";
import type { AggregateColumn, GroupLevel, Line, RowGroup } from "./grouping";
/* Once stood in `Table.tsx` of @umriss-ui/core. */
/** The direction of one sort level: `asc` puts the smallest value on top,
    `desc` the largest. */
export type SortDirection = "asc" | "desc";

export interface Column<Z, K extends string = string> {
  id: K;
  /** Human-readable label – for the column menu and the CSV header row.
      Not for the presentation of the header cell: that stays compositional. */
  label?: string;
  /** The value for sorting and searching. `null`, `undefined` and `NaN` are
      absent: they stand last in both directions and match no search. */
  value?: (row: Z) => string | number | null | undefined;
  /** A comparison of one's own; otherwise by the kind of the value. */
  compare?: (a: Z, b: Z) => number;
  /** Takes part in the free-text search (default: no). */
  searchable?: boolean;
  /** May the user switch this column away? Default yes. `false` for columns
      that identify the row – without them the table is no longer
      readable. */
  hideable?: boolean;
  /** May the user drag the width? Default no – a column whose content fits
      anyway needs no grip. */
  resizable?: boolean;
  /** Initial width in pixels; without it the browser decides. */
  width?: number;
}

/** A small helper, so that the row type is inferred rather than typed out. */
export const column = <Z,>(id: string, rest: Omit<Column<Z>, "id"> = {}): Column<Z> => ({ id, ...rest });

/** One level of the sort. Several levels act in their order: the second decides
    only what the first leaves open. */
export interface SortLevel<K extends string = string> {
  column: K;
  direction: SortDirection;
}

export interface TableInput<Z = unknown, K extends string = string> {
  search?: string;
  /** An additional filter beside the free-text search, e.g. a status choice. */
  filter?: (row: Z) => boolean;
  /** One level or several. A single level means the same as a list holding
      only it – which is why callers that still pass a single object remain
      correct unchanged. */
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
  /** Manual mode: the rows are the page a server answered, and `rowCount` is
      its filtered set. The model then searches, filters, sorts, groups and
      pages nothing - it would do it over one page and call that the whole. */
  manual?: { rowCount: number };
  /** Tree rows: the rows are the roots, and these read their children. The
      model then sorts every level on its own, filters by core's path rule and
      pages nothing (table-tree-rows). */
  tree?: TreeInput<Z>;
}

export interface TreeInput<Z> {
  key: (row: Z) => string;
  /** `undefined` a leaf, an array a branch - the rule of core's reader. */
  children: (row: Z) => readonly Z[] | undefined;
  /** The keys of the open branches. */
  open: ReadonlySet<string>;
  /** The pre-filter: a row it does not admit is gone with its subtree. */
  admit?: (row: Z) => boolean;
}

export interface TableProjection<Z, K extends string = string> {
  /** The visible columns in their order – the basis for the header row, the
      column menu and the CSV export. */
  columns: readonly Column<Z, K>[];
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
 * Lives here and not in the body of the model, because the companion needs the
 * same order for the column menu – written twice they would be two orders that
 * can drift apart.
 */
export function orderColumns<Z, K extends string = string>(
  columns: readonly Column<Z, K>[],
  order: readonly K[] | undefined,
): readonly Column<Z, K>[] {
  if (!order?.length) return columns;
  return [
    ...order
      .map((id) => columns.find((s) => s.id === id))
      .filter((s): s is Column<Z, K> => s !== undefined),
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

export function tableModel<Z, K extends string = string>(
  rows: readonly Z[],
  columns: readonly Column<Z, K>[],
  input: TableInput<Z, K>,
): TableProjection<Z, K> {
  const {
    search = "",
    filter,
    sort = null,
    page = 1,
    pageSize,
    hidden,
    order,
  } = input;

  /* 0. Order the columns and sift them. Order first, then hide - the order
        must not change because of what happens to be away. Hiding is pure
        presentation: the pipeline below goes on working with all columns, so
        that a sort by a hidden column is preserved. */
  const ordered = orderColumns(columns, order);

  const visibleColumns = hidden?.length
    ? ordered.filter((s) => s.hideable === false || !hidden.includes(s.id))
    : ordered;

  /* Manual mode: the rows stand as the server sent them. Only the page count
     is the table's, from the server's total; the page is clamped only against
     a total that is known - with none yet (the first request is still out),
     the page of a view handed in would otherwise fall back to one. */
  if (input.manual) {
    const { rowCount } = input.manual;
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

  // 1. Filter - free text and the additional filter together.
  const term = search.trim().toLowerCase();
  const searchColumns = columns.filter((s) => s.searchable && s.value);
  const matchesSearch = (row: Z) =>
    !term ||
    searchColumns.some((s) => {
      const value = s.value!(row);
      return !absent(value) && String(value).toLowerCase().includes(term);
    });
  const matches = (row: Z) => matchesSearch(row) && (filter ? filter(row) : true);

  /* 2. Sort - stable, so that equal values keep their order. Levels act in
        turn: the next one comes into play only where the previous stays
        undecided. Levels without a matching column are passed over - a stale
        reference (from a stored link, say) must not blow up the
        projection. */
  const levels = (Array.isArray(sort) ? sort : sort ? [sort] : []) as
    readonly SortLevel<K>[];

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
      if (!read) return (a: Z, b: Z) => own!(a, b) * direction;
      /* Absence is decided BEFORE the direction: multiplied by it, an absent
         value would stand first when descending. That holds even before a
         comparison of one's own, as soon as the column has a value from which
         "absent" can be read. */
      return (a: Z, b: Z) => {
        const va = read(a);
        const vb = read(b);
        if (absent(va) || absent(vb)) return absent(va) === absent(vb) ? 0 : absent(va) ? 1 : -1;
        return (own ? own(a, b) : defaultCompare(va, vb)) * direction;
      };
    })
    .filter((v): v is (a: Z, b: Z) => number => v !== null);

  const sorted = (list: readonly Z[]): Z[] =>
    // Array#sort is stable (ES2019), equal values keep their order.
    comparators.length === 0
      ? [...list]
      : [...list].sort((a, b) => {
          for (const compare of comparators) {
            const result = compare(a, b);
            if (result !== 0) return result;
          }
          return 0;
        });

  if (input.tree) return treeProjection(rows, input.tree, sorted, term || filter ? matches : undefined, visibleColumns);

  const filtered = sorted(rows.filter(matches));

  /* 3. Group - after the sort, so that the rows within a group keep its
        order. A page then counts lines (table-grouping, Q9). */
  if (input.grouping?.levels.length) {
    const { folded, ...grouping } = input.grouping;
    const groups = groupRows(filtered, { ...grouping, sort: levels });
    const lines = linesOf(groups, folded);
    const paged = pageLines(lines, page, pageSize ?? 0);
    return {
      columns: visibleColumns,
      filtered,
      visible: rowsOf(paged.lines),
      groups,
      lines,
      visibleLines: paged.lines,
      page: paged.page,
      pageCount: paged.pageCount,
      columnCount: visibleColumns.length,
    };
  }

  // 4. Page - the page count is never zero, so that display and controls
  //    cannot contradict each other.
  const size = pageSize && pageSize > 0 ? pageSize : filtered.length || 1;
  const pageCount = Math.max(1, Math.ceil(filtered.length / size));
  const currentPage = Math.min(Math.max(1, page), pageCount);
  const visible = filtered.slice((currentPage - 1) * size, currentPage * size);

  return {
    columns: visibleColumns,
    filtered,
    visible,
    page: currentPage,
    pageCount,
    columnCount: visibleColumns.length,
  };
}

/* Tree rows: the levels are sorted one by one and handed to core's
   flattening, never walked a second way. Sorting happens per level - siblings
   among siblings - so a child never leaves its parent. */
function treeProjection<Z, K extends string>(
  rows: readonly Z[],
  tree: TreeInput<Z>,
  sorted: (list: readonly Z[]) => Z[],
  matches: ((row: Z) => boolean) | undefined,
  columns: readonly Column<Z, K>[],
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
