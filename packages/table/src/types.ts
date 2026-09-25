/* The types of the interface.

   The typing is the product here (ADR-0017): a column is typed against the rows
   of the hook it came from, and `tests-unit/types.test-d.tsx` records what must
   compile and what must not. The shape of the overloads is the result of
   Ticket 01 - whoever changes them reads the findings there first. */

import type { ReactNode } from "react";
import type { LimitSet } from "@umriss-ui/core";
import type { ManualView, TableView } from "./model/view";
import type { SortLevel } from "./model/tableModel";
import type { TableSelection } from "./model/useTableSelection";
import type { ColumnFilter } from "./columnFilter";
import type { DateFormat, NumberFormat } from "./values";
import type { DatePeriod } from "./model/grouping";
import type { Pin } from "./model/pinning";

/* --- Values --------------------------------------------------------------- */

export type Absent = null | undefined;
/** The value without the absence - that is what `children` gets. */
export type Present<W> = Exclude<W, Absent>;
/** What can appear as text without `children`. */
export type Displayable = string | number | boolean | Date;

export type FormatFor<W> = [Present<W>] extends [number]
  ? NumberFormat
  : [Present<W>] extends [Date]
    ? DateFormat
    : never;

export type FooterFor<W> = [Present<W>] extends [number] ? "sum" | "avg" : never;

/** An aggregate of one's own: the values present and the rows of the group -
    or of the filtered set, in the footer. Its result runs through the column's
    presentation; `undefined` means there is none. */
export type AggregateFunction<W, Z> = (values: readonly Present<NoInfer<W>>[], rows: readonly Z[]) => Present<NoInfer<W>> | undefined;

/** What a column accepts as `aggregate`: sums and averages for numbers, the
    extremes for numbers and points in time, the range for points in time,
    counts for every value with a text form - or a function of one's own. */
export type AggregateFor<W, Z> =
  | ([Present<W>] extends [number] ? "sum" | "avg" | "min" | "max" : never)
  | ([Present<W>] extends [Date] ? "min" | "max" | "range" : never)
  | (IsDisplayable<W> extends true ? "count" | "distinct" : never)
  | AggregateFunction<W, Z>;

/** What a column's values come to - the props a column carries for it. */
export interface AggregateOptions<W, Z> {
  /** What the column's values come to: in the footer over the filtered set,
      in a group's header over its rows. `"sum"`, `"avg"` for numbers; `"min"`,
      `"max"` for numbers and points in time; `"range"` for points in time;
      `"count"`, `"distinct"` for every value with a text form - or a function
      of one's own. Always from the values, never from other aggregates; absent
      values count towards nothing. */
  aggregate?: AggregateFor<W, Z>;
  /** The share bar in a group's header – the group's share of the filtered
      set's sum. It stands under the first column with a sum, one per header;
      `false` passes it on to the next. */
  share?: boolean;
}

/** `aggregate`, or its old name `footer` - never both. */
type AggregateProps<W, Z> =
  | (AggregateOptions<W, Z> & {
      /** The old name of `aggregate` – not together with it. */
      footer?: never;
    })
  | {
      /** Not together with `footer`, its old name. */
      aggregate?: never;
      /** @deprecated Is called `aggregate` now – the same values, and in a
          grouped table the group's as well. The old name goes with the next
          minor version. */
      footer?: FooterFor<W>;
      /** The share bar under a sum in a group's header. */
      share?: boolean;
    };

/** What a column accepts as `filter`: `"list"` for every value with a text
    form, `"range"` for numbers and points in time, a filter from `columnFilter`
    only where its value type fits. */
export type FilterFor<W> =
  | (IsDisplayable<W> extends true ? "list" : never)
  | ([Present<W>] extends [number] ? "range" : [Present<W>] extends [Date] ? "range" : never)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the condition belongs to the filter; at the column only the value counts
  | ColumnFilter<Present<W>, any>;

