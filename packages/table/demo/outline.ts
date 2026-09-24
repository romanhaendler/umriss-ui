/* The outline of the demo of @umriss-ui/table - in one place.

   It is data, not markup: sidebar, overview, jump palette, page head, props
   tables and the screenshot suite all read from it.

   One page per part that a developer looks up by name (table-demo, decision B)
   - the same rule as in the demo of @umriss-ui/core, and for the same reason: an
   address names a component. `useTable` has no page of its own but stands with
   `Table`, where a table begins; `column` stands with `Column`, `Action` with
   `RowActions`, `alarmModel` with `AlarmList`. Pages by topic ("Values and
   formats", "Widths", "Appearance") read well and would break exactly that
   rule; the topics stand under "Why so" on the long pages instead.

   One exception stands: **Filter**. The three kinds - the values that occur,
   two bounds, a filter of the application's own - are one subject that several
   parts share and none owns; as examples they lay on `Column`, the explanation
   under "Why so", and writing a filter of one's own is not a paragraph but a
   route. The glossary permits a page for it (**Page**), and
   `.scratch/table-demo/spec.md` says what was reversed by that (table-filters
   07). The pre-filter stays with `Table`: it is an option of the hook and not a
   column filter.

   `Search`, `ColumnMenu`, `Export` and `Pagination` could have stood as parts
   on the page of `Toolbar`. They do not: each is imported and looked up under
   its own name, and each has a behaviour that earns an example of its own.

   What is NOT here: the examples. They come from the files under
   `demo/examples/` and from nothing else. */

import { addresses } from "@umriss-ui/demo/outline";
import type { Rubric } from "@umriss-ui/demo/outline";

export type { Rubric, Page } from "@umriss-ui/demo/outline";

export const OUTLINE: readonly Rubric[] = [
  {
    id: "tables",
    name: "Tables",
    sentence: "Where a table begins: the hook that binds the row kind, and the column that has exactly one value.",
    pages: [
      {
        id: "table",
        name: "Table",
        sentence: "The table that renders its rows itself - with selection, sticky parts, density, an initial view and twenty thousand rows where it has to be.",
        types: ["TableProps", "TableOptions", "TableSnapshot"],
        exports: ["useTable"],
      },
      {
        id: "column",
        name: "Column",
        sentence: "A column: one value, read from a field or computed, and optionally its presentation - typed against the rows of the hook it came from.",
        types: ["FieldColumn", "ColumnBase", "ValuePaths"],
        exports: ["useTable", "column"],
      },
      {
        id: "filter",
        name: "Filter",
        sentence: "How a column is restricted: the values that occur, two bounds - or a filter the application writes itself. And how a condition is set from outside and read back.",
        types: ["ColumnFilter", "FilterInputProps"],
        exports: ["columnFilter"],
      },
    ],
  },
  {
    id: "grouping",
    name: "Grouping",
    sentence: "What rows have in common, read at a glance: groups on up to three levels, and what their values come to.",
    pages: [
      {
        id: "grouping",
        name: "Grouping",
        sentence: "Group a table by a column or by a value that is none - bands for the outer levels, a span for the innermost, one line when folded.",
        types: ["GroupByBase"],
        exports: ["useTable"],
      },
      {
        id: "aggregate",
        name: "Aggregate",
        sentence: "What a column's values come to - in the footer over the filtered set, in a group's band over its rows.",
        types: ["AggregateOptions"],
        exports: ["useTable"],
      },
    ],
  },
  {
    id: "rows",
    name: "Rows",
    sentence: "What hangs on a row without being a column: the detail beneath it and the actions beside it.",
    pages: [
      {
        id: "rowdetail",
        name: "RowDetail",
        sentence: "What stands under an expanded row - several at once, and open even across a change of filter.",
        types: ["RowDetailProps"],
        exports: ["useTable"],
      },
      {
        id: "rowactions",
        name: "RowActions",
        sentence: "Actions at the row, quiet until the row is meant - and a bulk action that always receives a list.",
        types: ["RowActionsProps", "ActionProps"],
        exports: ["useTable"],
      },
    ],
  },
  {
    id: "unbound",
    name: "Unbound parts",
    sentence: "The parts that touch no row: placed in the table they read it, outside they take `of`.",
    pages: [
      {
        id: "toolbar",
        name: "Toolbar",
        sentence: "The table toolbar above the table for search, column menu and export - and for the bulk actions, as long as a selection stands.",
        types: ["ToolbarProps"],
        exports: ["Toolbar"],
      },
      {
        id: "search",
        name: "Search",
        sentence: "The search across the columns carrying text - in the table toolbar or at any other place on the page.",
        types: ["SearchProps"],
        exports: ["Search"],
      },
      {
        id: "columnmenu",
        name: "ColumnMenu",
        sentence: "Show and hide columns and arrange them - effective on head, body and foot at once.",
        types: ["ColumnMenuProps"],
        exports: ["ColumnMenu"],
      },
      {
        id: "export",
        name: "Export",
        sentence: "The filtered set in the visible columns, as a file or as text - with the values, not with their presentation.",
        types: ["ExportProps"],
        exports: ["Export"],
      },
      {
        id: "pagination",
        name: "Pagination",
        sentence: "The paging bar - and the rule that a table only pages where one stands.",
        types: ["PaginationProps"],
        exports: ["Pagination"],
      },
    ],
  },
  {
    id: "monitoring",
    name: "Monitoring",
    sentence: "A reading, read against its limits - and alarms with a lifecycle.",
    pages: [
      {
        id: "verdictcolumn",
        name: "VerdictColumn",
        sentence: "A column that reads a measured value against a limit set and shows the verdict - built from the public interface alone.",
        types: ["VerdictBase"],
        exports: ["useTable"],
      },
      {
        id: "alarmlist",
        name: "AlarmList",
        sentence: "Alarms with a lifecycle, as a table of the same interface: standing or cleared, acknowledged or not - the library generates none.",
        types: ["AlarmListProps"],
        exports: ["AlarmList", "alarmModel"],
      },
    ],
  },
];

/* The addresses follow from the outline; their format is known to the shell
   (`@umriss-ui/demo`, `outline.ts`) and to nobody else. */
export const ADDRESSES = addresses(OUTLINE);
export const { ALL_PAGES, placeOf, addressOf, fromAddress } = ADDRESSES;
