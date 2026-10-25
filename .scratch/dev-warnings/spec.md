# The silent traps say what they are, in development

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket "DEV warnings for the silent traps" (its Answer
holds every decision below); findings `.scratch/shakedown/wishes.md` section 2, `audit-family.md` 3, 4 and
10, `composed-app.md` 1 and 8, `data-science.md` 5, `reports-bi.md` 2, `table.md` 2 and 7, `charts.md` 5,
`operator-screens.md` 4, `kiosk.md` 3, `upgrade.md` 1.

## Problem Statement

Six personas lost time to something umriss did silently. Each time, the console stayed clean, the types
passed, and the screen was wrong.

- **Rows in the wrong shape.** An object of columns, an Arrow `Table` or a `Float64Array` gives a chart
  "No data" and makes a table throw `e.filter is not a function`. `data={undefined}` while the rows load
  makes a chart throw `reading 'length'`.
- **A stale accessor.** Inline accessors are compared by their source text, so an accessor that reads
  changed outer state keeps showing the old values. Three personas hit this independently. The
  documentation says to give the function "a new text", which is no way to write code.
- **A seventh series** takes the first series' colour, and with `encoding="marks"` its dash and marker too.
- **A missing `Pagination`.** With `pageSize` but no pagination bar, the table renders all 2,016 rows. A
  `Pagination` outside the table without `of` renders nothing.
- **A virtual table that renders every row.** In a parent without a definite height, and without
  `maxHeight`, the scroll area grows with the rows. 20,000 rows become 20,002 `tr`, and 100,000 crash the
  tab.
- **A Calculation without a name.** The Chart warns about a missing name; the Calculation does not.
- **A format that does not fit.** An ISO string or epoch milliseconds in a column with a date format
  (behind an `as any`) prints raw.
- **Things no warning can catch.** Numbers given as strings sort as text. An epoch number in a column with
  no format prints as a number. Below the browser floor the page is unstyled.

## Solution

A trap gets a DEV warning where the package sees it as it happens, without guessing about the caller's
data. Everything else gets a sentence in the documents.

- **Rows.** The table and the chart read rows that are not an array as no rows. DEV names what arrived.
  `undefined` and `null` read as no rows without a warning.
- **The stale accessor.** The comparison by source text stays. DEV probes an accessor that has the same
  text as the held one: it calls both on the first rows. If the results differ, DEV warns, naming the
  column or series and the two ways out: carry the value in the rows, or give the part a `key` that
  changes with it. The documentation names the same two ways out.
- **The palette.** A series without a `color` or `tone` beyond the sixth palette place warns.
- **Paging.** A row-less part with no table warns, and so does a `pageSize` with no pagination bar.
- **Virtual.** A virtual table whose window holds every row, in a scroll area taller than the viewport,
  warns.
- **Calculation.** A Calculation with neither `aria-label` nor `aria-labelledby` warns.
- **Format.** A date format on a column that holds no points in time warns, and so does a number format on
  a column that holds no numbers.
- **Documented.** Numbers as strings, and a point in time as a `Date`, in the table's column
  documentation. A one-line check for the browser floor in core's README.
- Each package keeps its own small DEV helper. There is no shared one.

## User Stories

1. As a data scientist passing a pandas frame as JSON, I want a warning that names the shape I passed and
   the conversion, so that I don't stare at "No data".
2. As an application developer whose backend answers with an object instead of an array, I want the table
   to show its empty state and warn, so that a wrong answer does not crash the screen.
3. As an application developer loading rows, I want `data={undefined}` to draw an empty chart, so that I
   don't need a guard while the rows arrive.
4. As an application developer whose column reads a rate from state, I want a warning when the rate changes
   and the column keeps its old numbers, so that I find the cause in minutes, not hours.
5. As that developer, I want the warning and the documentation to name a way out I would write anyway (the
   value in the rows, or a `key`), so that I don't have to rename a function.
