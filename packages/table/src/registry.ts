/* The registry of a table: what its columns, its row detail and its actions
   have registered, and the snapshot the hook deposits for them.

   The mechanics are the result of Ticket 02, and they hang on four
   guarantees:

   1. Writing happens DURING the render, and every write is idempotent: the
      same spec yields no change. That is why a render performed twice (Strict
      Mode) or a discarded one can break nothing - it writes what would stand
      there anyway. No lint can check this (the rules do not look inside a
      method); the guarantee therefore stands here and in every method that
      writes.
   2. The body of the table renders AFTER its children and reads the columns of
      its own pass. A change to a children function therefore costs no second
      pass.
   3. Only changes to the STRUCTURE (membership, order, id, label, formats) are
      reported, and they are reported from a layout effect. Whoever has already
      rendered the new state does not render a second time - that is what
      useSyncExternalStore achieves.
   4. The order comes from the pass; where a column rendered on its own (a
      wrapper with state of its own), hidden markers in the DOM correct it
      after the commit.

   Four versions: `structure` is what the hook reads (it re-renders when a
   column comes or goes); `values` (a new value or sort function),
   `presentation` (a new children, detail or action function) and `hookVersion`
   are read only by the body - otherwise every new children function would
   trigger a re-render of the caller and with it a new function again. Only
   `values` rebuilds the model's columns: a new presentation reorders
   nothing. */

import type { ReactNode } from "react";
import type { Formats } from "@umriss-ui/core";
import { tableModel } from "./model/tableModel";
import type { ModelColumn, TableProjection, TableInput } from "./model/tableModel";
import { windowed } from "./model/tableState";
import { DEV, probeStale, warnOnce } from "./dev";
import { columnKind, isDateFormat, sortValue } from "./values";
import type { ValueKind } from "./values";
import type { AggregateColumn, GroupLevel } from "./model/grouping";
import { MOST_LEVELS, periodStart } from "./model/grouping";
import { filterOf } from "./columnFilter";
import { declaredPins, inPinOrder } from "./model/pinning";
import type { Pins } from "./model/pinning";
import { List } from "./registryEntries";
import type { ActionEntry, ActionSpec, ColumnEntry, ColumnSpec, HookSnapshot, PartKind } from "./registryEntries";

export type { ActionEntry, ActionSpec, ColumnEntry, ColumnSpec, HookSnapshot, PartKind } from "./registryEntries";

/* --- The registry ------------------------------------------------------------- */

const signatureOf = (a: ColumnSpec): string =>
  JSON.stringify([
    a.id,
    a.label,
    a.heading?.id,
    a.heading?.label,
    typeof a.value === "string" ? a.value : "ƒ",
    a.format,
    typeof a.aggregate === "function" ? "ƒ" : a.aggregate,
    a.aggregateLabel,
    a.share,
    a.rowHeader,
    a.rightAligned,
    a.width,
    a.flex,
    a.minWidth,
    a.pin,
    a.resizable,
    a.sortable,
    a.searchable,
    /* A filter of one's own counts as a kind, not as an object: written in the
       call it is a new one on every render. */
    typeof a.filter === "object" ? "own" : a.filter,
    !!a.presentation,
    !!a.ownSortValue,
    !!a.ownExportValue,
    !!a.ownGroupValue,
    a.group,
    a.groupable,
    /* Whether a column edits, and how - not its editor or its check, which
       are new functions on every render and are read when an edit starts. */
    typeof a.edit === "function" ? "ƒ" : a.edit,
  ]);

const readField = (row: unknown, field: string): unknown =>
  row === null || row === undefined ? undefined : (row as Record<string, unknown>)[field];

/** A column entry whose `read` takes the value from the entry's latest spec. */
const columnEntry = (key: string, spec: ColumnSpec): ColumnEntry => {
  const entry: ColumnEntry = {
    key,
    spec,
    read: (row) => {
      const value = entry.spec.value;
      return typeof value === "string" ? readField(row, value) : (value as (z: unknown) => unknown)(row);
    },
  };
  return entry;
};