export type Presentation<W, Z> = (value: Present<W>, row: Z) => ReactNode;

type IsDisplayable<W> = [Present<W>] extends [never]
  ? false
  : [Present<W>] extends [Displayable]
    ? true
    : false;

/** Without a text form `children` is required. */
type ChildrenFor<W, Z> = IsDisplayable<W> extends true
  ? {
      /** How the value appears: `(value, row)`. Never called for an absent
          value. Required where the value has no text form. */
      children?: Presentation<W, Z>;
    }
  : {
      /** How the value appears: `(value, row)`. Never called for an absent
          value. Required where the value has no text form. */
      children: Presentation<W, Z>;
    };

/** The field names of a row. */
export type Field<Z> = Extract<keyof Z, string>;

/** The field names whose value is a number or may be absent. */
export type NumberField<Z> = {
  [K in Field<Z>]: Z[K] extends number | Absent ? K : never;
}[Field<Z>];

/* --- Editing (grid mode) --------------------------------------------------- */

/** What a column accepts as `edit`: the core field for its value - `"text"`
    for text, `"number"` for numbers, `"date"` for points in time, `"select"`
    for text and numbers - or an editor of one's own. */
export type EditFor<W, Z> =
  | ([Present<W>] extends [string] ? "text" | "select" : never)
  | ([Present<W>] extends [number] ? "number" | "select" : never)
  | ([Present<W>] extends [Date] ? "date" : never)
  | ((editor: CellEditorProps<W, Z>) => ReactNode);

/** What an editor of one's own receives. The table holds the draft; Enter,
    Escape and Tab stay the table's, bubbling up from the field. */
export interface CellEditorProps<W, Z> {
  /** The draft - the cell's value until the field changes it. */
  value: W | null;
  /** Changes the draft. */
  onChange: (value: W | null) => void;
  /** Commits - the draft, or the value given. A picker commits on its pick. */
  commit: (value?: W | null) => void;
  row: Z;
  /** The draft did not validate: the field shows it; the message stands beneath. */
  invalid: boolean;
  /** The field's name: what is edited, for which row. The `FormField` around
      the editor already names a core field by it. */
  label: string;
}

/** The props a column carries for editing in grid mode (`<Table grid>`). */
export interface EditOptions<W, Z> {
  /** Edits the column's cells in place in grid mode: Enter, F2 or typing
      starts it, Enter or Tab commits, Escape cancels. The table applies
      nothing - the edit is reported through the table's `onCellEdit`. */
  edit?: EditFor<W, Z>;
  /** What `edit="select"` offers; without it, the values that occur. */
  editOptions?: readonly Present<W>[];
  /** Checks a draft before it is reported: a message keeps the editor open
      and stands beneath the field, as in a `FormField`; nothing lets it
      through. */
  validate?: (value: W | null, row: Z) => string | null | undefined;
}

/** An edit the user committed - reported, not applied. */
export interface CellEdit<Z> {
  rowKey: string;
  columnId: string;
  /** The editor's value: text for `"text"`, a number or null for
      `"number"`, a day or null for `"date"`, an option for `"select"`. */
  value: unknown;
  row: Z;
}

/* --- Columns -------------------------------------------------------------- */

export interface ColumnBase {
  /** Names the column in its header, in the column menu and in the header row of the export. */
  label: string;
  /** This column names the row: row header cells, never hideable, the column
      `stickyRowHeader` pins, and the name by which the row's selection, expander and
      actions are read out. At most one per table. */
  rowHeader?: boolean;
  /** Right-aligned with tabular figures. Without it the first value present decides. */
  numeric?: boolean;
  /** Initial width in pixels; without it the browser decides. */
  width?: number;
  /** Shows the drag grip on the header cell. */
  resizable?: boolean;
  /** Keeps the column in view while the table scrolls sideways: in a block
      before every other column, or after them. The user can change it in the
      column menu; the view carries the change. */
  pin?: Pin;
  /** Sortable unless stated otherwise, when the value is text, a number, a point in time or a boolean. */
  sortable?: boolean;
  /** Takes part in the search. Without a statement: yes for text, no otherwise. */
  searchable?: boolean;
  /** Can the table be grouped by this column? Without a statement: yes, when
      its value is text, a number, a point in time or a boolean, or it has a
      `groupValue`. */
  groupable?: boolean;
}

