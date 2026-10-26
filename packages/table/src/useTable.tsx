/* useTable - where the row type is bound (ADR-0017).

   The hook derives the row type from the rows and hands out the parts that need
   it. Its state is that of the tableState (page one after search, sort and page
   size; the three-step additional sort; the view without default values). The
   columns come from the registration, not from a field the caller writes.

   The application's `initialView` is read once and taken over on the first
   render, before a column has registered, and checked against the columns only
   on reading: names no registered column carries fall out of `view` and
   `sort`. Because the body calculates with the columns of its own pass, even the
   first rendered rows show the sort of the view.

   The order: pre-filter -> search and conditions -> sort ->
   page. The pre-filter determines which rows the table has; the conditions of
   the column filters the hook holds itself, in the order in which they were
   set. */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { allBranches, duplicateKey, useFormats, useWording, zoneFields } from "@umriss-ui/core";
import type { NodeReader } from "@umriss-ui/core";
import { declaredWidths, useTableState } from "./model/tableState";
import { MOST_LEVELS, livePaths } from "./model/grouping";
import type { RowGroup } from "./model/grouping";
import { pinsForView, withPin } from "./model/pinning";
import type { Pin, Pins } from "./model/pinning";
import { requestKey, onlyKnown, viewKey } from "./model/view";
import type { TableRequest, TableView } from "./model/view";
import type { ModelColumn } from "./model/tableModel";
import { Registry, fnEqual } from "./registry";
import { buildParts } from "./parts";
import { buildVerdictColumn } from "./VerdictColumn";
import { csv, selectionText, sheetOf } from "./export";
import { DEV, asRows, probeStale, warnOnce } from "./dev";
import { focusCell, scrollToRow } from "./reach";
import { satisfies, filterOf, checkCondition } from "./columnFilter";
import type { RowFilter } from "./rowFilter";
import type { ExportFormat, SetFilter, Table, TableOptions, TableSnapshot } from "./types";

/** The conditions per column or row filter, in the order in which they were set. */
type ConditionList = readonly (readonly [string, unknown])[];

/** The row filters a table was given, by id. */
type RowFilters = ReadonlyMap<string, RowFilter<unknown, unknown>>;

const NO_ROW_FILTERS: readonly RowFilter<unknown, unknown>[] = [];

const warnForeign = (column: string) =>
  warnOnce(
    `condition-foreign:${column}`,
    `The condition for "${column}" is not of the kind of its filter and is passed over.`,
  );

/** Does the condition apply at the registered column? Not when the column does
    not exist, has no filter, or the condition is not of its kind or requires
    nothing. */
/** The pause without a keystroke after which a typed search is reported in server mode. */
const PAUSE_MS = 300;

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
    time. A row filter is asked the whole row. */
function combineConditions(
  conditions: ConditionList,
  registry: Registry,
  rowFilters: RowFilters,
  timeZone: string | undefined,
): ((row: unknown) => boolean) | undefined {
  if (conditions.length === 0) return undefined;
  let resolvedFor = -1;
  let resolved: ((row: unknown) => boolean)[] = [];
  return (row) => {
    if (resolvedFor !== registry.structureVersion()) {
      resolvedFor = registry.structureVersion();
      resolved = [];
      for (const [id, condition] of conditions) {
        const rowFilter = rowFilters.get(id);
        if (rowFilter) {
          resolved.push((r) => rowFilter.matches(r, condition));
          continue;
        }
        const entry = registry.columnById(id);
        if (entry && appliesTo(registry, id, condition)) {
          resolved.push((r) => {
            const filter = filterOf(entry.spec.filter);
            return !filter || satisfies(filter, entry.read(r), condition, timeZone);
          });
        }
      }
    }
    return resolved.every((matches) => matches(row));
  };
}

/** An accessor written in the call, held while the next one is equal to it
    (fnEqual): its identity keys the memos below. */