/** Two accessors are the same when they are one function or have the same
    source text; a native or bound function reads "[native code]" whatever it
    does, so only identity counts for it. A closure over a changed outer
    variable reads as unchanged: the variable carried in the row data, or a
    `key` on the column that changes with it, is the way out; development
    warns (probeStale in dev.ts). */
export function fnEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "function" || typeof b !== "function") return false;
  const source = String(a);
  if (source.includes("[native code]")) return false;
  return source === String(b);
}

/** The spec with the accessors it already held, where the new ones are equal to
    them: the identity the aggregate caches and the model's columns key on stays
    as it was through a re-render with inline accessors. */
function holdEqual(old: ColumnSpec, next: ColumnSpec, rows: readonly unknown[]): ColumnSpec {
  // Another id is another column under the same React key: its accessors are its own.
  if (old.id !== next.id) return next;
  const who = `Column "${next.id}"`;
  const read = (row: unknown) => (typeof old.value === "string" ? readField(row, old.value) : (old.value as (z: unknown) => unknown)(row));
  if (fnEqual(old.value, next.value)) probeStale(who, old.value, next.value, rows);
  if (fnEqual(old.ownSortValue, next.ownSortValue)) probeStale(who, old.ownSortValue, next.ownSortValue, rows, read);
  if (fnEqual(old.ownGroupValue, next.ownGroupValue)) probeStale(who, old.ownGroupValue, next.ownGroupValue, rows, read);
  const value = fnEqual(old.value, next.value) ? old.value : next.value;
  const ownSortValue = fnEqual(old.ownSortValue, next.ownSortValue) ? old.ownSortValue : next.ownSortValue;
  const ownGroupValue = fnEqual(old.ownGroupValue, next.ownGroupValue) ? old.ownGroupValue : next.ownGroupValue;
  if (value === next.value && ownSortValue === next.ownSortValue && ownGroupValue === next.ownGroupValue) return next;
  return { ...next, value, ownSortValue, ownGroupValue };
}

export class Registry {
  readonly columns = new List<ColumnEntry>("data-umriss-column");
  readonly actions = new List<ActionEntry>("data-umriss-action");
  /** The group keys: values to group by that are no column. */
  readonly groupKeys = new List<ColumnEntry>("data-umriss-groupkey");
  private signatures = new Map<string, string>();
  /** The hook's rows, which the development probe of a held accessor calls it on. */
  private rows: readonly unknown[] = [];
  setRows(rows: readonly unknown[]) {
    this.rows = rows;
  }

  /** The row detail: the presentation of the `RowDetail` that registered last. */
  detail: { key: string; presentation: (row: never) => ReactNode } | null = null;
  /** The `RowActions` that stand right now, with their `pin`. */
  private actionGroups = new Map<string, boolean>();

  /** Whether the row header column sticks - `pin: "start"` on it. */
  stickyRowHeader = false;

  /* Without a pagination bar the table does not page: one that stops quietly at
     the tenth row because nobody put one there is a trap (found at the alarm
     list, umriss-table 13). Without a table toolbar, but with a search or a
     column filter, the table puts one there itself (table-filters 04):
     conditions and the ratio need a place, and a place that came into being
     only with the first condition would shift the table. */
  private parts = new Map<PartKind, Set<string>>();

  /** The element the table's children stand in - for the markers. */
  children: HTMLElement | null = null;

  hook: HookSnapshot | null = null;

  private structure = 0;
  private values = 0;
  private presentation = 0;
  private hookVersion = 0;
  private reported = "";
  private listeners = new Set<() => void>();

  /* --- Subscription ------------------------------------------------------------- */

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /** What the hook reads. */
  structureVersion = () => this.structure;
  /** What body and unbound parts read. Every counter only rises, so the sum
      rises exactly when one of them rises. */
  bodyVersion = () => this.structure + this.values + this.presentation + this.hookVersion;