/** How a value that does not sort or export itself does so after all. */
export interface ValuePaths<W> {
  /** What is sorted by, when not by the value itself. */
  sortValue?: (value: Present<W>) => string | number | Absent;
  /** What stands in the export, when not the value itself. */
  exportValue?: (value: Present<W>) => string | number | Absent;
  /** What is grouped by, when not the value itself - a group header of a number, say.
      Rows whose group value is absent form a group of their own. */
  groupValue?: (value: Present<W>) => string | number | boolean | Date | Absent;
}

/** `group` on a point in time: its rows are grouped by day, ISO week, month or
    year. */
export type GroupFor<W> = [Present<W>] extends [Date] ? DatePeriod : never;

export type FieldColumn<Z, K extends Field<Z>> = ColumnBase &
  ValuePaths<Z[K]> & {
    /** A field of the row. Supplies the column's `id` at the same time. */
    value: K;
    /** An id of one's own instead of the field name – for two columns over the same field. */
    id?: string;
    /** A standard presentation by name: `"percent"`, `"count"` or
        `{ decimals }` for numbers, `"date"`, `"time"` or `"dateTime"` for
        points in time. Alignment, sorting, export and footer stay with the value. */
    format?: FormatFor<Z[K]>;
    /** A filter in the column header: `"list"` offers the values that occur,
        `"range"` two bounds (numbers or points in time), a filter from
        `columnFilter` asks whatever it asks itself. Its condition stands in the
        table toolbar. */
    filter?: FilterFor<Z[K]>;
    /** Groups points in time by `"day"`, `"week"`, `"month"` or `"year"`. */
    group?: GroupFor<Z[K]>;
  } & AggregateProps<Z[K], Z> &
  EditOptions<Z[K], Z> &
  ChildrenFor<Z[K], Z>;

type Computed<Z, W> = ColumnBase &
  ValuePaths<W> & {
    /** The id is required where the value is a function. */
    id: string;
    value: (row: Z) => W;
    /* The two names stand here without a condition on the value type, unlike on
       a field column: the value of a computed column is derived from `value`,
       and a condition over this W is not yet resolved when the overload is
       chosen - `filter="range"` would then leave the whole column untyped. A
       filter of one's own is still checked against the value. */
    /** A filter in the column header: `"list"` offers the values that occur,
        `"range"` two bounds (meaningful only for numbers and points in time), a
        filter from `columnFilter` asks whatever it asks itself. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the condition belongs to the filter
    filter?: "list" | "range" | ColumnFilter<Present<W>, any>;
    /** Edits the column's cells in place in grid mode - see a field column's `edit`. */
    edit?: "text" | "number" | "select" | "date" | ((editor: CellEditorProps<W, Z>) => ReactNode);
    /** What `edit="select"` offers; without it, the values that occur. */
    editOptions?: readonly Present<W>[];
    /** Checks a draft before it is reported; a message keeps the editor open. */
    validate?: (value: W | null, row: Z) => string | null | undefined;
  };

/* Ticket 01: the overloads differ by REQUIRED properties, so that an unfitting
   one drops out before it fixes the parameters of `children`; the field column
   stands last, because TypeScript shows the message of the last one and a
   mistyped field name is the most frequent error. */
