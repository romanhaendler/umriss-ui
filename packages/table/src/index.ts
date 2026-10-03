/* The public entry of @umriss-ui/table.

   There is no unbound exported `Column`: a column is typed against the rows of
   the hook it came from, and that connection arises only when both come from
   the same call (ADR-0017). What is exported unbound is what does not touch
   the row. */

export { useTable } from "./useTable";
export { column } from "./column";
export { columnFilter } from "./columnFilter";
export type { FilterInputProps, ColumnFilter } from "./columnFilter";
export { ColumnMenu, Export, Pagination, Search, Toolbar } from "./unbound";
export type { ColumnMenuProps, ExportProps, PaginationProps, SearchProps, ToolbarProps } from "./unbound";
/* The types a caller names by name - for a wrapper with `of`, a preset, props
   of one's own. The helper types behind them stay internal; the build's
   declarations carry them along anyway. */
export type {
  ActionProps,
  RangeCondition,
  Field,
  FieldCondition,
  SetFilter,
  ListCondition,
  RowActionsProps,
  RowDetailProps,
  ColumnComponent,
  ColumnPreset,
  Table,
  TableOptions,
  TableRef,
  TableSnapshot,
  TableProps,
  VerdictColumnComponent,
  RowAttributes,
} from "./types";
export type { DateFormat, NumberFormat } from "./values";

/* The view as an object: `initialView` in, `t.view` out. Where it is kept the
   application decides. */
export type { ManualView, TableView } from "./model/view";
export type { SortDirection, SortLevel } from "./model/tableModel";

/* The selection as a hook of its own - for a selection the application holds
   and hands the table as `selection`. */
export { useTableSelection } from "./model/useTableSelection";
export type { TableSelection } from "./model/useTableSelection";

/* The alarm list, expressed in the same interface as any other table
   (umriss-table 13), with its model. */
export * from "./alarms";

/* Grouping and aggregates (table-grouping). */
export type { AggregateOptions, AggregateFunction, GroupByComponent, GroupingId } from "./types";

/* Grid mode and editing in place (table-grid-mode, ADR-0034, ADR-0036). */
export type { CellEdit, CellEditorProps, EditFor, EditOptions, RowAdd, RowDelete, RowSave } from "./types";

/* Row filters: a condition the application defines over the whole row
   (table-filters 08). */
export { rowFilter } from "./rowFilter";
export type { RowFilter } from "./rowFilter";

/* The types a props table names, so that every name a reader sees can be
   imported (types-without-holes 06). */
export type {
  Absent,
  AggregateFor,
  FilterFor,
  FooterFor,
  FormatFor,
  GroupFor,
  Present,
  Presentation,
} from "./types";
export type { Pin } from "./model/pinning";
export type { ToolbarSize } from "./toolbarSize";

/* The types a header, a cell or a definition on a page names, so that the
   gate finds no name a reader cannot import (props-table-hygiene 04). */
export type { ColumnBase, Displayable, FieldColumn, GroupByBase, IsDisplayable, ValuePaths, VerdictBase } from "./types";
export type { DatePeriod, RowGroup } from "./model/grouping";

/* The types the API index names in a hook's or a function's signature, so
   that every name a reader sees there can be imported (api-index 02,
   ADR-0044). `ModelColumn` is what the model reads of a column - not the
   hook's `Column` (ADR-0017). */
export type { Computed, NumberField } from "./types";
export type { ModelColumn, TableInput, TreeInput } from "./model/tableModel";
export type { AggregateColumn, AggregateKind, GroupLevel, OwnAggregate } from "./model/grouping";
export type { AlarmAvailability, AlarmBase } from "./alarms/alarmModel";
