# Shakedown: findings across the packages (0.40.4)

Status: needs-triage

What a consumer's build, server and type toolchain does to charts, table, schedule, calculation and
dashboard together. Vite 8.3.5, Next 16.4.3 (Turbopack), TS 7.0.2, Node 22, 2026-10-24. Core's own findings
are in `core.md`.

## Findings

2. **[Break] table, chart, schedule and dashboard cannot be used from a Server Component.** Each is reached
   only through a hook (`useTable`, `useChart`, `useSchedule`, `useDashboard`): "Attempted to call useChart()
   from the server". A read-only report page needs a hand-written `"use client"` wrapper (about 35 lines for
   all of them).
3. **[Break] A `<Calculation>` tree cannot be written in a Server Component:** it reads its children by
   element type, and there they are client references. `next build` fails with "<anonymous> is not an
   element of the calculation". Idea: match by a marker, or accept a plain data tree.
4. **[Break] Functions cannot cross the server/client boundary**, so a server page cannot configure a
   table through its own props: `rowKey` (required, a function), column accessors, `WidgetType` render
   props, formatters. Rows with Dates, chart rows, schedule tasks and a dashboard view cross fine. Idea:
   `rowKey="number"` as a field name; widget types declared by data.
5. **[Break] Hydration error #418 when the reader's time zone differs from the server's** - table (any Date
   column) and schedule (its summary sentence): server `17/03/2026, 13:00` (Berlin), client `08:00`
   (New York). Round 1 saw no warning because server and browser shared a zone. Hits every UTC server.
   ADR-0060 says "umriss shows the reader's time"; the SSR consequence is not mentioned.
6. **[Misfit] Server HTML says something false:** the schedule's summary reads "0 lanes, 0 subtasks in view
   from 01/01 01:00 to 01/01 01:00" although a view was given; a server chart's `aria-describedby` points
   at an empty element.
7. **[Misfit] npm refuses a core one patch behind:** core 0.40.3 beside the 0.40.4 packages gives
   `ERESOLVE … peer @umriss-ui/core@"^0.40.4"`. With `--legacy-peer-deps` everything works. Idea: peer
   `^0.40.0`, or always release in step (documented nowhere).

### Packages together

15. ✓ **[Break] The DEV warnings of charts and table never fire in a Vite app.** `detectDev()`
    (`charts/src/dev.ts:13`, same in `table/src/dev.ts`) reads `import.meta` through a variable; Vite
    replaces only the literal `import.meta.env.DEV`, and `process` does not exist in the browser, so DEV is
    false. Every documented "warns in DEV" (a chart without `ariaLabel`, …) is silent for the most common
    dev server. Red: a chart without `ariaLabel` logs nothing; with `define: { process: … }` it warns.
    Idea: write `import.meta.env?.DEV` literally.
16. ✓ **[Break] A Calculation inside a dashboard widget is laid out wrongly:** labels, figures and units
    pile into the first column, operators land at the far right. The dashboard sets unprefixed custom
    properties on each widget (`dashboard/src/Dashboard.tsx:40`: `--column`, `--row`, `--columns`,
    `--rows`), the calculation reads `grid-column: var(--column, 4)` (`calculation/src/Calculation.module.css:334`,
    `:353`, `:506`) and inherits the widget's 1. Idea: prefix every package's custom properties
    (`--ud-column`, `--uc-column`) and add a guard that no two packages share an unprefixed name.

### Consumer tests and types (Vitest 5 jsdom/happy-dom, Jest 30 + babel-jest, TS 5.0–7.0)

8. ✓ **[Break] Jest cannot load charts or table, so not schedule or dashboard either**, and the error is
   misleading ("Must use import to load ES Module"). Cause: `import.meta` in `charts/src/dev.ts:13` and
   `table/src/dev.ts:14` (the dev flag); core, calculation and dashboard's own file have none. Core's Jest
   recipe is not enough; a 10-line Babel plugin replacing `import.meta` fixes it. Idea: read
   `process.env.NODE_ENV` only, or ship a CJS/`default` condition; document the recipe.
