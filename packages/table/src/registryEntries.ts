/* What registers at a table and what the hook deposits for it: the specs of
   columns and actions, their entries, the snapshot, and the ordered list the
   entries are kept in. */

import type { ReactNode } from "react";
import type { Formats } from "@umriss-ui/core";
import type { RowFilter } from "./rowFilter";
import type { ModelColumn, TableInput } from "./model/tableModel";
import type { TableState } from "./model/tableState";
import type { TableSnapshot } from "./types";
import type { Format } from "./values";
import type { AggregateKind, DatePeriod } from "./model/grouping";
import type { Pin, Pins } from "./model/pinning";
import type { TableRequest } from "./model/view";
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
  /** The word of an aggregate of one's own in the footer. */
  aggregateLabel?: string;
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
  modelColumns: readonly ModelColumn<unknown>[];
  tableState: TableState<unknown, string>;
  filter: ((row: unknown) => boolean) | undefined;
  /** What the table is grouped by, as the model takes it - absent when not. */
  grouping: TableInput<unknown>["grouping"];
  /** Tree rows, as the model takes them - absent when the rows are flat. */
  tree: TableInput<unknown>["tree"];
  /** The folded paths - for a grouping the body resolves itself. */
  folded: ReadonlySet<string>;
  publicSnapshot: TableSnapshot<unknown>;
  rowKey: (row: unknown) => string;
  /** The provider's formats - the text comparison of the sort comes from there. */
  formats: Formats;
  /** The pins the user chose - absent while the declared ones hold. */
  pins: Pins | null;
  /** Server mode: the values a list filter offers, from the application. */
  filterOptions?: (column: string) => readonly unknown[];
  /** Server mode: every row of a request, for the export. */
  exportRows?: (request: TableRequest) => Promise<readonly unknown[]>;
  /** Server mode: the selected rows the table has seen, on this page or an
      earlier one - what a bulk action receives. */
  selectedRows?: readonly unknown[];
  /** Server mode: the rows answer an older request than the current one. */
  late: boolean;
  /** Server mode: the message that stands in place of the rows, when it is the
      current request's; `retry` reports that request once more. */
  error?: string;
  retry?: () => void;
  /** Server mode: the footer's values by column id. */
  totals?: Readonly<Record<string, unknown>>;
  /** The row filters the table was given, by id - their chips read them. */
  rowFilters: ReadonlyMap<string, RowFilter<unknown, unknown>>;
}

/* --- An ordered list of entries ----------------------------------------------- */

export class List<E extends { key: string }> {
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