  /** Reports from a layout effect what has changed since the last report.
      Without a change nothing happens. */
  commit() {
    const now = `${this.structure}:${this.values}:${this.presentation}:${this.hookVersion}`;
    if (now === this.reported) return;
    this.reported = now;
    for (const listener of [...this.listeners]) listener();
  }

  /* --- The pass ----------------------------------------------------------------- */

  /** The table renders: a new pass begins. Idempotent - a second call within
      the same pass clears what is empty anyway. */
  beginPass() {
    this.columns.pass = [];
    this.actions.pass = [];
    this.groupKeys.pass = [];
  }

  /** After the commit: check the order against the DOM. */
  checkOrder() {
    this.checkUniqueness();
    if (!this.children) return;
    if (this.columns.check(this.children)) this.structure++;
    if (this.actions.check(this.children)) this.structure++;
    if (this.groupKeys.check(this.children)) this.structure++;
  }

  /* --- Columns ------------------------------------------------------------------ */

  /** A column registers during the render. Idempotent: the same spec changes no
      version. */
  registerColumn(key: string, spec: ColumnSpec) {
    const existing = this.columns.entries.get(key);
    const signature = signatureOf(spec);
    if (!existing) {
      const entry = columnEntry(key, spec);
      this.columns.entries.set(key, entry);
      this.structure++;
    } else {
      const old = existing.spec;
      spec = holdEqual(old, spec, this.rows);
      if (this.signatures.get(key) !== signature) this.structure++;
      if (old.value !== spec.value || old.ownSortValue !== spec.ownSortValue || old.ownGroupValue !== spec.ownGroupValue) {
        this.values++;
      }
      if (
        old.presentation !== spec.presentation ||
        old.ownExportValue !== spec.ownExportValue ||
        old.aggregate !== spec.aggregate ||
        old.aggregateLabel !== spec.aggregateLabel
      ) {
        this.presentation++;
      }
      existing.spec = spec;
    }
    this.signatures.set(key, signature);
    this.columns.note(key);
  }

  /** After mounting - including after the Strict Mode's second mount, whose
      cleanup removed the entry in between. */
  ensureColumn(key: string, spec: ColumnSpec) {
    if (!this.columns.entries.has(key)) this.registerColumn(key, spec);
  }

  removeColumn(key: string) {
    if (!this.columns.entries.delete(key)) return;
    this.signatures.delete(key);
    this.kinds.delete(key);
    this.structure++;
  }

  /** Once the render's columns have all registered: an id seen mid-render may
      still belong to a column whose own id is about to change. */
  private checkUniqueness() {
    const ids = new Set<string>();
    let rowHeaders = 0;
    for (const { spec } of this.columns.entries.values()) {
      if (ids.has(spec.id)) {
        warnOnce(`id:${spec.id}`, `Two columns carry the id "${spec.id}". The second one is passed over.`);
      }
      ids.add(spec.id);
      if (spec.rowHeader) rowHeaders++;
    }
    if (rowHeaders > 1) {
      warnOnce("rowHeader", "More than one column is `rowHeader`. A table has at most one row header; the first one holds.");
    }
  }

  /** The table says during the render whether its row header sticks. Idempotent. */
  setStickyRowHeader(sticks: boolean) {
    if (this.stickyRowHeader === sticks) return;
    this.stickyRowHeader = sticks;
    this.structure++;
  }

  /** What the columns of this pass declare. */
  declaredPins(): Pins {
    return declaredPins(
      this.orderedColumns().map((e) => ({ id: e.spec.id, pin: e.spec.pin })),
      this.stickyRowHeader ? this.rowHeader()?.spec.id : undefined,
    );
  }

  /** The pins that hold: the user's choice, otherwise the declaration. */
  pins(): Pins {
    return this.hook?.pins ?? this.declaredPins();
  }