export interface ColumnComponent<Z> {
  <W extends number | Absent>(
    props: Computed<Z, W> & { footer: "sum" | "avg"; aggregate?: never; format?: NumberFormat; children?: Presentation<W, Z>; share?: boolean },
  ): ReactNode;
  <W extends number | Absent>(
    props: Computed<Z, W> & {
      aggregate: "sum" | "avg" | "min" | "max" | "count" | "distinct";
      footer?: never;
      share?: boolean;
      format?: NumberFormat;
      children?: Presentation<W, Z>;
    },
  ): ReactNode;
  <W extends Date | Absent>(
    props: Computed<Z, W> & {
      aggregate: "min" | "max" | "range" | "count" | "distinct";
      footer?: never;
      format?: DateFormat;
      group?: DatePeriod;
      children?: Presentation<W, Z>;
    },
  ): ReactNode;
  <W extends Date | Absent>(
    props: Computed<Z, W> & {
      group: DatePeriod;
      aggregate?: "min" | "max" | "range" | "count" | "distinct";
      footer?: never;
      format?: DateFormat;
      children?: Presentation<W, Z>;
    },
  ): ReactNode;
  <W extends number | Absent>(
    props: Computed<Z, W> & { format: NumberFormat; aggregate?: AggregateFunction<W, Z>; share?: boolean; children?: Presentation<W, Z> },
  ): ReactNode;
  <W extends Date | Absent>(
    props: Computed<Z, W> & { format: DateFormat; group?: DatePeriod; aggregate?: AggregateFunction<W, Z>; children?: Presentation<W, Z> },
  ): ReactNode;
  <W>(
    props: Computed<Z, W> & {
      footer?: never;
      format?: never;
      aggregate?: AggregateFunction<W, Z>;
      children: Presentation<W, Z>;
    },
  ): ReactNode;
  <W extends Displayable | Absent>(
    props: Computed<Z, W> & { footer?: never; format?: never; aggregate?: "count" | "distinct" | AggregateFunction<W, Z>; children?: never },
  ): ReactNode;
  <K extends Field<Z>>(props: FieldColumn<Z, K>): ReactNode;
}

/* --- Group keys ----------------------------------------------------------- */

interface GroupByBase {
  /** Names the group key where a grouping is chosen, and in the grouping's tag in the table toolbar. */
  label: string;
}

/** A value the table can be grouped by without being a column: no cell, no
    export, no entry among the columns - only where a grouping is chosen. */
export interface GroupByComponent<Z> {
  <W extends string | number | boolean | Date | Absent>(
    props: GroupByBase & {
      /** The id is required where the value is a function. */
      id: string;
      value: (row: Z) => W;
      groupValue?: (value: Present<W>) => string | number | boolean | Date | Absent;
      group?: GroupFor<W>;
    },
  ): ReactNode;
  <K extends Field<Z>>(
    props: GroupByBase & {
      /** A field of the row; supplies the id at the same time. */
      value: K;
      id?: string;
      groupValue?: (value: Present<Z[K]>) => string | number | boolean | Date | Absent;
      group?: GroupFor<Z[K]>;
    },
  ): ReactNode;
}

/** The properties of a column, as `column()` supplies them. */
export type ColumnPreset<P, K extends Field<P> = Field<P>> = FieldColumn<P, K>;

/* --- The verdict column --------------------------------------------------- */

interface VerdictBase {
  /** Names the column in its header, in the column menu and in the header row of the export. */
  label: string;
  /** The limit set every value is read against. */
  limits: LimitSet;
  /** How the value and its excess are written. */
  format?: NumberFormat;
  /** What the column sorts by: by the weight of the verdict (the default; with
      equal weight the existing order stays) – or by the value. */
  sortBy?: "verdict" | "value";
  /** Initial width in pixels; without it the browser decides. */
  width?: number;
  /** Shows the drag grip on the header cell. */
  resizable?: boolean;
  /** Keeps the column in view while the table scrolls sideways, before or after every other column. */
  pin?: Pin;
  /** A verdict column has no list filter: four verdicts are filtered through the sort. */
  filter?: never;
  /** `"worst"`: the worst verdict among the rows – in the footer and in a
      group's header. */
  aggregate?: "worst";
}

