/* useTable - where the row type is bound (ADR-0017).

   The hook derives the row type from the rows and hands out the parts that need
   it. Its state is that of the companion from table-model (page one after
   search, sort and page size; the three-step additional sort; the view without
   default values), taken over unchanged. What is new is where the columns come
   from: from the registration instead of from a field the caller writes.

   The application's view is taken over on the first render, BEFORE a column has
   registered, and checked against the columns only on reading
   (umriss-table 11): names no registered column carries fall out of `view` and
   `sort`. Because the body calculates with the columns of its own pass, even the
   first rendered rows show the sort of the view.

   The order (table-filters): pre-filter -> search and conditions -> sort ->
   page. The pre-filter determines which rows the table has; the conditions of
   the column filters the hook holds itself, in the order in which they were
   set. */

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useFormats } from "@umriss-ui/core";
import { useCompanion } from "./model/companion";
import type { TableView } from "./model/view";
import type { Column } from "./model/tableModel";
import { Registry } from "./registry";
import type { ColumnEntry } from "./registry";
import { buildParts } from "./parts";
import { buildVerdictColumn } from "./VerdictColumn";
import { csvOf } from "./export";
import { warnOnce } from "./dev";
import { satisfies, filterOf, checkCondition } from "./columnFilter";
import type { SetFilter, Table, TableOptions, TableSnapshot } from "./types";

/** The conditions per column, in the order in which they were set. */
type ConditionList = readonly (readonly [string, unknown])[];

const warnForeign = (column: string) =>
  warnOnce(
    `condition-foreign:${column}`,
    `The condition for "${column}" is not of the kind of its filter and is passed over.`,
  );

/** Does the condition apply at the registered column? Not when the column does
    not exist, has no filter, or the condition is not of its kind or requires
    nothing. */
function appliesTo(registry: Registry, column: string, condition: unknown): boolean {
  const entry = registry.columnById(column);
  const filter = entry ? filterOf(entry.spec.filter) : undefined;
  if (!filter) return false;
  const check = checkCondition(filter, condition);
  if (check === "foreign") warnForeign(column);
  return check === "effective";
}

/** The conditions, united into one function. The columns are looked up on the
    call, not on building: that way the function stays stable when columns
    register, and a filter of one's own is asked with its latest spec each
    time. */
function combineConditions(conditions: ConditionList, registry: Registry): ((row: unknown) => boolean) | undefined {
  if (conditions.length === 0) return undefined;
  let resolvedFor = -1;
  let resolved: { entry: ColumnEntry; condition: unknown }[] = [];
  return (row) => {
    if (resolvedFor !== registry.structureVersion()) {
      resolvedFor = registry.structureVersion();
      resolved = [];
      for (const [column, condition] of conditions) {
        const entry = registry.columnById(column);
        if (entry && appliesTo(registry, column, condition)) resolved.push({ entry, condition });
      }
    }
    return resolved.every(({ entry, condition }) => {
      const filter = filterOf(entry.spec.filter);
      return !filter || satisfies(filter, entry.read(row), condition);
    });
  };
}

/** The rows the pre-filter admits - with the same identity as long as they are
    the same ones out of the same rows. A pre-filter written in the call is a new
    function on every render; without this reconciliation the model, the sort and
    everything that remembers something by the rows would recalculate on every
    render - including on every scroll of a virtualised table. */
function useAdmitted(
  rows: readonly unknown[],
  preFilter: ((row: unknown) => boolean) | undefined,
): readonly unknown[] {
  const fresh = useMemo(() => (preFilter ? rows.filter((row) => preFilter(row)) : rows), [rows, preFilter]);
  const [memo, setMemo] = useState(() => ({ source: rows, result: fresh }));
  if (!preFilter) return rows;
  const same =
    memo.source === rows &&
    (memo.result === fresh ||
      (memo.result.length === fresh.length && memo.result.every((row, i) => row === fresh[i])));
  if (!same) setMemo({ source: rows, result: fresh });
  return same ? memo.result : fresh;
}

/** The view without names that no registered column carries. As long as none
    has registered it stays as it is - otherwise the first render would erase
    every view. */
function onlyKnown(view: TableView, known: ReadonlySet<string>): TableView {
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

const sameSet = (a: ReadonlySet<string>, b: ReadonlySet<string>): boolean =>
  a.size === b.size && [...a].every((id) => b.has(id));

/** The widths that hold: those of the columns, and over them the dragged ones. */
function effectiveWidths(
  columns: readonly Column<unknown>[],
  dragged: Readonly<Record<string, number>>,
): Readonly<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const s of columns) if (s.width !== undefined) out[s.id] = s.width;
  return { ...out, ...dragged };
}

