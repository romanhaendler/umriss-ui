/* The outline of the demo of @umriss-ui/table - in one place.

   It is data, not markup: sidebar, overview, jump palette, page head, props
   tables and the screenshot suite all read from it.

   One page per part that a developer looks up by name (table-demo, decision B)
   - the same rule as in the demo of @umriss-ui/core, and for the same reason: an
   address names a component. `useTable` has no page of its own but stands with
   `Table`, where a table begins; `column` stands with `Column`, `Action` with
   `RowActions`, `alarmModel` with `AlarmList`. Pages by topic ("Values and
   formats", "Widths", "Appearance") read well and would break exactly that
   rule; the topics stand in the about of the long pages instead.

   One exception stands: **Filter**. The three kinds - the values that occur,
   two bounds, a filter of the application's own - are one subject that several
   parts share and none owns; as examples they lay on `Column`, the explanation
   in its about, and writing a filter of one's own is not a paragraph but a
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
    id: "getting-started",
    name: "Getting started",
    sentence: "What an application sets up once, before its first table.",
    pages: [
      {
        id: "installation",
        name: "Installation",
        sentence: "Two packages, no stylesheet to import, and one hook that turns an array of rows into a table.",
        about: [
          "Install `pnpm add @umriss-ui/table @umriss-ui/core`. The core package is a peer dependency: the table reads its provider, its formats and its wording (ADR-0016). React 18 or 19 as a peer as well.",
          "There is no stylesheet to import. The table loads its own, and the core package loads the tokens it reads; both lie in cascade layers, so the application's CSS wins. `@umriss-ui/table/styles.css` stays exported for setups that link stylesheets by hand.",
          "A table is read by default: a native table, where every control is one Tab away and a screen reader keeps its table keys. Grid mode makes it one Tab stop whose cells the arrow keys walk, and it is the mode for editing. Switch it on only where people work in the cells (ADR-0034).",
        ],
        types: [],
        exports: ["useTable"],
      },
    ],
  },
  {
    id: "tables",
    name: "Tables",
    sentence: "Where a table begins: the hook that binds the row kind, and the column that has exactly one value.",
    pages: [
      {
        id: "table",
        name: "Table",
        sentence: "Rows of records to scan, sort, search and select (also called a data table or data grid). Reach for it when people compare many records by the same fields; from a few rows to a million on a server.",
        about: [
          "`useTable` takes the rows and hands back the `Table` and the `Column` that belong to them, so a column can only name a field the row has. The parts that touch no row, such as `Toolbar` or `Search`, are ordinary imports.",
          "The table remembers nothing, not in the address and not in any storage. Search, sort, hidden columns, widths and page stand in `t.view`; keep it where the application keeps things and hand it back through `initialView`.",
          "“Select all” selects what search and filters leave, on every page. A table pages only where a `Pagination` stands, and a virtualised table does not page at all.",
        ],
        alternatives: [
          { when: "Alarms that are raised, acknowledged and resolved", use: "alarmlist" },
          { when: "Measured values read against their limits", use: "verdictcolumn" },
          { when: "Three or four key figures side by side", use: "`Stat` from @umriss-ui/core" },
        ],
        keys: [
          { key: "Tab", action: "Table mode: moves through the header buttons, checkboxes and row actions. Grid mode: enters and leaves the grid, which is one stop." },
          { key: "Shift + click", action: "On a header: adds the column as a further sort level." },
          { key: "↑ ↓ Home End", action: "In a virtualised table, on a row: moves to the next, previous, first or last row, rendered or not." },
          { key: "← → ↑ ↓", action: "Grid mode: moves the active cell." },
          { key: "Home / End", action: "Grid mode: the first or last cell of the row." },
          { key: "Ctrl + Home / Ctrl + End", action: "Grid mode: the first cell of the head, the last cell of the footer." },
          { key: "Page Up / Page Down", action: "Grid mode: moves by the rows in view." },
          { key: "Enter / F2", action: "Grid mode: starts an edit, or reaches the cell's own controls." },
          { key: "Escape", action: "Grid mode: cancels an edit, or goes back from a control to its cell." },
          { key: "Space", action: "Grid mode: selects the row of the active cell." },
          { key: "Tab (while editing)", action: "Grid mode: commits the edit and moves to the next cell that edits." },
        ],
        limits: [
          "No cell range selection and no undo: an edit is reported, never applied, and the application owns the rows (ADR-0032).",
          "No pivot: compute the pivoted rows and declare their columns (ADR-0032).",
          "Paging and virtualisation do not combine; one table does one or the other.",
          "In manual mode the table sorts, filters and pages nothing itself, and it shows no groups and no footer.",
        ],
        types: ["TableProps", "TableOptions", "TableSnapshot"],
        exports: ["useTable"],
      },
      {
        id: "column",
        name: "Column",
        sentence: "One value per row, read from a field or computed, and how it looks in the cell. Everything the table does with a column (sort, search, export, total) works on that value, never on what the cell shows.",
        about: [
          "Without a presentation the value type decides: text on the left, numbers right-aligned with tabular figures, points in time as date and time, truth values as a word.",
          "`null`, `undefined` and `NaN` are an absent value: a muted dash, last in either sort direction, counted in no total. The presentation is never called for it.",
          "A computed value needs an `id`, and a column shared by many tables becomes a preset with `column()`.",
        ],
        alternatives: [
          { when: "Restricting a column to some of its values", use: "filter" },
          { when: "A group key that should not be a column", use: "grouping" },
          { when: "A measured value read against a limit set", use: "verdictcolumn" },
        ],
        keys: [
          { key: "Alt + → / Alt + ←", action: "On a resizable header: wider or narrower. Alt + Shift + → and Alt + Shift + ← take larger steps." },
          { key: "Alt + Home", action: "On a resizable header: fits the width to the content." },
        ],
        types: ["FieldColumn", "ColumnBase", "ValuePaths"],
        exports: ["useTable", "column"],
      },
      {
        id: "filter",
        name: "Filter",
        sentence: "Narrow a column to some of its values: those that occur, a range between two bounds, or a condition the application defines. Reach for it when people look for records by a field rather than by free text.",
        about: [
          "Every condition stands in the table toolbar with the count of matches, a cross to lift it and “Reset” for all. A click on a condition opens its filter again.",
          "An absent value matches no condition. The list filter offers only values the pre-filter admits, so it never gives away rows a user may not see.",
        ],
        alternatives: [
          { when: "Free text across the columns", use: "search" },
          { when: "Rows a user may not see at all, invisibly", use: "table" },
        ],
        limits: [
          "No text filter per column: the search covers text.",
          "In manual mode a list filter offers what the application names; the table cannot count values it does not hold.",
        ],
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
        sentence: "Gather rows that share a value under one header with their count and totals (also called row grouping). Reach for it when the question is per customer, per team or per month rather than per record.",
        about: [
          "The outer levels become header rows that carry every total under its column; the innermost of several levels stands as a span beside its rows. The form follows the level, never the data (ADR-0029).",
          "Grouping comes after search and filters: a group holds what they leave, and its totals are taken from its rows, never from the groups inside it.",
          "Grouping is on for every table: the user groups from the column menu, up to three levels, and the table toolbar names the grouping.",
        ],
        alternatives: [
          { when: "Only the totals of the whole list", use: "aggregate" },
        ],
        keys: [
          { key: "→ / ←", action: "On a fold: unfolds or folds its group." },
          { key: "Alt + → / Alt + ←", action: "On a fold: unfolds or folds the group and all its siblings." },
        ],
        limits: [
          "No pivot and no more than three levels (ADR-0032).",
          "No bar to drag headers onto: grouping is chosen in the column menu.",
          "No groups in manual mode: they would be made of one page.",
        ],
        types: ["GroupByBase"],
        exports: ["useTable"],
      },
      {
        id: "aggregate",
        name: "Aggregate",
        sentence: "What a column's values come to: a sum, an average, the extremes, a count. It stands in the footer over the filtered rows and in each group header over the group's rows.",
        about: [
          "An aggregate is always computed from rows: a group's average is over its rows, not over the averages of the groups inside it. Absent values do not count.",
          "A rate or a weighted average is the application's to say, with an aggregate of its own.",
        ],
        alternatives: [
          { when: "A key figure outside the table", use: "`Stat` from @umriss-ui/core" },
        ],
        limits: [
          "No footer in manual mode: a sum over one page would misstate the server's set.",
        ],
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
    id: "limits-and-alarms",
    name: "Limits and alarms",
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
        sentence: "Alarms with a lifecycle, as a table of the same interface: active or resolved, acknowledged or not - the library generates none.",
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