export interface VerdictColumnComponent<Z> {
  (props: VerdictBase & { id: string; value: (row: Z) => number | Absent }): ReactNode;
  <K extends NumberField<Z>>(props: VerdictBase & { value: K; id?: string }): ReactNode;
}

/* --- Row trimmings -------------------------------------------------------- */

export interface RowDetailProps<Z> {
  /** What stands underneath an expanded row. */
  children: (row: Z) => ReactNode;
}

export interface RowActionsProps {
  /** The row's `Action`s. */
  children: ReactNode;
}

interface ActionBase {
  /** The label – text, because it is read out together with the row's name. */
  children: string;
  /** `"danger"` for an action that destroys something – that is how it appears in the menu and in the table toolbar. */
  tone?: "default" | "danger";
}

export type ActionProps<Z> =
  | (ActionBase & {
      bulk?: false;
      /** Gets the row the action was triggered on. */
      onSelect: (row: Z) => void;
    })
  | (ActionBase & {
      /** Acts on a list: at the row on a list made from it, in the table
          toolbar on the selection within the filtered set. */
      bulk: true;
      /** With `bulk` a list: at the row one made from it, in the table toolbar the selection. */
      onSelect: (rows: readonly Z[]) => void;
    });

/** What a row carries in classes and data attributes. */
export type RowAttributes = { className?: string } & {
  [data: `data-${string}`]: string | undefined;
};

export interface TableProps<Z> {
  /** Adds the selection column. "All" means: the filtered set. */
  selectable?: boolean;
  /** Keeps the header row visible while scrolling. */
  stickyHeader?: boolean;
  /** Keeps the row header column visible while scrolling sideways - the same as
      `pin="start"` on the row header. */
  stickyRowHeader?: boolean;
  /** Discreet zebra stripes. */
  striped?: boolean;
  /** Without a statement the density of the `UmrissProvider`, without a provider "regular". */
  density?: "regular" | "compact";
  /** Height of the scroll area, e.g. "480px". A virtualised table needs it. */
  maxHeight?: string;
  /** What stands in the body when there are no rows. Empty because of a filter
      the table shows itself – with the way back. */
  empty?: ReactNode;
  /** Shows placeholder rows instead of the rows. */
  loading?: boolean;
  /** Classes and data attributes per row. */
  rowProps?: (row: Z) => RowAttributes;
  /** Accessible name of the table (not of the outer frame). */
  ariaLabel?: string;
  /** Classes on the outer frame of the table. */
  className?: string;
  /** `false`: the user cannot group this table - the column menu offers no
      grouping, and a grouping handed in is passed over. */
  groupable?: boolean;
  /** Grid mode: the table is one tab stop, and the arrows walk its cells -
      Home and End in the row, Ctrl+Home and Ctrl+End to the table's ends,
      PageUp and PageDown by the rows in view. A cell's own controls are
      reached with Enter or F2 and left with Escape; a column with `edit` is
      edited in place. Without it the table stays a native table. */
  grid?: boolean;
  /** Grid mode: an edit the user committed. The table applies nothing; the
      cell shows the new value when the rows passed in carry it. */
  onCellEdit?: (edit: CellEdit<Z>) => void;
  /** Columns, `RowDetail`, `RowActions` and the unbound parts. */
  children?: ReactNode;
}

/* --- Conditions ----------------------------------------------------------- */

/** The condition of a list filter: the chosen values, an absent one as `null`. */
export type ListCondition<W> = readonly (Present<W> | null)[];

/** The condition of a range filter: both bounds inclusive, each may be absent. */
export interface RangeCondition<W> {
  from?: W;
  to?: W;
}

/** What can be set as a condition on a field: a list of its values, and for
    numbers and points in time a range as well. */
export type FieldCondition<W> =
  | ListCondition<W>
  | ([Present<W>] extends [number] ? RangeCondition<number> : [Present<W>] extends [Date] ? RangeCondition<Date> : never);

