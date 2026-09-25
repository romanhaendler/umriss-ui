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
        sentence: "More about a row, opened beneath it on demand (also called an expandable or master-detail row). Reach for it when a row needs facts, notes or a small table of its own that would crowd the columns.",
        about: [
          "The table puts an expander at the start of each row, named after the row – “Expand FP-1004210”. Several rows can be open at once, and a row stays open by its key: a search or a filter that hides it for a moment does not close it.",
          "The detail spans all visible columns. Its function is called while the table renders, so a detail that needs a hook – a table of its own – goes into a component.",
        ],
        keys: [
          { key: "Enter", action: "On an expander: open or close the row's detail." },
          { key: "Space", action: "On an expander: open or close the row's detail." },
        ],
        types: ["RowDetailProps"],
        exports: ["useTable"],
      },
      {
        id: "rowactions",
        name: "RowActions",
        sentence: "Buttons at the end of each row for what the user does to that row – open, approve, reject. Mark one as a bulk action and it also acts on every ticked row at once.",
        about: [
          "Up to two actions stand in the row as buttons; from three on, all of them move into one menu per row, so the column keeps its width and no action changes place when another is added. Each is read out with the row's name – “Open: INV-26-0318”.",
          "The buttons are always visible: quiet in the secondary colour at rest, in the accent while the pointer is over the row or the focus inside it.",
          "A `bulk` action always receives a list – one row when pressed at the row, the selection within the filtered set when pressed in the toolbar. One function, and three rows are one confirmation, not three.",
        ],
        keys: [
          { key: "Enter / Space", action: "On an action: run it. On the row's menu button: open the menu." },
          { key: "↓ / ↑", action: "In the menu: the next or previous entry, wrapping around." },
          { key: "Home / End", action: "In the menu: the first or last entry." },
          { key: "Escape", action: "Close the menu; the focus returns to its button." },
          { key: "Tab", action: "Close the menu and move on." },
        ],
        types: ["RowActionsProps", "ActionProps"],
        exports: ["useTable"],
      },
    ],
  },
  {
    id: "unbound",
    name: "Unbound parts",
    sentence: "The parts that touch no row: placed in the table they read it, and they work outside it too.",
    pages: [
      {
        id: "toolbar",
        name: "Toolbar",
        sentence: "The bar above the table that holds its search, column menu and export, shows how many rows match, and carries the bulk actions while rows are ticked (also called a table header bar).",
        about: [
          "It stands above the table wherever it stands in the JSX. On the left go the parts you put into it, then the conditions of the column filters; on the right the count of matches and “Reset” while something restricts, and the selection with its bulk actions while rows are ticked.",
          "A table with a search or a column filter puts up a toolbar of its own when none stands. Outside the table, pass `of` to the toolbar and to each part in it, and place it before the table – after it, it registers only after the first paint.",
        ],
        alternatives: [{ when: "Actions that should stay in view while the page scrolls", use: "`Dock` from @umriss-ui/core" }],
        types: ["ToolbarProps"],
        exports: ["Toolbar"],
      },
      {
        id: "search",
        name: "Search",
        sentence: "A text field that narrows the table to the rows containing what the user types (also called a quick filter or global filter). Put it in the toolbar, or anywhere on the page.",
        about: [
          "It searches the columns whose value is text, and it searches the value, not its presentation; `searchable` on a column adds or removes one. A search term goes back to page one and counts as a restriction – the toolbar shows the matches and “Reset” – but it is not listed as a condition, since the field already shows it.",
        ],
        alternatives: [{ when: "Restrict one column to some of its values or to a range", use: "filter" }],
        types: ["SearchProps"],
        exports: ["Search"],
      },
      {
        id: "columnmenu",
        name: "ColumnMenu",
        sentence: "A menu in which the user shows, hides, reorders and pins the table's columns and picks a grouping (also called a column chooser). Offer it where the table has more columns than everyone needs.",
        about: [
          "Every change applies to header, body and footer together. The row header cannot be hidden. A column moves only within its block – pinned at the start, unpinned, pinned at the end – and after a move the focus stays on the button that was pressed.",
          "Where the table can be grouped, the menu offers its groupable columns too, up to three levels ([Grouping](#/grouping)).",
        ],
        keys: [
          { key: "Enter / Space", action: "On “Columns”: open or close the menu. Inside: tick a column, move it or pin it." },
          { key: "Tab", action: "Move through the columns' boxes and buttons." },
          { key: "Escape", action: "Close the menu; the focus returns to “Columns”." },
        ],
        types: ["ColumnMenuProps"],
        exports: ["ColumnMenu"],
      },
      {
        id: "export",
        name: "Export",
        sentence: "A button that writes the rows the user sees into a CSV file for a spreadsheet (also called download or export to Excel). Hand the application the text instead where it wants the clipboard or a file of its own.",
        about: [
          "It writes the filtered set across all pages, in the visible columns, in the order and sorting on screen – and the values, not their presentation: numbers with a decimal comma, a point in time as a timestamp, an absent value as an empty field. Fields are separated by semicolons, and a byte order mark tells the spreadsheet it is UTF-8.",
          "A verdict column exports its value, not the verdict. In manual mode the table holds one page of the server's, so it exports that page, and the button says so. The same text is `t.asCsv()`, without a button.",
        ],
        limits: ["One format, CSV: no workbook, PDF or print layout."],
        types: ["ExportProps"],
        exports: ["Export"],
      },
      {
        id: "pagination",
        name: "Pagination",
        sentence: "The bar under the table that splits long results into pages, with the page size to choose (also called a pager). The table pages only where one stands; without it every filtered row is shown.",
        about: [
          "`pageSize` on the hook sets the rows per page, `pageSizes` the choices. A search, a filter, a new sort or a new page size go back to page one, and a page that no longer exists after a filter becomes the last one. A virtualised table does not page, and the bar is not drawn.",
        ],
        alternatives: [{ when: "Thousands of rows the user scrolls through without pages", use: "table" }],
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
        sentence: "A column that judges each value against limits – ok, warning, alarm or unknown – and shows by how much it is out (also called a threshold or status column). Use it wherever a number has a line it must not cross.",
        about: [
          "A missing value reads “unknown”: a fourth verdict, not a blank cell. Each verdict carries a shape and a word as well as a colour, and a value past a limit shows its excess beside it.",
          "It sorts by the verdict's weight – ok, unknown, warning, alarm – so values far out on either side meet at one end; `sortBy=\"value\"` sorts by the number. It exports the value, not the verdict. The limit set is the one @umriss-ui/core and @umriss-ui/charts read (ADR-0006).",
        ],
        alternatives: [
          { when: "A single reading in a tile or a bar", use: "`Meter` from @umriss-ui/core" },
          { when: "Alerts with a lifecycle that someone acknowledges", use: "alarmlist" },
        ],
        limits: [
          "No list filter: four verdicts are sorted, not filtered.",
          "It does not judge whether a value is stale; a stale value keeps its verdict (ADR-0010).",
        ],
        types: ["VerdictBase"],
        exports: ["useTable"],
      },
      {
        id: "alarmlist",
        name: "AlarmList",
        sentence: "The list of alerts someone has to see and acknowledge, worst first, with their state, age and frequency (also called an alarm or alert console). Reach for it wherever alerts arrive and a person answers for them.",
        about: [
          "The library receives alerts and raises none (ADR-0009). `alarmModel` turns them into a sorted view – priority, then acknowledgement, then time – and the list shows it; your application applies the transitions (`acknowledge`, `snooze`, `unsnooze`, `disable`, `enable`) to its own state. The lifecycle is one field with four values, active or resolved × acknowledged or not, so an alert that came and went unseen stays until someone acknowledges it.",
          "Availability is a second field: snoozed by a person, with an end and a name; suppressed by the application's logic; or disabled. A hidden alert keeps its lifecycle, stays in the list drawn neutral with its state as a word, and is counted; a snooze ends by the model's clock, with no timer. A flood is marked, never thinned out.",
          "The live region announces one number, the active unacknowledged alerts, not each arrival. The terms follow ISA-18.2; `docs/standards.md` maps each to its name here.",
        ],
        alternatives: [{ when: "Measured values against limits, without a lifecycle", use: "verdictcolumn" }],
        keys: [
          { key: "Tab", action: "Move through the row boxes, “Acknowledge” and the hidden-alerts switch." },
          { key: "Space", action: "On a box: tick or untick the alert. On the switch: show only the hidden alerts, or all." },
          { key: "Enter", action: "On “Acknowledge”: hand the ticked alerts to `onAcknowledge`." },
        ],
        limits: [
          "It raises no alerts: limits, delays and dead bands belong to the application (ADR-0009).",
          "It never removes an alert to thin out a flood; deciding that a person should not see one stays with the application.",
          "No latched alerts, and no alarm-system figures beyond the frequency per type.",
          "The columns do not sort and the list does not page: the model sets the order.",
        ],
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
