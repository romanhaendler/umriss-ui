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
    sentence: "The parts that touch no row: placed in the table they read it, outside they take `of`.",
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