  /** The columns with the pinned blocks at either end - the one place where
      that is decided, for screen, column menu and export. */
  inPinOrder<T extends { id: string }>(columns: readonly T[]): T[] {
    /* A `ColumnGroup`'s columns stand together wherever an order put them
       (`setOrder` takes any list): the group sits where its first column
       does. Pinning then splits them by block, as it does. */
    const heading = (c: T) => this.columnById(c.id)?.spec.heading?.id;
    const together = columns.flatMap((c, i) => {
      const h = heading(c);
      if (h === undefined) return [c];
      return columns.findIndex((o) => heading(o) === h) === i ? columns.filter((o) => heading(o) === h) : [];
    });
    return inPinOrder(together, this.pins());
  }

  /** The columns in JSX order, the first one per id. */
  orderedColumns(): ColumnEntry[] {
    const seen = new Set<string>();
    return this.columns.ordered().filter((e) => {
      if (seen.has(e.spec.id)) return false;
      seen.add(e.spec.id);
      return true;
    });
  }

  columnById(id: string): ColumnEntry | undefined {
    return this.orderedColumns().find((e) => e.spec.id === id);
  }

  rowHeader(): ColumnEntry | undefined {
    return this.orderedColumns().find((e) => e.spec.rowHeader);
  }

  /* --- Group keys and the grouping ---------------------------------------------- */

  /** A group key registers during the render, as a column does. Idempotent. */
  registerGroupKey(key: string, spec: ColumnSpec) {
    const existing = this.groupKeys.entries.get(key);
    const signature = signatureOf(spec);
    if (!existing) {
      const entry = columnEntry(key, spec);
      this.groupKeys.entries.set(key, entry);
      this.structure++;
    } else {
      spec = holdEqual(existing.spec, spec, this.rows);
      if (this.signatures.get(key) !== signature) this.structure++;
      if (existing.spec.value !== spec.value || existing.spec.ownGroupValue !== spec.ownGroupValue) this.values++;
      existing.spec = spec;
    }
    this.signatures.set(key, signature);
    this.groupKeys.note(key);
  }

  ensureGroupKey(key: string, spec: ColumnSpec) {
    if (!this.groupKeys.entries.has(key)) this.registerGroupKey(key, spec);
  }

  removeGroupKey(key: string) {
    if (!this.groupKeys.entries.delete(key)) return;
    this.signatures.delete(key);
    this.kinds.delete(key);
    this.structure++;
  }

  /** The focus a fold may hide: the focused element of a grouped line, the
      group that line stands in, and its table - noted before the fold, since
      afterwards the element may be gone and the focus lost. */
  private focusBeforeFold: { element: Element; group: string; table: Element | null } | null = null;

  /** Notes where the focus stands - from the event that folds, never in a
      render. */
  noteFocusBeforeFold() {
    const element = document.activeElement;
    const group = element?.closest<HTMLElement>("tr[data-group]")?.dataset.group;
    this.focusBeforeFold = element && group !== undefined ? { element, group, table: element.closest("table") } : null;
  }

  /** The focus noted before the last fold - once. */
  takeFocusBeforeFold() {
    const noted = this.focusBeforeFold;
    this.focusBeforeFold = null;
    return noted;
  }

  /** Whether the table lets itself be grouped at all (`<Table groupable>`). */
  tableGroupable = true;

  /** Server mode: the rows are a server's page, and nothing groups them. */
  server = false;

  /** The hook says during its render, before the table's, whether it is in
      server mode. Idempotent, and no version rises: the hook renders before
      everything that reads it. */
  setServer(server: boolean) {
    this.server = server;
  }

  /** Tree rows: the table builds its levels from the rows' children, and
      nothing groups it. Set by the hook during its render, as `server` is. */
  tree = false;

  setTree(tree: boolean) {
    this.tree = tree;
  }

  setTableGroupable(groupable: boolean) {
    if (this.tableGroupable === groupable) return;
    this.tableGroupable = groupable;
    this.structure++;
  }

