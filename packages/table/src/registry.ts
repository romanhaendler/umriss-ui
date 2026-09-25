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
import type { Column, TableProjection, TableInput } from "./model/tableModel";
import type { Companion } from "./model/companion";
import type { TableSnapshot } from "./types";
import { warnOnce } from "./dev";
import { columnKind, sortValue } from "./values";
import type { Format, ValueKind } from "./values";
import type { AggregateColumn, AggregateKind, DatePeriod, GroupLevel } from "./model/grouping";
import { MOST_LEVELS, periodStart, rowsOf } from "./model/grouping";
import { filterOf } from "./columnFilter";
import { declaredPins, inPinOrder } from "./model/pinning";
import type { Pin, Pins } from "./model/pinning";
import type { FilterSpec } from "./columnFilter";

/* --- Specs ------------------------------------------------------------------- */

/** What registers at a table beside the columns. Each kind counts for itself. */
export type PartKind = "pagination" | "toolbar" | "search";

/** A column as it registers - from its props, already laid out. */
export interface ColumnSpec {
  id: string;
  label: string;
  /** A field name or a function of the row. */
  value: string | ((row: never) => unknown);
  presentation?: (value: never, row: never) => ReactNode;
  format?: Format;
  /** What the values come to - in the footer and in a group's header. */
  aggregate?: AggregateKind | ((values: readonly never[], rows: readonly never[]) => unknown);
  /** The share bar under a sum in a group header; on unless `false`. */
  share?: boolean;
  rowHeader: boolean;
  rightAligned?: boolean;
  width?: number;
  pin?: Pin;
  resizable: boolean;
  sortable?: boolean;
  searchable?: boolean;
  filter?: FilterSpec;
  ownSortValue?: (value: never) => unknown;
  ownExportValue?: (value: never) => unknown;
  /** What is grouped by, when not the value itself. */
  ownGroupValue?: (value: never) => unknown;
  /** Groups a point in time by its day, week, month or year. */
  group?: DatePeriod;
  groupable?: boolean;
  /** Edited in place in grid mode: by a core field of this kind, or by the column's own editor. */
  edit?: "text" | "number" | "select" | "date" | ((editor: never) => ReactNode);
  /** What `edit="select"` offers. */
  editOptions?: readonly unknown[];
  /** Checks a draft before it is reported. */
  validate?: (value: never, row: never) => string | null | undefined;
}

export interface ColumnEntry {
  key: string;
  spec: ColumnSpec;
  /** Reads the value with the latest spec each time. The function itself is
      stable per entry - that is what the model remembers its columns by. */
  read: (row: unknown) => unknown;
}

export interface ActionSpec {
  label: string;
  /** A bulk action always gets a list. */
  bulk: boolean;
  tone: "default" | "danger";
  onSelect: (target: never) => void;
}

export interface ActionEntry {
  key: string;
  spec: ActionSpec;
}

/** What the hook deposits for the table on every pass. */
export interface HookSnapshot {
  /** All the rows passed in - like `t.rows`. The kind of a column is read off
      them: a pre-filter that admits nothing does not turn a number column into
      an empty one, and the model's columns do not recalculate when it
      changes. */
  rows: readonly unknown[];
  /** The rows the pre-filter admits: the ones the table has. Model, filter
      options, figures and the empty state read them. */
  admitted: readonly unknown[];
  /** The columns the hook calculated its model with. */
  modelColumns: readonly Column<unknown>[];
  companion: Companion<unknown, string>;
  filter: ((row: unknown) => boolean) | undefined;
  /** What the table is grouped by, as the model takes it - absent when not. */
  grouping: TableInput<unknown>["grouping"];
  /** The folded paths - for a grouping the body resolves itself. */
  folded: ReadonlySet<string>;
  publicSnapshot: TableSnapshot<unknown>;
  rowKey: (row: unknown) => string;
  /** The provider's formats - the text comparison of the sort comes from there. */
  formats: Formats;
  /** The pins the user chose - absent while the declared ones hold. */
  pins: Pins | null;
  /** Manual mode: the values a list filter offers, from the application. */
  filterOptions?: (column: string) => readonly unknown[];
  /** Manual mode: the selected rows the table has seen, on this page or an
      earlier one - what a bulk action receives. */
  selectedRows?: readonly unknown[];
}