function useAccessor<F>(fn: F, rows: readonly unknown[]): F {
  // Boxed: useState would call a function as its initialiser.
  const [held, setHeld] = useState({ fn });
  if (fnEqual(held.fn, fn)) {
    probeStale("The rowKey", held.fn, fn, rows);
    return held.fn;
  }
  setHeld({ fn });
  return fn;
}

/** The rows the pre-filter admits - with the same identity as long as they are
    the same ones out of the same rows. A pre-filter written in the call is a new
    function on every render; without this reconciliation the model, the sort and
    everything that remembers something by the rows would recalculate on every
    render - including on every scroll of a virtualised table. The admitted
    rows are compared, not the rows they came from: rows written in the call
    are new on every render too, and a comparison by their identity would set
    the state on every render without end. */
function useAdmitted(
  rows: readonly unknown[],
  preFilter: ((row: unknown) => boolean) | undefined,
): readonly unknown[] {
  const fresh = useMemo(() => (preFilter ? rows.filter((row) => preFilter(row)) : rows), [rows, preFilter]);
  const [memo, setMemo] = useState(fresh);
  if (!preFilter) return rows;
  const same = memo === fresh || (memo.length === fresh.length && memo.every((row, i) => row === fresh[i]));
  if (!same) setMemo(fresh);
  return same ? memo : fresh;
}

const listOf = (grouping: string | readonly string[] | undefined): string[] =>
  grouping === undefined ? [] : typeof grouping === "string" ? [grouping] : [...grouping];

const sameList = (a: readonly string[], b: readonly string[]): boolean => a.length === b.length && a.every((id, i) => id === b[i]);

/** The paths of every group - each one folds, one of a single row as well. */
function foldablePaths(groups: readonly RowGroup<unknown>[] | undefined): string[] {
  const out: string[] = [];
  const walk = (groups: readonly RowGroup<unknown>[]) => {
    for (const group of groups) {
      out.push(group.path);
      walk(group.groups);
    }
  };
  walk(groups ?? []);
  return out;
}

/** The keys of the branches on the first `levels` levels - `1` the roots. */
function branchesTo(rows: readonly unknown[], reader: NodeReader<unknown>, levels: number): string[] {
  const out: string[] = [];
  const walk = (list: readonly unknown[], level: number) => {
    if (level >= levels) return;
    for (const row of list) {
      const children = reader.children(row);
      if (children?.length) {
        out.push(reader.key(row));
        walk(children, level + 1);
      }
    }
  };
  walk(rows, 0);
  return out;
}

const sameSet = (a: ReadonlySet<string>, b: ReadonlySet<string>): boolean =>
  a.size === b.size && [...a].every((id) => b.has(id));

/** The widths that hold: those of the columns, and over them the dragged ones. */
function effectiveWidths(
  columns: readonly ModelColumn<unknown>[],
  dragged: Readonly<Record<string, number>>,
): Readonly<Record<string, number>> {
  return { ...declaredWidths(columns), ...dragged };
}

/** A table over your rows: the hook holds its state - sort, filters, search,
    grouping, page, selection, column widths -, and the parts it returns are
    typed at your row, so that a field name in `Column` is checked by the
    compiler.
    @param rows All rows in automatic mode; in server mode the page a server
    delivered for the current view.
    @param options How a row is keyed, the view to start from and the handler
    that hears every change of it, and in server mode the server's count and
    the handler that hears every request.
    @returns The table's state and its parts: `Table`, `Column`,
    `VerdictColumn`, `RowDetail`, `RowActions`, `Action` and `GroupBy`. Pass it
    as `of` to a part that stands outside the table. */