  /** Everything a table can be grouped by: its columns, then its group keys. */
  groupingEntries(rows: readonly unknown[]): ColumnEntry[] {
    if (!this.tableGroupable || this.tree) return [];
    if (this.server) {
      if (this.orderedColumns().some((e) => e.spec.groupable === true)) {
        warnOnce("server-groupable-column", "`groupable` on a column is passed over in server mode: the groups would be the page's, not the server's.");
      }
      return [];
    }
    const seen = new Set<string>();
    return [...this.orderedColumns(), ...this.groupKeys.ordered()].filter((e) => {
      if (seen.has(e.spec.id)) return false;
      seen.add(e.spec.id);
      const { groupable, ownGroupValue } = e.spec;
      return groupable ?? (this.kindOf(e, rows) !== "other" || !!ownGroupValue);
    });
  }

  /** The ids of a grouping that something groupable carries - at most three,
      each once. */
  effectiveGrouping(ids: readonly string[], rows: readonly unknown[]): string[] {
    const known = new Set(this.groupingEntries(rows).map((e) => e.spec.id));
    return [...new Set(ids)].filter((id) => known.has(id)).slice(0, MOST_LEVELS);
  }

  private groupingCache: { key: string; levels: GroupLevel<unknown>[]; aggregates: AggregateColumn<unknown>[] } | null = null;

  /** The levels and aggregates for the model - the same identity as long as
      nothing changed that they read. */
  groupingModel(ids: readonly string[], rows: readonly unknown[], timeZone?: string): { levels: GroupLevel<unknown>[]; aggregates: AggregateColumn<unknown>[] } {
    const key = [ids.join("|"), this.structure, this.values, timeZone ?? ""].join(":");
    if (this.groupingCache?.key === key) return this.groupingCache;
    const entries = this.groupingEntries(rows);
    const levels = ids
      .map((id) => entries.find((e) => e.spec.id === id))
      .filter((e): e is ColumnEntry => e !== undefined)
      .map((entry): GroupLevel<unknown> => ({
        id: entry.spec.id,
        value: (row) => {
          const value = entry.read(row);
          if (value === null || value === undefined) return undefined;
          const { ownGroupValue, group } = entry.spec;
          if (ownGroupValue) return ownGroupValue(value as never);
          if (group) return periodStart(group, timeZone)(value);
          return value;
        },
        /* A value of one's own is a name; its groups stand by what they hold. */
        order: entry.spec.ownGroupValue ? (row) => sortValue(entry.read(row), entry.spec.ownSortValue) : undefined,
      }));
    const aggregates = this.orderedColumns()
      .filter((e) => e.spec.aggregate !== undefined)
      .map(
        (entry): AggregateColumn<unknown> => ({
          id: entry.spec.id,
          read: entry.read,
          /* Read with the latest spec on every call: an aggregate of one's own
             written in the call is a new function on every render. */
          aggregate:
            typeof entry.spec.aggregate === "function"
              ? (values, rows) => (entry.spec.aggregate as (v: unknown, r: unknown) => unknown)(values, rows)
              : entry.spec.aggregate!,
        }),
      );
    this.groupingCache = { key, levels, aggregates };
    return this.groupingCache;
  }

  /** The grouping for the body's own pass: resolved against the columns of
      this pass, so that even the first frame stands grouped. */
  private groupingFor(hook: HookSnapshot): TableInput<unknown>["grouping"] {
    const ids = this.effectiveGrouping(hook.publicSnapshot.grouping, hook.rows);
    if (ids.length === 0) return undefined;
    const model = this.groupingModel(ids, hook.rows, hook.formats.timeZone);
    if (hook.grouping?.levels === model.levels) return hook.grouping;
    return { ...model, folded: hook.folded, compareText: hook.formats.compareText };
  }

  /* --- The kind of a column ------------------------------------------------------- */

  private kinds = new Map<string, { rows: readonly unknown[]; value: unknown; kind: ValueKind }>();