6. As an application developer upgrading from before table 0.35, I want the stale column to say so in the
   console, so that the change of comparison does not pass silently.
7. As a developer of a large table, I want the accessor comparison to stay as fast as it is, so that a
   re-render at 200,000 rows stays in milliseconds.
8. As a chart author with a seventh series, I want a warning that it repeats the first series' colour, so
   that I give it a colour or split the chart before a reader confuses them.
9. As a report developer, I want a warning when I set `pageSize` and no pagination bar stands, so that I
   don't print a 53-page PDF.
10. As a report developer, I want a warning when a `Pagination` stands outside the table without `of`, so
    that I know why it renders nothing.
11. As an application developer with a virtual table in a flexible layout, I want a warning when every row
    is rendered, so that I bound the scroll area before the tab crashes in production.
12. As an accessibility-minded developer, I want a Calculation without a name to warn as a Chart does, so
    that every umriss view I place asks for its name the same way.
13. As an application developer with ISO strings in a date column, I want a warning that the column holds
    no `Date`s, so that I convert in the rows instead of reaching for `as any`.
14. As an application developer with numeric strings from a backend, I want the column documentation to say
    that a string sorts as text and how to sort it as a number, so that I don't file a bug.
15. As a kiosk developer, I want core's README to give the one-line check for the browser floor, so that my
    application can tell its users in production, where a DEV warning never shows.
16. As an application developer, I want every warning once per cause and prefixed with its package, so
    that the console stays readable while a table renders every second.
17. As an application developer, I want production to stay silent and behave exactly as development does,
    so that nothing works in development and breaks in production.

## Implementation Decisions

- **The DEV helper.**
  - Each package keeps its own `dev.ts`, with the DEV flag by core's rule (`process.env.NODE_ENV` written
    literally), a `warnOnce` per key, and the prefix `@umriss-ui/<package>:`.
  - Calculation gets one with its first warning.
  - There is no shared export. Charts depends on nothing, and a public helper in core would be API kept
    under the upgrade promise for ten lines.
- **Rows that are not an array.**
  - `useTable` and `useChart`, and a chart series' or `ControlChart`'s own `data`, treat a value that is
    not an array as an empty array.
  - For anything but `undefined` and `null`, DEV warns once per place. The warning names what arrived: the
    typed array's name, or an object with its first three keys. It says that umriss reads one object per
    row, and that `Array.from` makes rows of an Arrow table or a typed array.
  - The types keep asking for an array. Column-oriented input is not offered.
- **The accessor probe.**
  - It runs where an accessor is held because its text is equal: the table registry's hold of a column's
    `value`, `sortValue` and `groupValue`, and the hook's hold of `rowKey`. In charts, it runs in the
    series comparison of `value` and the further channels (baseline, box channels), and in the control
    chart's accessor.
  - Only in DEV, when the held and the new function differ in identity but not in text, it calls both on
    at most the first 1,000 rows of the rows that part reads.
  - Results are equal by `Object.is` for primitives and by time for Dates. Any other result is not
    compared.
  - On the first difference, DEV warns once per column id or series name. Nothing else changes, in DEV or in
    production: the held function stays.
  - The warning names the column or series, says that the function reads a value from outside its row
    that changed, and gives the two ways out: carry the value in the rows, or give the column or series a
    `key` that changes with the value.
  - `tickFormat` and the tooltip's `render` are not probed. Their documented limit stays.
- **A `key` as the way out.** A column registers under its instance's `useId`, so a new `key` registers it
  afresh with the new accessor, and its sort and width, held by its id, stay. A test holds this. The
  table's column page and the charts' series page replace "give the function a new text" with the two ways
  out. `llms-full.md` follows from the demo.
- **The palette.** Where a series is given its palette place, DEV warns once per series when the place is
  the seventh or later, and the series has no `color` and no `tone`. The warning names the series whose
  colour (and marks) it repeats, and says to give it a `color` or to split the chart. State bands and
  matrices take no place.
