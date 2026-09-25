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
export type { TableView } from "./model/view";
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

/* Grid mode and editing in place (table-grid-mode, ADR-0034). */
export type { CellEdit, CellEditorProps, EditFor, EditOptions } from "./types";