  /** The kind of a column, read off the rows passed in and remembered. */
  kindOf(entry: ColumnEntry, rows: readonly unknown[]): ValueKind {
    const remembered = this.kinds.get(entry.key);
    if (remembered && remembered.rows === rows && remembered.value === entry.spec.value) return remembered.kind;
    const kind = columnKind(rows, entry.read);
    this.kinds.set(entry.key, { rows, value: entry.spec.value, kind });
    if (DEV) this.warnFormat(entry, kind);
    return kind;
  }

  /** A format whose kind the column's first value does not have: the cells print
      raw. An empty column says nothing yet. */
  private warnFormat(entry: ColumnEntry, kind: ValueKind) {
    const { format, id } = entry.spec;
    if (format === undefined || kind === "empty") return;
    const dated = isDateFormat(format);
    if (dated && kind !== "date") {
      warnOnce(`format-date:${id}`, `The column "${id}" has the date format "${format}", but its first value is ${kind === "other" ? "not a point in time" : `a ${kind}`}: the cells show it raw. A point in time is a \`Date\` in the row; convert an epoch number or an ISO string there.`);
    } else if (!dated && kind !== "number") {
      warnOnce(`format-number:${id}`, `The column "${id}" has a number format, but its first value is ${kind === "other" ? "not a number" : `a ${kind}`}: the cells show it raw. Convert the value to a number in the row.`);
    }
  }

  /** Can it be sorted by this column? Without a statement: when its value is
      text, a number, a point in time or a boolean, or it has a sort value of its
      own. */
  isSortable(entry: ColumnEntry, rows: readonly unknown[]): boolean {
    const { sortable, ownSortValue } = entry.spec;
    return sortable ?? (this.kindOf(entry, rows) !== "other" || !!ownSortValue);
  }

  /* --- The model ------------------------------------------------------------------ */

  private modelCache: {
    key: string;
    rows: readonly unknown[];
    formats: Formats;
    columns: readonly ModelColumn<unknown>[];
  } | null = null;

  /** The columns for tableModel. The same identity as long as nothing changed
      that the model reads - that is how the body recognises whether it may take
      over the hook's calculation. */
  modelColumns(rows: readonly unknown[], formats: Formats): readonly ModelColumn<unknown>[] {
    const ordered = this.orderedColumns();
    const key = [this.structure, this.values, ordered.map((e) => e.key).join("|")].join(":");
    if (
      this.modelCache?.key === key &&
      this.modelCache.rows === rows &&
      this.modelCache.formats === formats
    ) {
      return this.modelCache.columns;
    }
    const columns = ordered.map((entry): ModelColumn<unknown> => {
      const { spec } = entry;
      const kind = this.kindOf(entry, rows);
      const sortable = this.isSortable(entry, rows);
      const searchable = spec.searchable ?? kind === "text";
      const read = (row: unknown) => sortValue(entry.read(row), spec.ownSortValue);
      return {
        id: spec.id,
        label: spec.label,
        value: sortable || searchable ? read : undefined,
        /* Text sorts with the provider's comparison, not with the built-in
           German one (spec, the table of defaults). */
        compare:
          kind === "text" && !spec.ownSortValue
            ? (a, b) => formats.compareText(String(read(a)), String(read(b)))
            : undefined,
        searchable,
        hideable: !spec.rowHeader,
        resizable: spec.resizable,
        width: spec.width,
      };
    });
    this.modelCache = { key, rows, formats, columns };
    return columns;
  }

  private projectionCache: { hook: HookSnapshot; columns: readonly ModelColumn<unknown>[]; projection: TableProjection<unknown> } | null =
    null;

  private unpaged: { from: TableProjection<unknown>; projection: TableProjection<unknown> } | null = null;

