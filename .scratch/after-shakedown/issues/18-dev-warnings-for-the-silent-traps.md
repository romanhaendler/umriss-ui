# DEV warnings for the silent traps

Type:   grilling
Status: resolved

## Question

Which silent traps get a DEV warning, and which a sentence in the documents instead?

Six personas fell into one (`.scratch/shakedown/wishes.md` section 2, `cross-package.md` 15 - the Vite fix is
delivered): a wrong data shape; inline accessors that close over state and go stale because they are compared
by source text (`audit-family.md` 3, `composed-app.md` 1); a seventh chart series repeating the first colour
(`audit-family.md` 4); a missing `Pagination`; a browser below the floor; a Calculation without `aria-label`
(`audit-family.md` 10); numbers given as strings sorting as text (`table.md` 7); an epoch number in a
column (`operator-screens.md` 4).

- For each: warn, document, or change the behaviour (for the stale accessor: is a warning possible at all,
  or does the source-text comparison change)?
- One warning helper shared by the packages, or each its own as today?

## Answer

Decided 2026-10-25 by the agent, on the maintainer's delegation. Three points are product calls and are
marked for review. Ticket 17 handed over two further traps, and they are decided here as well. The rule
behind every line: a trap gets a DEV warning where the package can see it at the moment it happens, without
guessing about the caller's data. Where it cannot see it, or where the
developer's DEV build never meets it, the trap gets a sentence in the documents.

- **Which traps warn** *(agent, product - for review)*. Seven of the ten get a DEV warning: a wrong data
  shape, the stale accessor, the seventh series, a missing `Pagination`, a Calculation without a name, a
  format that does not fit, and an unbounded virtual table (handed over by ticket 17). A chart's
  `data={undefined}` (also from ticket 17) changes behaviour instead: it reads as no rows. Two are documented: numbers given as strings, and a browser below the floor. A bare
  epoch number in a column without a format is documented as well.

- **A wrong data shape warns, and the table stops crashing on it** *(agent)*. When `useTable` or `useChart`
  receives `rows` that are not an array, the package reads them as no rows. This covers an object of
  columns, a pandas `orient` other than `records`, an Arrow `Table` and a `Float64Array`.
  - The table then shows its empty state, as the chart already shows "No data". Today the table throws
    `e.filter is not a function`.
  - DEV warns once and names what arrived: a typed array, or an object with its first keys. The warning
    says that umriss reads one object per row, and that `Array.from` turns an Arrow table or a typed array
    into rows.
  - The same holds wherever rows enter: a series' or a `ControlChart`'s own `data` as well.
  - **`undefined` and `null` read as no rows, without a warning** (`charts.md` 5). `data={undefined}` while
    the rows load is ordinary; today it throws `reading 'length'`. The types still ask for an array.
  - **Column-oriented input is not taken** *(agent, product - for review)*. Rows of objects stay the one
    shape in both packages (ADR-0048). A second input shape would double every accessor path, and the
    warning names the one-line conversion.

- **The stale accessor: the comparison stays, and DEV probes it** *(agent, product - for review: umriss keeps
  the limit and offers no `deps` prop)*.
  - **The comparison stays by source text.** Identity would bring back the figures that the comparison
    removed: a re-render at 200,000 grouped rows went from 420.9 ms to 22.0 ms
    (`packages/table/docs/capabilities.md`). A `deps` prop on every accessor-taking part of two packages
    would add API for what React's `key` already does.
  - **The probe.** A closure's captured values cannot be read, but their effect can. When an accessor has
    the same text as the held one and is a new function, DEV calls both on the rows and compares the
    results. It probes at most the first 1,000 rows. Primitives are compared by `Object.is`, Dates by their
    time, and other results are not compared. If any result differs, DEV warns once per column or series:
    the function reads a value from outside its row that has changed, and the old results stay. The
    warning names the two ways out:
    - carry the value in the rows;
    - give the part a `key` that changes with the value.
  - **Where it runs.** The probe covers what reads a row: in the table, a column's `value`, `sortValue` and
    `groupValue`, and the `rowKey`; in charts, a series' `value`, its further channels (baseline, a box's),
    and the control chart's accessor.
  - **Behaviour stays the same.** Production does not probe, and DEV changes nothing either: an app that
    took the new function in DEV only would work in development and break in production.
  - **A `key` is the documented way out.** A column instance's registry entry is keyed by its `useId`, so a
    changed `key` registers the column afresh, with the new accessor. Its sort and width stay, since they
    hold by the column's id. The table's and the charts' column and series documentation say so, in place
    of "give the function a new text".
  - `tickFormat` and the tooltip's `render` keep their documented limit. A tick label is not a row, and a
    `render` returns elements that cannot be compared.
  - Ticket 13's fix (an accessor is held only while the column keeps its id) comes first. The probe sits on
    the same hold.