9. ✓ **[Break] `<Table>` crashes under happy-dom:** `tHead?.rows[0]` (`table/src/scrollArea.tsx:47`, `:80`,
   `frameEffects.ts:102`) stops one step too early; happy-dom has `tHead` without `rows`. `tHead?.rows?.[0]`.
10. **[Misfit] Charts do nothing in jsdom without a size and canvas mock, and nothing says so:** "Show data"
    opens no table, the description is empty, a legend click changes nothing, jsdom logs "getContext() not
    implemented" per mount. With a ResizeObserver mock reporting 600×280 and a stubbed `getContext` it all
    works (data table with 31 rows, legend toggles). Charts also update state asynchronously after mount
    and a legend click: "not wrapped in act(...)" warnings.
11. **[Misfit] Generic wrappers cannot name fields:** `Column value`, `Line value`, `XAxis value` are
    `Extract<keyof Z, string>`, deferred when `Z` is generic, so a `DataTable<Z>` wrapper must use the
    function form. Documented for table (`llms-full.md:2824`), not for charts.
12. **[Misfit] The d.ts needs TS 5.4+** (`NoInfer` in charts, table, dashboard), stated nowhere; TS 5.0 gives
    about 21 errors. Schedule and calculation are clean.
13. **[Misfit] Charts' `wording/de` does not resolve under `node10`** (core B11 again; no `typesVersions`).
14. **[Leak, minor] Charts leave one `document` listener after 60 mount cycles** - constant, not growing.

## Weight (Vite, chrome123, gzipped)

| Import | JS | CSS |
|---|---|---|
| charts | 38.1 kB | 3.1 kB (no core) |
| table | 56.8 kB | 27.2 kB |
| schedule | 31.7 kB | 25.1 kB |
| dashboard | 19.9 kB | 22.5 kB |
| calculation (`Given` only) | 0.8 kB | 3.1 kB |
| core `Button` | 8.9 kB (with React) | 21.5 kB |
| one from each | 122.0 kB | 34.0 kB |

Table, schedule and dashboard pull core's whole stylesheet, as declared; table does not pull charts.

## Wishes

- **A server-renderable, read-only table, chart, schedule and calculation.** Task: a report page in an App
  Router app without a hand-made client island. Workaround: about 35 lines of wrappers plus a client bundle
  for a report. Elsewhere: TanStack Table (headless, runs in RSC), Highcharts/ECharts SSR, MUI `Table`.
  Unlisted: no ADR or capability record mentions Server Components.
- **An official testing aid:** documented or exported jsdom/happy-dom polyfills, a sized ResizeObserver for
  charts, the Jest recipe. Workaround: about 25 lines (`setup-size.js`, `babel.config.cjs`). Elsewhere: MUI X
  Charts and Recharts document ResizeObserver mocks. Unlisted.

## Held up

`renderToString` in plain Node renders all five without a throw · no package touches `window`, `document`,
`canvas`, `ResizeObserver` or `HTMLDialogElement` during server render · `next build` passes with the
client-wrapper page; no console output at 1000 and 375 px · TS 7 with `skipLibCheck:false` clean apart from
core's · table dates use the library's wording, not the browser locale · version skew causes no runtime error · `useTable` row typing rejects typos, nested paths and union-only
fields, accepts optional, nullable and `as const` rows · a wrapper library re-exporting every hook and
component of all five emits `.d.ts` without TS4058 · dashboard type-checks with only core installed · in
jsdom without polyfills table and calculation render, charts and schedule need only a ResizeObserver stub,
dashboard that plus `matchMedia` · a test finds the table by role and name, sorts via the header button
(`aria-sort`), filters by typing into the searchbox · 60 render/cleanup cycles per package leave nothing behind.