  /** The projection for the body. Without a pagination bar it is a single page
      holding all the filtered rows. */
  projection(): TableProjection<unknown> {
    const projection = this.computedProjection();
    if (this.paginates() || this.hook!.tableState.virtual) return projection;
    if (this.unpaged?.from !== projection) {
      this.unpaged = {
        from: projection,
        projection: { ...projection, visible: projection.shown ?? projection.filtered, visibleLines: projection.lines, page: 1, pageCount: 1 },
      };
    }
    return this.unpaged.projection;
  }

  /** The hook's projection when it calculated with the same columns - otherwise
      a new one, with the columns of this pass. */
  private computedProjection(): TableProjection<unknown> {
    const hook = this.hook!;
    const columns = this.modelColumns(hook.rows, hook.formats);
    const b = hook.tableState;
    if (columns === hook.modelColumns) {
      return b;
    }
    if (this.projectionCache?.hook === hook && this.projectionCache.columns === columns) return this.projectionCache.projection;
    const input: TableInput<unknown> = {
      search: b.search,
      filter: hook.filter,
      sort: b.sort,
      page: b.page,
      pageSize: b.virtual || hook.tree ? 0 : b.pageSize,
      hidden: b.hidden,
      order: b.order,
      grouping: this.groupingFor(hook),
      server: b.server,
      tree: hook.tree,
    };
    const fresh = tableModel(hook.admitted, columns, input);
    const projection = b.virtual ? windowed(fresh, b.virtual.from, b.virtual.to) : fresh;
    this.projectionCache = { hook, columns, projection };
    return projection;
  }

  /* --- The hook's snapshot ---------------------------------------------------------- */

  /** Set when the user changes the selection; the frame announces it once. */
  private picked = false;
  markPicked() {
    this.picked = true;
  }
  takePicked() {
    const was = this.picked;
    this.picked = false;
    return was;
  }

  /** The hook deposits its snapshot during the render. Idempotent for the same
      snapshot; a new one counts for the body. */
  setHook(hook: HookSnapshot) {
    if (this.hook === hook) return;
    this.hook = hook;
    this.hookVersion++;
  }

  /* --- Pagination bar, table toolbar, search ---------------------------------------- */

  private set(kind: PartKind): Set<string> {
    const existing = this.parts.get(kind);
    if (existing) return existing;
    const set = new Set<string>();
    this.parts.set(kind, set);
    return set;
  }

  /** A part registers during the render. Idempotent (guarantee 1). */
  register(kind: PartKind, key: string) {
    const set = this.set(kind);
    if (set.has(key)) return;
    set.add(key);
    this.structure++;
  }

  remove(kind: PartKind, key: string) {
    if (this.set(kind).delete(key)) this.structure++;
  }

  count(kind: PartKind): number {
    return this.set(kind).size;
  }

  paginates(): boolean {
    return this.count("pagination") > 0;
  }

  /** A grid with `onRowAdd` (ADR-0036): the toolbar puts up "New row", or the
      table beneath itself where no toolbar stands. The frame hands in what the
      button does - its grid's handler of this render. */
  rowAdding = false;
  /* The search in server mode: the field marks a keystroke as typed, and the
     hook holds that request's report for a pause. Anything else that reports,
     Enter and unmounting settle the held one. */
  private typed = false;
  private held: { timer: ReturnType<typeof setTimeout>; report: () => void } | null = null;

  markTyped(on: boolean) {
    this.typed = on;
  }

  takeTyped(): boolean {
    const was = this.typed;
    this.typed = false;
    return was;
  }

  /** Drops what is held, or reports it when `send`. */
  settleSearch(send: boolean) {
    if (!this.held) return;
    clearTimeout(this.held.timer);
    const { report } = this.held;
    this.held = null;
    if (send) report();
  }

  holdSearch(report: () => void, ms: number) {
    this.settleSearch(false);
    this.held = { timer: setTimeout(() => this.settleSearch(true), ms), report };
  }

  addRow: (() => void) | null = null;

  setRowAdding(on: boolean) {
    this.rowAdding = on;
  }

  setAddRow(add: (() => void) | null) {
    this.addRow = add;
  }