- **A seventh series warns** *(agent)*. A series that takes a palette place beyond the sixth repeats that
  place's colour, and with `encoding="marks"` its dash and marker too, since the marks cycle with the six
  colours. DEV warns once when such a series has no `color` and no `tone`. The warning names the series it
  repeats and says to give it a `color`, or to split the chart. A state band and a matrix take no palette
  place and are not counted.

- **A missing `Pagination` warns, in two places** *(agent)*.
  - **An unbound part with no table.** A `Toolbar`, `Search`, `ColumnMenu`, `Export` or `Pagination` that
    stands outside any table and has no `of` renders nothing today. DEV warns once per part kind. The check
    sits in the one place every unbound part goes through, the connection.
  - **A page size with no bar.** The caller gives `pageSize` to `useTable`, but no pagination bar has
    registered after the first frame, the table is not `virtual`, and it has no tree rows. DEV warns once
    that every row is shown, and that `pageSize` holds as soon as a `Pagination` stands. The default page
    size alone does not warn: a table without paging is ordinary.

- **A virtual table that renders every row warns** *(agent)*. After `.scratch/views-in-their-frame/` (01),
  a parent of definite height bounds the table by itself. What still escapes is a virtual table in a parent
  without a definite height and without `maxHeight`: its scroll area grows with its rows, and the window
  holds every row (`table.md` 2).
  - After the first layout, DEV measures the scroll area once. If `virtual` is set, the window holds every
    row, and the scroll area is taller than the viewport, DEV warns once. The warning says that `virtual`
    needs a bounded scroll area: `maxHeight`, or a parent of definite height.
  - The check sits beside the table's other measuring DEV checks, after layout.

- **A Calculation without a name warns** *(agent)*. When neither `aria-label` nor `aria-labelledby` reaches
  the Calculation, DEV warns once, as the Chart does. Calculation gets its own `dev.ts`.

- **A format that does not fit the column's values warns; a bare epoch number is documented** *(agent)*.
  - A column's kind is read off its first value present. A date format (`"date"`, `"time"`, `"dateTime"`)
    on a column whose kind is not a point in time warns once, naming the column. So does a number format
    on a column whose kind is not a number. The warning says that a point in time is a `Date` in the row.
    This catches an ISO string or epoch milliseconds behind an `as any` (`composed-app.md` 8).
  - A column with no format that shows an epoch number shows a number, correctly: nothing can tell it is
    a time. The column documentation says that a point in time is a `Date`, and converts an epoch or an
    ISO string in the rows.
  - Unknown keys in a format object become a type error with `.scratch/number-formats/` (03). That spec
    widens the number format to Intl's options, so `{ style: "percent" }` (`reports-bi.md` 8) becomes valid
    there and is not warned here.

- **Numbers given as strings are documented** *(agent)*. A string is text, and it sorts as text, by the
  kind the caller's own row type gives it.
  - Natural collation (`Intl.Collator` with `numeric: true`) is not taken. It still misorders decimals
    and negatives ("1.5" after "1.10", "-3").
  - A heuristic warning is not taken either. An id or a postcode is a numeric string that is meant as
    text, so it would misfire.
  - The column documentation says: convert in the rows, or give `sortValue={Number}`.

- **A browser below the floor is documented, without a warning** *(agent)*. The DEV flag is off in the
  production build, which is where an old kiosk browser meets the app. Core has no mount point every app
  passes through either: the provider is optional. Core's README already states the floor. It gains one
  line: an application that must tell its users checks `CSS.supports("color", "light-dark(red, red)")`
  itself.

- **No shared warning helper** *(agent)*.
  - Each package keeps its own small `dev.ts`: the DEV flag by core's rule (`process.env.NODE_ENV`, ticket
    02), a `warnOnce` per key, and the prefix `@umriss-ui/<package>:`.
  - Charts depends on nothing (`CLAUDE.md`), so it could not import a shared helper. In core, the helper
    would be a public export kept under the upgrade promise, all for ten lines.
  - Calculation gets its copy with its first warning.

- **Out.**
  - The repeated widget label on the Dashboard (`audit-family.md`, wishes). It belongs with the
    Dashboard's landmark names, a defect.
  - `maxHeight="100%"` in a widget (`composed-app.md` 2): ticket 17 bounds the table there, so the trap is
    gone.
  - A warning for a changed `initialView` after mount and for removed tokens (`upgrade.md`): the upgrade
    promise, ticket 19.
  - BigInt cells and pandas' own rounding (`data-science.md` 5 and 6).
  - A misleading type error for a date format on a string field.
- **Not costly to reverse.** These are DEV warnings, a table and a chart that read a non-array as no rows,
  and sentences in the documents. No ADR.
- **Touches:** `@umriss-ui/table` (the hook's rows, the connection, the registry's hold, the format check
  and the virtual window), `@umriss-ui/charts` (the rows, the hold's comparison, the palette), `@umriss-ui/calculation`
  (a `dev.ts` and its first warning), and core's README (one line). The table's and the charts' demo pages
  get the column and series sentences.
- **Becomes the spec** `.scratch/dev-warnings/`.