/** Sets a condition from outside. Typed at the field of the row, not at the
    column: the columns stand in the JSX, and the hook does not see that
    (ADR-0017). An id that is not a field name – a computed column or an `id` of
    one's own – takes any condition; through it the condition of a filter of
    one's own is set as well. */
export interface SetFilter<Z> {
  <K extends Field<Z>>(column: K, condition: FieldCondition<Z[K]> | null): void;
  <I extends string>(column: I & (I extends Field<Z> ? never : unknown), condition: unknown): void;
}

/* --- The hook ------------------------------------------------------------- */

interface TableOptionsCommon<Z> {
  /** A stable key per row – the basis of selection and expansion. */
  rowKey: (row: Z) => string;
  /** Default 10. */
  pageSize?: number;
  /** The application's sort; it is the default that `view` leaves out. */
  defaultSort?: SortLevel | readonly SortLevel[] | null;
  /** The application's grouping: a column or group key, or up to three, the
      outermost first. It is the default that `view` leaves out; without it
      the table is ungrouped until the user groups it. */
  defaultGrouping?: GroupingId<Z> | readonly GroupingId<Z>[];
  /** Which rows the table has at all – by permission, by plant, by anything the
      user is not meant to undo. It is invisible: never a condition, never
      reset, never part of the view, and "43 of 1,204" counts only the rows it
      admits. It may stand in the call; a change leaves the page standing, and
      the model clamps it. */
  preFilter?: (row: Z) => boolean;
  /** The old name of `preFilter` – the same filter, the same meaning.
      @deprecated Is called `preFilter` now; the old name goes with the next minor version. */
  filter?: (row: Z) => boolean;
  /** The view on the first render. The table remembers none: where a view is
      kept is the application's decision. Names no column carries fall out. */
  initialView?: TableView;
  /** Renders only what stands in the scroll area; paging is then off. */
  virtual?: { rowHeight: number; overscan?: number };
  /** A selection from outside instead of its own – when the application holds it. */
  selection?: TableSelection<string>;
}

/** The table holds every row and does the work itself. */
interface AutomaticMode {
  /** Without it the table holds every row and does the work itself. */
  manual?: false;
  rowCount?: never;
  onViewChange?: never;
  filterOptions?: never;
}

/** Manual mode: the rows are the page a server answered for the view the table
    reported. The table searches, filters, sorts, groups and pages nothing of
    its own; select all, the export and the footer would act on one page and
    call it the whole, so "select all" says it selects the page, the export
    writes the page and says so, and there is no footer and no grouping. */
interface ManualMode {
  /** Manual mode: the rows are one page a server answered. */
  manual: true;
  /** How many rows the server's filtered set has - the pages and the counts
      read it. */
  rowCount: number;
  /** The view changed where it decides the rows: search, conditions, sort,
      page or page size. Called once when the table first stands and once per
      change, with every one of the five present. */
  onViewChange: (view: ManualView) => void;
  /** The values a list filter offers for a column, `null` for an absent one -
      the table cannot count what it does not hold. */
  filterOptions?: (column: string) => readonly unknown[];
}

/** The options of `useTable`: automatic, or manual over a server. */
export type TableOptions<Z> = TableOptionsCommon<Z> & (AutomaticMode | ManualMode);