/* --- An ordered list of entries ----------------------------------------------- */

class List<E extends { key: string }> {
  entries = new Map<string, E>();
  /** Keys in the order of the running pass. */
  pass: string[] = [];
  /** Order from the markers in the DOM, after the last commit. */
  dom: string[] = [];

  constructor(readonly markerAttribute: string) {}

  note(key: string) {
    if (!this.pass.includes(key)) this.pass.push(key);
  }

  /** The entries in JSX order, as well as it is known right now: from the pass
      when it knows every one, otherwise from the DOM. */
  ordered(): E[] {
    const all = [...this.entries.keys()];
    const source = all.every((s) => this.pass.includes(s)) ? this.pass : this.dom;
    return [
      ...source.filter((s) => this.entries.has(s)),
      ...all.filter((s) => !source.includes(s)),
    ].map((s) => this.entries.get(s)!);
  }

  /** Reads the markers; reports whether the valid order changes because of it. */
  check(root: HTMLElement): boolean {
    const inDom = Array.from(root.querySelectorAll<HTMLElement>(`[${this.markerAttribute}]`))
      .map((m) => m.getAttribute(this.markerAttribute)!)
      .filter((s) => this.entries.has(s));
    const before = this.ordered().map((e) => e.key).join("|");
    this.dom = inDom;
    this.pass = inDom;
    return before !== this.ordered().map((e) => e.key).join("|");
  }
}

/* --- The registry ------------------------------------------------------------- */