export function useTable<Z>(rows: readonly Z[], options: Extract<TableOptions<Z>, { server: true }>): Table<Z, true>;
export function useTable<Z>(rows: readonly Z[], options: TableOptions<Z>): Table<Z>;
export function useTable<Z>(given: readonly Z[], options: TableOptions<Z>): Table<Z, boolean> {
  const rows = asRows(given, "the rows of useTable");
  const [registry] = useState(() => new Registry());
  registry.setRows(rows);
  const [parts] = useState(() => {
    const bound = buildParts(registry);
    return { ...bound, VerdictColumn: buildVerdictColumn(bound.Column) };
  });

  /* The hook re-renders when a column comes or goes - not when only a children
     function is new (registry.ts). */
  useSyncExternalStore(registry.subscribe, registry.structureVersion, registry.structureVersion);
  const formats = useFormats();
  const wording = useWording();
  const rowsUnknown = rows as readonly unknown[];
  const modelColumns = registry.modelColumns(rowsUnknown, formats);

  const [start] = useState<TableView | undefined>(() => options.initialView);

  /* Server mode: the rows are one page of a server's.
     What the table would otherwise do over all rows - the pre-filter, the
     grouping, virtualisation - it would do over one page and call that the
     whole, so it is passed over, and said so once in development. */
  const server = options.server === true;
  const rowCount = options.server ? options.rowCount : 0;
  const serverInput = useMemo(() => (server ? { rowCount } : undefined), [server, rowCount]);
  registry.setServer(server);
  if (server) {
    if (options.preFilter) {
      warnOnce("server-prefilter", "`preFilter` is passed over in server mode: the server decides which rows the table has.");
    }
    if (options.virtual) {
      warnOnce("server-virtual", "`virtual` is passed over in server mode: the table pages instead.");
    }
    if (options.defaultGrouping !== undefined || start?.grouping?.length) {
      warnOnce("server-grouping", "A grouping is passed over in server mode: the groups would be the page's, not the server's.");
    }
  }

  /* The conditions of the view hold already in the first render: the table
     never appears unfiltered only to jump afterwards. */
  const [conditions, setConditions] = useState<ConditionList>(() => Object.entries(start?.conditions ?? {}));

  /* The row filters by id. They are defined outside the component; a list
     written in the call is new on every render, so the map follows the ids -
     and a filter is known by its id, not by the object (one made anew in a
     render is the same filter). */
  const rowFilterList = (options.rowFilters ?? NO_ROW_FILTERS) as readonly RowFilter<unknown, unknown>[];
  const rowFilterIds = rowFilterList.map((f) => f.id).join("\u0000");
  const rowFilters: RowFilters = useMemo(
    () => new Map(rowFilterList.map((f) => [f.id, f])),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the filters by their ids; they are defined outside the component
    [rowFilterIds],
  );
  for (const f of rowFilterList) {
    if (registry.columnById(f.id)) {
      warnOnce(`row-filter-column:${f.id}`, `The row filter "${f.id}" has the id of a column; a condition under that id is the row filter's, and the column's filter cannot hold one of its own.`);
    }
  }
  const filter = useMemo(() => combineConditions(conditions, registry, rowFilters, formats.timeZone), [conditions, registry, rowFilters, formats.timeZone]);

  /* The pre-filter determines which rows the table has - it is not a condition
     it reacts to. It runs before search and conditions, and everything further
     calculates with what it admits. */
  const preFilter = (options.preFilter) as ((row: unknown) => boolean) | undefined;
  const admitted = useAdmitted(rowsUnknown, server ? undefined : preFilter);

  /* The grouping is held here, not in the tableState: which ids it may carry
     only the registry knows. An id nothing groupable carries falls out on
     reading - as long as nothing has registered, the grouping stays as it is. */
  const [groupingState, setGroupingState] = useState<readonly string[]>(() =>
    start?.grouping ? [...start.grouping] : listOf(options.defaultGrouping),
  );
  const [foldedState, setFoldedState] = useState<readonly string[]>(() => start?.folded ?? []);
  /* The pins the user chose, whole; `null` while the declared ones hold. They
     are held here and not in the tableState for the grouping's reason: what is
     declared only the registry knows. */
  const [pinsChosen, setPinsChosen] = useState<Pins | null>(() => (start?.pinned ? { ...start.pinned } : null));
  const rowKey = useAccessor(options.rowKey, rowsUnknown) as (row: unknown) => string;
  /* Tree rows: the rows are the roots, and their levels
     come from their children. A grouping would build levels a second way, and
     pages would tear rows from their parents - both are passed over. The
     children function is read through a holder the commit updates: written in
     the call it is new on every render, and the model would recalculate on
     every scroll. */
  const childRows = options.server ? undefined : (options.childRows as ((row: unknown) => readonly unknown[] | undefined) | undefined);
  const isTree = childRows !== undefined;
  registry.setTree(isTree);
  const latest = useRef({ children: childRows, key: rowKey });
  useLayoutEffect(() => {
    latest.current = { children: childRows, key: rowKey };
  });
  const [reader] = useState<NodeReader<unknown>>(() => ({
    key: (row) => latest.current.key(row),
    children: (row) => latest.current.children?.(row),
    label: () => "",
  }));
  const [defaultBranches] = useState<readonly string[]>(() => {
    const given = options.server ? undefined : options.defaultBranches;
    if (!isTree || given === undefined) return [];
    return typeof given === "number" ? branchesTo(rowsUnknown, reader, given) : [...given];
  });
  const [branchesState, setBranchesState] = useState<readonly string[]>(() => start?.branches ?? defaultBranches);
  const liveBranches = useMemo(() => (isTree ? new Set(allBranches(rowsUnknown, reader)) : new Set<string>()), [isTree, rowsUnknown, reader]);
  const branches = isTree ? branchesState.filter((key) => liveBranches.has(key)) : [];
  useMemo(() => {
    if (!isTree) return;
    const twice = duplicateKey(rowsUnknown, reader);
    if (twice !== null) warnOnce(`tree-duplicate:${twice}`, `The row key "${twice}" occurs twice in the tree: its fold and its selection would act on both rows.`);
  }, [isTree, rowsUnknown, reader]);
  if (isTree && (options.defaultGrouping !== undefined || start?.grouping?.length)) {
    warnOnce("tree-grouping", "A grouping is passed over with `childRows`: tree rows and grouping both build levels.");
  }

  const registered = registry.orderedColumns().length + registry.groupKeys.entries.size > 0;
  const groupingNow = server || isTree
    ? []
    : registered
      ? registry.effectiveGrouping(groupingState, rowsUnknown)
      : groupingState.slice(0, MOST_LEVELS);
  const groupingPrefix = groupingNow.join("|");
  const foldedSet = useMemo(() => new Set(foldedState), [foldedState]);
  const model = groupingNow.length ? registry.groupingModel(groupingNow, rowsUnknown, formats.timeZone) : null;
  const grouping = useMemo(
    () => (model && model.levels.length ? { ...model, folded: foldedSet, compareText: formats.compareText } : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the model's identity carries the ids and the columns
    [model, foldedSet, formats.compareText, groupingPrefix],
  );

  const openKey = branches.join("\u0000");
  const tree = useMemo(
    () => (isTree ? { key: rowKey, children: reader.children, open: new Set(branches), admit: preFilter } : undefined),
    /* ponytail: the pre-filter is read through the roots it admits - a new
       pre-filter that only drops children takes hold with the next change of
       rows or branches. Compare its admitted children, as useAdmitted does
       the roots, if a caller needs that live. */
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the open keys by value; the rows the pre-filter admits stand for it
    [isTree, openKey, admitted, reader],
  );
  const b = useTableState(admitted, modelColumns, {
    rowKey,
    pageSize: options.pageSize,
    defaultSort: options.defaultSort,
    filter,
    initialView: start,
    virtual: server ? undefined : options.virtual,
    grouping,
    server: serverInput,
    tree,
  });

  /* Changing a condition resets to page one, like another search. Only what
     fits the registered column is set; as long as none has registered nothing
     is checked - then there is nothing known to check against. */
  const { setPage } = b;
  const setFilter = useCallback(
    (target: string | RowFilter<unknown, unknown>, condition: unknown) => {
      const column = typeof target === "string" ? target : target.id;
      let clear = condition === null || condition === undefined;
      const isRowFilter = rowFilters.has(column);
      if (typeof target !== "string" && !isRowFilter) {
        warnOnce(
          `row-filter-unknown:${column}`,
          `The row filter "${column}" is not among the table's \`rowFilters\`; its condition is passed over.`,
        );
        return;
      }
      if (!clear && !isRowFilter && registry.orderedColumns().length > 0) {
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
    [registry, setPage, rowFilters],
  );

  const known = new Set(registry.orderedColumns().map((e) => e.spec.id));

  /* A condition goes with its column. If a column leaves the JSX, its
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
    /* A row filter's condition stays: it never belonged to the column. */
    const dropped = (id: string) => gone.has(id) && !rowFilters.has(id);
    if (conditions.some(([id]) => dropped(id))) {
      setConditions((old) => old.filter(([id]) => !dropped(id)));
    }
  }

  const effective =
    known.size === 0
      ? conditions
      : conditions.filter(([id, condition]) => rowFilters.has(id) || appliesTo(registry, id, condition));
  const withoutConditions = onlyKnown(b.view, known);
  const view: TableView =
    effective.length > 0 ? { ...withoutConditions, conditions: Object.fromEntries(effective) } : withoutConditions;
  const sort = known.size === 0 ? b.sort : b.sort.filter((s) => known.has(s.column));

  /* The grouping's default is the application's; the view carries a deviation
     only, and of the folds only those whose group still occurs. */
  const defaultGrouping = server || isTree
    ? []
    : registered
    ? registry.effectiveGrouping(listOf(options.defaultGrouping), rowsUnknown)
    : listOf(options.defaultGrouping);
  const folded = b.groups ? livePaths(b.groups, foldedState) : registered ? [] : [...foldedState];
  const declared = registry.declaredPins();
  const pinnedView = pinsForView(pinsChosen, declared, known);
  const groupedView: TableView = {
    ...view,
    ...(!sameList(groupingNow, defaultGrouping) ? { grouping: groupingNow } : {}),
    ...(folded.length ? { folded } : {}),
    ...(pinnedView ? { pinned: pinnedView } : {}),
    ...(isTree && !sameSet(new Set(branches), new Set(defaultBranches.filter((key) => liveBranches.has(key)))) ? { branches } : {}),
  };
  /* Read on the call, not on the render: a column may have registered since. */
  const setPin = (column: string, pin: Pin | null) =>
    setPinsChosen((old) => withPin(old ?? registry.declaredPins(), column, pin));
  /* How many times `setView` was called: the render that carries its state
     reports nothing, whatever the view became (ADR-0047). */
  const [applied, setApplied] = useState(0);
  const setView = (next: TableView) => {
    b.restart(next);
    setConditions(Object.entries(next.conditions ?? {}));
    setGroupingState(next.grouping ? [...next.grouping] : listOf(options.defaultGrouping));
    setFoldedState(next.folded ?? []);
    setPinsChosen(next.pinned ? { ...next.pinned } : null);
    setBranchesState(next.branches ?? defaultBranches);
    setApplied((n) => n + 1);
  };
  const setGrouping = (ids: readonly string[]) => {
    setGroupingState([...ids]);
    setPage(1);
  };
  const toggleFold = (path: string) => {
    if (!foldablePaths(b.groups).includes(path)) return;
    registry.noteFocusBeforeFold();
    setFoldedState((old) => (old.includes(path) ? old.filter((p) => p !== path) : [...old, path]));
  };

  /* Without a pagination bar there are no pages (registry.ts). */
  const virtual = !server && Boolean(options.virtual);
  const paginates = (!isTree && registry.paginates()) || virtual;
  const selection = options.selection ?? b.selection;

  /* A page size without a bar shows every row. The check waits for the first
     frame: a bar placed outside and after the table registers by then. */
  const pageSizeGiven = options.pageSize !== undefined;
  useEffect(() => {
    if (!DEV || !pageSizeGiven || server || virtual || isTree) return;
    const frame = requestAnimationFrame(() => {
      if (!registry.paginates()) {
        warnOnce("page-size-no-bar", "`pageSize` is passed, but no `Pagination` stands for this table, so every row is shown. `pageSize` holds as soon as a `Pagination` stands inside the table or gets it as `of`.");
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [pageSizeGiven, server, virtual, isTree, registry]);

  /* Every change the reader makes, once and whole, after the commit
     (ADR-0047). The first render's view is where it starts, not a change; the
     key is compared, not the object, so a second render with the same view
     reports nothing. The render after a `setView` takes its view as reported
     without calling the handler; a reader's change committed in that same
     render is not reported on its own - the next report carries it, being the
     whole view. */
  const viewNowKey = viewKey(groupedView);
  const viewReported = useRef(viewNowKey);
  const appliedSeen = useRef(0);
  useEffect(() => {
    const silent = appliedSeen.current !== applied;
    appliedSeen.current = applied;
    if (viewReported.current === viewNowKey) return;
    viewReported.current = viewNowKey;
    if (!silent) options.onViewChange?.(groupedView);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per change of the view, with that render's view and handler
  }, [viewNowKey, applied]);

  /* The server's request: reported after the commit, once when
     the table first stands and once per change of what decides the rows - a
     width, an order, a pin, a fold or a hidden column fetches nothing. The key
     is compared, not the object: a second render with the same request (Strict Mode, a column
     registering) must not fetch twice. */
  const request: TableRequest = {
    search: b.search,
    conditions: Object.fromEntries(effective),
    sort,
    page: b.page,
    pageSize: b.pageSize,
  };
  const reportKey = server ? requestKey(request) : "";
  const reported = useRef<string | null>(null);
  /* In development, every key reported, so that `answers` can be told from
     one that can never be equal. ponytail: one string per request, never
     pruned; a cap if a session types for hours. */
  const reportedKeys = useRef(new Set<string>());
  const answersKey = options.server && options.answers ? requestKey(options.answers) : null;
  const late = answersKey !== null && answersKey !== reportKey;
  /* A typed search is reported after a pause of PAUSE_MS without a keystroke;
     anything else that changes the request reports it - with the text typed so
     far - at once and takes the held report with it. */
  const onRequestNow = useRef(options.onRequest);
  useEffect(() => {
    onRequestNow.current = options.onRequest;
  });
  useEffect(() => () => registry.settleSearch(false), [registry]);
  useEffect(() => {
    if (!server) return;
    const typed = registry.takeTyped();
    if (reported.current !== reportKey) {
      reported.current = reportKey;
      if (DEV) reportedKeys.current.add(reportKey);
      if (typed) {
        registry.holdSearch(() => onRequestNow.current?.(request), PAUSE_MS);
      } else {
        registry.settleSearch(false);
        options.onRequest?.(request);
      }
    }
    if (DEV && answersKey !== null && !reportedKeys.current.has(answersKey)) {
      warnOnce("server-answers", "`answers` matches none of the requests `onRequest` received; the table stays busy. Hand back the request object you were given, or one with the same search, conditions, sort, page and page size.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per change of what decides the rows, with that render's view and handler
  }, [reportKey, answersKey]);
  /* A keystroke is typed for the commit it caused only: one that left the key
     as it was must not make a later sort or page change wait. Declared after
     the report effect, so that it runs after it takes the flag. */
  useEffect(() => {
    registry.takeTyped();
  });

  /* A selection in server mode - "all that match" and ticked keys alike - is
     relative to the search and the conditions it was made under: when either
     changes, it ends after the commit (a selection held outside is cleared the
     same way). Sort, page and page size leave it as it is. Automatic mode keeps
     its keys; `allMatching` there is ignored. */
  const matchKey = JSON.stringify([request.search, request.conditions]);
  const matchSeen = useRef(matchKey);
  useEffect(() => {
    if (selection.allMatching && !server) {
      warnOnce("selection-all-matching", "`allMatching` is ignored without `server`: the table holds every row, and \"select all\" selects them by key.");
    }
    if (matchSeen.current === matchKey) return;
    matchSeen.current = matchKey;
    if (server) selection.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per change of the search or the conditions, with that render's selection
  }, [matchKey, selection.allMatching]);

  /* A bulk action receives rows, and in server mode a selected row may stand
     on a page the table no longer holds. It keeps the rows it has seen
     for as long as they are selected, as they were when last seen - never
     more than the selection and the page. */
  const [seenRows] = useState(() => new Map<string, unknown>());
  let selectedRows: readonly unknown[] | undefined;
  if (server) {
    const onPage = new Set<string>();
    for (const row of rowsUnknown) {
      const key = rowKey(row);
      onPage.add(key);
      seenRows.set(key, row);
    }
    for (const key of [...seenRows.keys()]) {
      if (!onPage.has(key) && !selection.isSelected(key)) seenRows.delete(key);
    }
    selectedRows = [...selection.selected].filter((key) => seenRows.has(key)).map((key) => seenRows.get(key));
  }

  const exportAs = <R,>(format: ExportFormat<R>, given?: readonly unknown[]): R =>
    format.write(sheetOf(registry, wording.levelColumn, given), {
      formats,
      wording,
      ...(formats.timeZone && { wallClock: (d: Date) => zoneFields(d, formats.timeZone) }),
    });

  const snapshot: TableSnapshot<Z> = {
    rows,
    filtered: b.filtered as Z[],
    visible: (paginates || isTree ? b.visible : b.filtered) as Z[],
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
    pinned: pinsChosen ?? declared,
    setPin,
    widths: effectiveWidths(modelColumns, b.widths),
    setWidth: b.setWidth,
    expanded: b.expanded,
    toggleRow: b.toggleRow,
    filter: Object.fromEntries(effective),
    setFilter: setFilter as SetFilter<Z>,
    conditionOf: <B,>(own: RowFilter<Z, B>) => (effective.find(([id]) => id === own.id)?.[1] ?? null) as B | null,
    selection,
    view: groupedView,
    grouping: groupingNow,
    setGrouping,
    setView,
    folded,
    toggleFold,
    foldAll: () => {
      registry.noteFocusBeforeFold();
      setFoldedState(foldablePaths(b.groups));
    },
    unfoldAll: () => {
      registry.noteFocusBeforeFold();
      setFoldedState([]);
    },
    branches,
    toggleBranch: (key: string) => {
      if (!liveBranches.has(key)) return;
      setBranchesState((old) => (old.includes(key) ? old.filter((k) => k !== key) : [...old, key]));
    },
    unfoldAllBranches: () => setBranchesState([...liveBranches]),
    foldAllBranches: () => setBranchesState([]),
    asCsv: () => exportAs(csv),
    exportAs,
    selectionAsText: () => selectionText(registry, formats, wording),
    virtual,
    rowCount: server ? rowCount : b.filtered.length,
    server,
    request: server ? request : null,
  };

  // Idempotent for the same snapshot (registry.ts, guarantee 1).
  registry.setHook({
    rows: rowsUnknown,
    admitted,
    modelColumns,
    tableState: b,
    filter,
    grouping,
    tree,
    folded: foldedSet,
    publicSnapshot: snapshot as unknown as TableSnapshot<unknown>,
    rowKey,
    formats,
    pins: pinsChosen,
    filterOptions: server ? options.filterOptions : undefined,
    exportRows: options.server ? (options.exportRows as ((r: TableRequest) => Promise<readonly unknown[]>) | undefined) : undefined,
    selectedRows,
    late,
    error: options.server && !late ? options.error : undefined,
    retry: () => {
      registry.settleSearch(false);
      onRequestNow.current?.(request);
    },
    totals: options.server ? options.totals : undefined,
    rowFilters,
  });

  const reach = {
    scrollToRow: (key: string) => scrollToRow(registry, key),
    focusCell: (key: string, column: string) => focusCell(registry, key, column),
  };
  return { ...snapshot, ...parts, ...reach } as unknown as Table<Z>;
}