  /** The table element while the frame is mounted - absent otherwise. */
  frameTable: HTMLTableElement | null = null;

  /** The row `scrollToRow` wants shown once it is rendered, and the column of
      the cell to make the Active cell in grid mode. */
  reveal: { key: string; column?: string } | null = null;

  setReveal(next: Registry["reveal"]) {
    this.reveal = next;
  }

  setFrameTable(table: HTMLTableElement | null) {
    this.frameTable = table;
  }

  /** Grid mode: the ids of the columns a cell can be focused in, and what
      makes a cell the Active cell and focuses it - this render's, as `addRow`
      is. */
  cellFocus: { columns: readonly string[]; put: (key: string, column: string) => void } | null = null;

  setCellFocus(focus: Registry["cellFocus"]) {
    this.cellFocus = focus;
  }

  /** Whether a table toolbar stands - one put there, or the table's own. */
  showsToolbar(): boolean {
    return this.count("toolbar") > 0 || this.needsOwnToolbar();
  }

  /** Whether the table puts up a table toolbar of its own - also while it is
      grouped: the tag that names and removes the grouping needs a place. */
  needsOwnToolbar(): boolean {
    if (this.count("toolbar") > 0) return false;
    return (
      this.count("search") > 0 ||
      this.orderedColumns().some((e) => filterOf(e.spec.filter) !== undefined) ||
      (this.hook?.rowFilters.size ?? 0) > 0 ||
      (this.hook?.publicSnapshot.grouping.length ?? 0) > 0
    );
  }

  /* --- Row detail ------------------------------------------------------------------- */

  registerDetail(key: string, presentation: (row: never) => ReactNode) {
    if (!this.detail || this.detail.key !== key) {
      this.detail = { key, presentation };
      this.structure++;
    } else if (this.detail.presentation !== presentation) {
      this.detail = { key, presentation };
      this.presentation++;
    }
  }

  removeDetail(key: string) {
    if (this.detail?.key !== key) return;
    this.detail = null;
    this.structure++;
  }

  /* --- Actions ---------------------------------------------------------------------- */

  registerActionGroup(key: string, pin: boolean) {
    if (this.actionGroups.get(key) === pin) return;
    this.actionGroups.set(key, pin);
    this.structure++;
  }

  removeActionGroup(key: string) {
    if (this.actionGroups.delete(key)) this.structure++;
  }

  hasRowActions(): boolean {
    return this.actionGroups.size > 0 && this.actions.entries.size > 0;
  }

  /** Whether the actions column sticks: unless a `RowActions` says `pin={false}`. */
  actionsPinned(): boolean {
    return ![...this.actionGroups.values()].includes(false);
  }

  registerAction(key: string, spec: ActionSpec) {
    const existing = this.actions.entries.get(key);
    if (!existing) {
      this.actions.entries.set(key, { key, spec });
      this.structure++;
    } else {
      const old = existing.spec;
      if (old.label !== spec.label || old.bulk !== spec.bulk || old.tone !== spec.tone) this.structure++;
      else if (old.onSelect !== spec.onSelect) this.presentation++;
      existing.spec = spec;
    }
    this.actions.note(key);
  }

  ensureAction(key: string, spec: ActionSpec) {
    if (!this.actions.entries.has(key)) this.registerAction(key, spec);
  }

  removeAction(key: string) {
    if (this.actions.entries.delete(key)) this.structure++;
  }
}

/* Which registry belongs to a table: fastened to the hook's stable `Table`, so
   that `of={t}` gets by without a hidden entry in the type. */
const REGISTRY_OF = new WeakMap<object, Registry>();

export const link = (table: object, registry: Registry) => {
  REGISTRY_OF.set(table, registry);
};

export const registryOf = (table: unknown): Registry | undefined =>
  typeof table === "function" || (typeof table === "object" && table !== null)
    ? REGISTRY_OF.get(table as object)
    : undefined;