const signatureOf = (a: ColumnSpec): string =>
  JSON.stringify([
    a.id,
    a.label,
    typeof a.value === "string" ? a.value : "ƒ",
    a.format,
    typeof a.aggregate === "function" ? "ƒ" : a.aggregate,
    a.share,
    a.rowHeader,
    a.rightAligned,
    a.width,
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

export class Registry {
  readonly columns = new List<ColumnEntry>("data-umriss-column");
  readonly actions = new List<ActionEntry>("data-umriss-action");
  /** The group keys: values to group by that are no column. */
  readonly groupKeys = new List<ColumnEntry>("data-umriss-groupkey");
  private signatures = new Map<string, string>();

  /** The row detail: the presentation of the `RowDetail` that registered last. */
  detail: { key: string; presentation: (row: never) => ReactNode } | null = null;
  /** How many `RowActions` stand right now. */
  private actionGroups = new Set<string>();

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
      const entry: ColumnEntry = {
        key,
        spec,
        read: (row) => {
          const value = entry.spec.value;
          return typeof value === "string" ? readField(row, value) : (value as (z: unknown) => unknown)(row);
        },
      };
      this.columns.entries.set(key, entry);
      this.structure++;
    } else {
      const old = existing.spec;
      if (this.signatures.get(key) !== signature) this.structure++;
      if (old.value !== spec.value || old.ownSortValue !== spec.ownSortValue || old.ownGroupValue !== spec.ownGroupValue) {
        this.values++;
      }
      if (
        old.presentation !== spec.presentation ||
        old.ownExportValue !== spec.ownExportValue ||
        old.aggregate !== spec.aggregate
      ) {
        this.presentation++;
      }
      existing.spec = spec;
    }
    this.signatures.set(key, signature);
    this.columns.note(key);
    this.checkUniqueness();
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
    return inPinOrder(columns, this.pins());
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
      const entry: ColumnEntry = {
        key,
        spec,
        read: (row) => {
          const value = entry.spec.value;
          return typeof value === "string" ? readField(row, value) : (value as (z: unknown) => unknown)(row);
        },
      };
      this.groupKeys.entries.set(key, entry);
      this.structure++;
    } else {
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

  /** Manual mode: the rows are a server's page, and nothing groups them. */
  manual = false;

  /** The hook says during its render, before the table's, whether it is in
      manual mode. Idempotent, and no version rises: the hook renders before
      everything that reads it. */
  setManual(manual: boolean) {
    this.manual = manual;
  }

  setTableGroupable(groupable: boolean) {
    if (this.tableGroupable === groupable) return;
    this.tableGroupable = groupable;
    this.structure++;
  }

  /** Everything a table can be grouped by: its columns, then its group keys. */
  groupingEntries(rows: readonly unknown[]): ColumnEntry[] {
    if (!this.tableGroupable || this.manual) return [];
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
  groupingModel(ids: readonly string[], rows: readonly unknown[]): { levels: GroupLevel<unknown>[]; aggregates: AggregateColumn<unknown>[] } {
    const key = [ids.join("|"), this.structure, this.values].join(":");
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
          if (group) return periodStart(group)(value);
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
    const model = this.groupingModel(ids, hook.rows);
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
    return kind;
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
    columns: readonly Column<unknown>[];
  } | null = null;

  /** The columns for tableModel. The same identity as long as nothing changed
      that the model reads - that is how the body recognises whether it may take
      over the hook's calculation. */
  modelColumns(rows: readonly unknown[], formats: Formats): readonly Column<unknown>[] {
    const ordered = this.orderedColumns();
    const key = [this.structure, this.values, ordered.map((e) => e.key).join("|")].join(":");
    if (
      this.modelCache?.key === key &&
      this.modelCache.rows === rows &&
      this.modelCache.formats === formats
    ) {
      return this.modelCache.columns;
    }
    const columns = ordered.map((entry): Column<unknown> => {
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

  private projectionCache: { hook: HookSnapshot; columns: readonly Column<unknown>[]; projection: TableProjection<unknown> } | null =
    null;

  private unpaged: { from: TableProjection<unknown>; projection: TableProjection<unknown> } | null = null;

  /** The projection for the body. Without a pagination bar it is a single page
      holding all the filtered rows. */
  projection(): TableProjection<unknown> {
    const projection = this.computedProjection();
    if (this.paginates() || this.hook!.companion.virtual) return projection;
    if (this.unpaged?.from !== projection) {
      this.unpaged = {
        from: projection,
        projection: { ...projection, visible: projection.filtered, visibleLines: projection.lines, page: 1, pageCount: 1 },
      };
    }
    return this.unpaged.projection;
  }

  /** The hook's projection when it calculated with the same columns - otherwise
      a new one, with the columns of this pass. */
  private computedProjection(): TableProjection<unknown> {
    const hook = this.hook!;
    const columns = this.modelColumns(hook.rows, hook.formats);
    const b = hook.companion;
    if (columns === hook.modelColumns) {
      return b;
    }
    if (this.projectionCache?.hook === hook && this.projectionCache.columns === columns) return this.projectionCache.projection;
    const input: TableInput<unknown> = {
      search: b.search,
      filter: hook.filter,
      sort: b.sort,
      page: b.page,
      pageSize: b.virtual ? 0 : b.pageSize,
      hidden: b.hidden,
      order: b.order,
      grouping: this.groupingFor(hook),
      manual: b.manual,
    };
    const fresh = tableModel(hook.admitted, columns, input);
    const projection = b.virtual ? windowed(fresh, b.virtual.from, b.virtual.to) : fresh;
    this.projectionCache = { hook, columns, projection };
    return projection;
  }

  /* --- The hook's snapshot ---------------------------------------------------------- */

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

  /** Whether the table puts up a table toolbar of its own - also while it is
      grouped: the tag that names and removes the grouping needs a place. */
  needsOwnToolbar(): boolean {
    if (this.count("toolbar") > 0) return false;
    return (
      this.count("search") > 0 ||
      this.orderedColumns().some((e) => filterOf(e.spec.filter) !== undefined) ||
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

  registerActionGroup(key: string) {
    if (this.actionGroups.has(key)) return;
    this.actionGroups.add(key);
    this.structure++;
  }

  removeActionGroup(key: string) {
    if (this.actionGroups.delete(key)) this.structure++;
  }

  hasRowActions(): boolean {
    return this.actionGroups.size > 0 && this.actions.entries.size > 0;
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

/** The virtual window of a projection: of its lines when it is grouped, of its
    rows otherwise. */
export function windowed<Z>(projection: TableProjection<Z>, from: number, to: number): TableProjection<Z> {
  if (!projection.lines) return { ...projection, visible: projection.filtered.slice(from, to) };
  const visibleLines = projection.lines.slice(from, to);
  return { ...projection, visibleLines, visible: rowsOf(visibleLines) };
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