/** The state of a table, as everything outside the columns reads it. */
export interface TableSnapshot<Z> {
  /** All the rows passed in, including those the pre-filter does not admit. */
  rows: readonly Z[];
  /** The filtered set: what the pre-filter admits and search and filters leave, across all pages. */
  filtered: readonly Z[];
  /** What is rendered right now: the page or the window. */
  visible: readonly Z[];
  /** The page shown, from 1. Without `Pagination` always 1. */
  page: number;
  /** How many pages the filtered set makes. */
  pageCount: number;
  /** Rows per page. */
  pageSize: number;
  /** Changes the page, clamped to those that exist. */
  setPage: (page: number) => void;
  /** Sets the rows per page; back to page one. */
  setPageSize: (size: number) => void;
  /** The search text. */
  search: string;
  /** Sets the search text; back to page one. */
  setSearch: (search: string) => void;
  /** The sort levels, the first one first – only over columns that registered. */
  sort: readonly SortLevel[];
  /** Sorts by a column. With `additive` a level is added instead of replacing the sort. */
  toggleSort: (column: string, additive?: boolean) => void;
  /** The ids of the hidden columns. */
  hidden: readonly string[];
  /** Hides a column or shows it again. The row header stays. */
  toggleColumn: (column: string) => void;
  /** The order of the columns as ids, as the user chose it. */
  order: readonly string[];
  /** Reorders the columns – on header, body and footer at once. */
  setOrder: (order: readonly string[]) => void;
  /** The pinned columns by id - the declared ones until the user chooses. */
  pinned: Readonly<Record<string, Pin>>;
  /** Pins a column to the start or the end, or unpins it with `null`. */
  setPin: (column: string, pin: Pin | null) => void;
  /** The widths in pixels: those of the columns, and over them the dragged ones. */
  widths: Readonly<Record<string, number>>;
  /** Sets the width of a column; `undefined` takes it back. */
  setWidth: (column: string, width: number | undefined) => void;
  /** The keys of the expanded rows. */
  expanded: readonly string[];
  /** Expands a row or collapses it. */
  toggleRow: (key: string) => void;
  /** The conditions of the column filters per column, in the order in which
      they were set. Whatever fits no column is absent. */
  filter: Readonly<Record<string, unknown>>;
  /** Sets the condition of a column filter; `null` clears it. Back to page one.
      A condition that does not fit the kind of the filter – a range on a list
      filter, a column without a filter – is passed over with a warning in
      development. */
  setFilter: SetFilter<Z>;
  /** The selection – its own or the one handed in through `selection`. */
  selection: TableSelection<string>;
  /** The ids the table is grouped by, the outermost first – only those a
      groupable column or a group key carries, at most three. */
  grouping: readonly string[];
  /** Groups by these columns or group keys; `[]` ungroups. Back to page one. */
  setGrouping: (grouping: readonly string[]) => void;
  /** The paths of the folded groups that still occur. */
  folded: readonly string[];
  /** Folds a group or unfolds it. A group of one row does not fold. */
  toggleFold: (path: string) => void;
  /** Folds every group that has more than one row. */
  foldAll: () => void;
  /** Unfolds every group. */
  unfoldAll: () => void;
  /** The part of the state an application can keep; whatever is at its default is absent. */
  view: TableView;
  /** The filtered set in the visible columns as text for a spreadsheet - in
      manual mode the page. */
  asCsv: () => string;
  /** Whether it virtualises. */
  virtual: boolean;
  /** How many rows the filtered set has - in manual mode the server's count. */
  rowCount: number;
  /** Whether it is in manual mode: the rows are one page of a server's. */
  manual: boolean;
}

/** What a part without a row type needs from a table – for `of`. */
export type TableRef = Omit<TableSnapshot<unknown>, "setFilter"> & {
  readonly Table: unknown;
  /** Without a row kind: any id, any condition. */
  setFilter(column: string, condition: unknown): void;
};

export interface Table<Z> extends TableSnapshot<Z> {
  Table: (props: TableProps<Z>) => ReactNode;
  Column: ColumnComponent<Z>;
  VerdictColumn: VerdictColumnComponent<Z>;
  RowDetail: (props: RowDetailProps<Z>) => ReactNode;
  RowActions: (props: RowActionsProps) => ReactNode;
  Action: (props: ActionProps<Z>) => ReactNode;
  GroupBy: GroupByComponent<Z>;
}

/** A column or group key the table can be grouped by. The columns stand in the
    JSX, which the hook does not see: a field name is suggested, any id is
    taken, and one that nothing carries falls out. */
export type GroupingId<Z> = Field<Z> | (string & {});