export function useTable<Z>(rows: readonly Z[], options: TableOptions<Z>): Table<Z> {
  const [registry] = useState(() => new Registry());
  const [parts] = useState(() => {
    const bound = buildParts(registry);
    return { ...bound, VerdictColumn: buildVerdictColumn(bound.Column) };
  });

  /* The hook re-renders when a column comes or goes - not when only a children
     function is new (registry.ts). */
  useSyncExternalStore(registry.subscribe, registry.structureVersion, registry.structureVersion);
  const formats = useFormats();
  const rowsUnknown = rows as readonly unknown[];
  const modelColumns = registry.modelColumns(rowsUnknown, formats);

  const [start] = useState<TableView | undefined>(() => options.initialView);

  /* The conditions of the view hold already in the first render: the table
     never appears unfiltered only to jump afterwards. */
  const [conditions, setConditions] = useState<ConditionList>(() => Object.entries(start?.conditions ?? {}));
  const filter = useMemo(() => combineConditions(conditions, registry), [conditions, registry]);

  /* The pre-filter determines which rows the table has - it is not a condition
     it reacts to. It runs before search and conditions, and everything further
     calculates with what it admits. */
  const preFilter = (options.preFilter ?? options.filter) as ((row: unknown) => boolean) | undefined;
  const admitted = useAdmitted(rowsUnknown, preFilter);

  const rowKey = options.rowKey as (row: unknown) => string;
  const b = useCompanion(admitted, modelColumns, {
    rowKey,
    pageSize: options.pageSize,
    defaultSort: options.defaultSort,
    filter,
    initialView: start,
    virtual: options.virtual,
  });

  /* Changing a condition resets to page one, like another search. Only what
     fits the registered column is set; as long as none has registered nothing
     is checked - then there is nothing known to check against. */
  const { setPage } = b;
  const setFilter = useCallback(
    (column: string, condition: unknown) => {
      let clear = condition === null || condition === undefined;
      if (!clear && registry.orderedColumns().length > 0) {
        const entry = registry.columnById(column);
        const kind = entry ? filterOf(entry.spec.filter) : undefined;
        if (!kind) {
          warnOnce(
            `condition-without-filter:${column}`,
            entry
              ? `The column "${column}" has no filter; its condition is passed over.`
              : `No column is called "${column}"; its condition is passed over.`,
          );
          return;
        }
        const check = checkCondition(kind, condition);
        if (check === "foreign") {
          warnForeign(column);
          return;
        }
        clear = check === "empty";
      }
      setConditions((old) => {
        const index = old.findIndex(([id]) => id === column);
        if (clear) return index === -1 ? old : old.filter((_, i) => i !== index);
        /* A new condition is added at the end; a changed one stays where it
           stands - otherwise the conditions would jump about in the toolbar. */
        if (index === -1) return [...old, [column, condition] as const];
        return old.map((entry, i) => (i === index ? ([column, condition] as const) : entry));
      });
      setPage(1);
    },
    [registry, setPage],
  );

  const known = new Set(registry.orderedColumns().map((e) => e.spec.id));

  /* D6: a condition goes with its column. If a column leaves the JSX, its
     condition is taken out of the state; when it comes back it has none. Unlike
     width and order, which survive a return: a returned width hides no row, a
     returned condition does - without the user having set it. A hidden column
     is still there and keeps its own.

     This is recognised while the hook renders, against the columns it last saw
     - not in the column's cleanup: that also runs on the Strict Mode's trial
     unmount, and there a condition of the view would be lost. */
  const [seen, setSeen] = useState<ReadonlySet<string>>(() => new Set());
  if (!sameSet(seen, known)) {
    const gone = new Set([...seen].filter((id) => !known.has(id)));
    setSeen(known);
    if (conditions.some(([id]) => gone.has(id))) {
      setConditions((old) => old.filter(([id]) => !gone.has(id)));
    }
  }

  const effective = known.size === 0 ? conditions : conditions.filter(([id, condition]) => appliesTo(registry, id, condition));
  const withoutConditions = onlyKnown(b.view, known);
  const view: TableView =
    effective.length > 0 ? { ...withoutConditions, conditions: Object.fromEntries(effective) } : withoutConditions;
  const sort = known.size === 0 ? b.sort : b.sort.filter((s) => known.has(s.column));

  /* Without a pagination bar there are no pages (registry.ts). */
  const paginates = registry.paginates() || options.virtual !== undefined;

  const snapshot: TableSnapshot<Z> = {
    rows,
    filtered: b.filtered as Z[],
    visible: (paginates ? b.visible : b.filtered) as Z[],
    page: paginates ? b.page : 1,
    pageCount: paginates ? b.pageCount : 1,
    pageSize: b.pageSize,
    setPage: b.setPage,
    setPageSize: b.setPageSize,
    search: b.search,
    setSearch: b.setSearch,
    sort,
    toggleSort: b.toggleSort,
    hidden: b.hidden,
    toggleColumn: b.toggleColumn,
    order: b.order,
    setOrder: b.setOrder,
    widths: effectiveWidths(modelColumns, b.widths),
    setWidth: b.setWidth,
    expanded: b.expanded,
    toggleRow: b.toggleRow,
    filter: Object.fromEntries(effective),
    setFilter: setFilter as SetFilter<Z>,
    selection: options.selection ?? b.selection,
    view,
    asCsv: () => csvOf(registry),
    virtual: options.virtual !== undefined,
  };

  // Idempotent for the same snapshot (registry.ts, guarantee 1).
  registry.setHook({
    rows: rowsUnknown,
    admitted,
    modelColumns,
    companion: b,
    filter,
    publicSnapshot: snapshot as unknown as TableSnapshot<unknown>,
    rowKey,
    formats,
  });

  return { ...snapshot, ...parts } as unknown as Table<Z>;
}