- **Paging.**
  - The connection that every row-less part (`Toolbar`, `Search`, `ColumnMenu`, `Export`, `Pagination`)
    goes through warns once per part kind when there is neither a surrounding table nor `of`.
  - The table warns once when the caller passed `pageSize`, the table is neither virtual, nor in server
    mode, nor a tree, and no pagination bar has registered once the first frame has passed. Registering
    late is already documented for a bar placed after the table. The default page size never warns.
- **Virtual.** Beside the table's other measuring DEV checks, after layout: when `virtual` is set, the
  rendered window holds every row, and the scroll area is taller than the viewport, DEV warns once. The
  warning names `maxHeight` and a parent of definite height. This builds on
  `.scratch/views-in-their-frame/` (01), which bounds a table in a parent of definite height.
- **Calculation's name.** The Calculation warns once when neither `aria-label` nor `aria-labelledby` is in
  the attributes it passes on.
- **A format that does not fit.** Where the table reads a column's kind off its first value present: a date
  format (`"date"`, `"time"`, `"dateTime"`) on a kind other than a point in time warns once per column, and
  so does a number format on a kind other than a number. An empty column does not warn. The check reads only
  the format's kind, so the Intl options of `.scratch/number-formats/` need nothing here.
- **The documented sentences.**
  - The table's column documentation says that a value sorts by its kind and a string sorts as text, so
    numbers given as strings are converted in the rows or given `sortValue={Number}`.
  - It also says that a point in time is a `Date` in the row, and that an epoch number or an ISO string is
    converted there.
  - Core's README, beside the browser floor, gives the line an application uses to check the floor itself:
    `CSS.supports("color", "light-dark(red, red)")`.
- **No ADR.** None of this is costly to reverse.

## Testing Decisions

- A good test renders through the public hook, as an application does, spies on `console.warn`, and
  asserts that the warning appears once, names the column, series or shape, and does not appear in the
  case that is right. Where behaviour is part of the decision (no rows instead of a throw, a `key` that
  refreshes a column), it asserts on what the user sees: the empty state, the cell text.
- Warnings are once per key for the whole module, so each test uses its own column id or series name.
- Seams, all existing:
  - the table's unit tests in jsdom (`columns.test.tsx` already spies on a warning);
  - for the measuring check, `rowPitch.test.tsx`'s way of stubbing `scrollHeight` and `clientHeight`;
  - the charts' unit tests (`scene.test.ts`, `categories.jsdom.test.tsx`);
  - calculation's `calculation.test.tsx`.
- The probe's tests prove both directions. A closure over a changed value warns. An inline accessor
  re-rendered with an unchanged closure stays silent, as do a native function and a field name.
- No visual tests: nothing visible changes but the table's empty state for rows that are not an array.

## Out of Scope

- Changing the accessor comparison (identity, a `deps` prop), or probing in production.
- Column-oriented input, Arrow tables or typed arrays as rows.
- Natural collation of strings, and any heuristic for numeric strings.
- A DEV warning for a browser below the floor.
- A shared warning helper or a public `warnOnce`.
- The Dashboard's repeated widget label: the Dashboard's landmark names, a defect.
- Warnings for a changed `initialView` after mount and for removed tokens: the upgrade promise
  (`.scratch/upgrade-promise/`).
- BigInt cells, pandas' rounding, and the misleading type error for a date format on a string field.
- Probing `tickFormat` and the tooltip's `render`.

## Further Notes

- `.scratch/table-columns-from-the-data/` (01) changes the same hold: an accessor is held only while its
  column keeps its id. The table's probe builds on that.
- `.scratch/root-contract/` renames the Chart's `ariaLabel` to `aria-label`. The Calculation's warning
  reads `aria-label` and `aria-labelledby`, which matches either side of that rename.
