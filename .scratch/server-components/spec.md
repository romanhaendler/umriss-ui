# A Server Component hands umriss its data, and writes a calculation itself

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket "What umriss promises a Server Component" (its
Answer holds every decision below); facts in `docs/research/after-shakedown/server-components.md` on the
local branch `research/server-components`; findings `.scratch/shakedown/cross-package.md` 2-6, the wish
"Server-renderable read-only views" (`wishes.md`), the open point in `.scratch/open-points-roadmap/next.md`
("Loose ends"); ADR-0017, ADR-0021, ADR-0027, ADR-0048, ADR-0060, ADR-0062.

## Problem Statement

An App Router application writes its report page as a Server Component, and umriss fails it in four ways.

- **The views can't be called there.** Table, chart, schedule and dashboard are declared through a hook,
  and every export of a package is a client reference on the server: "Attempted to call useChart() from the
  server". Nothing in the READMEs says where the declaration belongs, so each application finds out at its
  first build.
- **A calculation can't be written there at all.** `<Calculation>` reads its children by element type. A
  tree written in a Server Component reaches it with lazy wrappers as types, and `next build` fails with
  "<anonymous> is not an element of the calculation", a message that blames the wrong thing.
- **Dates break hydration.** A table's date column and the schedule's summary format instants in the
  runtime's zone. A server in UTC and a reader in New York produce two texts, and React throws #418. This
  happens on every UTC server whose readers live elsewhere.
- **The server's HTML says something false.** The schedule's summary reads "0 lanes, 0 subtasks in view
  from 01/01 01:00 to 01/01 01:00" although a view was given.

## Solution

umriss promises: **a Server Component hands umriss its data; every view is a Client Component that renders
on the server and hydrates; a calculation can be written in a Server Component itself.**

- **The hook-declared views are declared in a Client Component file.** The server page fetches the rows and
  passes them. `rowKey`, the columns, the series and the widget types stay in that file, so no function
  crosses the boundary. There is no second, serialisable declaration: the hook-first shape stays. Every
  README says this for its own package, and core's README shows the one example.
- **The calculation reads its tree where the tree is written.** `<Calculation>` and its elements no longer
  carry `"use client"`. On the server or in the browser, `<Calculation>` reads its children, builds its
  model, and hands that model to a client view. The package ships two files: an entry without the
  directive, and a client file with the directive and the stylesheet import.
- **The server's HTML claims nothing it cannot know.**
  - An instant's text is written once the page has hydrated, in the reader's zone; before, it is empty.
  - The schedule's summary is left out until the schedule has its lanes.
  - A chart and a schedule give their labelled, empty frame on a server, as the schedule's README already
    says.

## User Stories

1. As an application developer on the App Router, I want a README to tell me where a table's declaration
   belongs, so that my report page builds the first time.
2. As an application developer, I want to pass rows with Dates from my server page to a table, chart,
   schedule or dashboard, so that the data is fetched where it lives.
3. As an application developer, I want `rowKey`, columns and formatters to stay in one client file next to
   the table, so that no function has to cross the boundary.
4. As an application developer, I want the field names in that client file to be checked against my row
   type, so that the server split costs me no typing.
5. As an application developer using only charts, I want charts' own README to say how a chart meets a
   Server Component, so that I need not read core's.
6. As a report author, I want to write a `<Calculation>` tree directly in a Server Component, with numbers
   from my server's data, so that a costing sheet needs no client file.
7. As a report author, I want that calculation to fold, couple on hover and follow the density and the
   language like any other, so that writing it on the server costs the reader nothing.
8. As a report author, I want a calculation written in a client file to keep working unchanged, so that
   the change breaks nothing I have.
9. As an application developer, I want a calculation's tree that I pass through a client component of my
   own to fail with a message naming the cause, so that I am not left with an empty line.
10. As a reader in New York of a server in UTC, I want a page with a table of dates to hydrate without an
    error, so that the page is not rendered twice.
11. As that reader, I want every date and time in my own zone, so that the server's zone never shows.
12. As a developer of a client-only app or a test, I want dates to appear in the first render as before,
    so that the server's rule costs me nothing.
13. As a screen-reader user of a server-rendered schedule, I want no summary before the schedule knows its
    lanes, so that I never hear "0 lanes" about a full plan.
14. As the maintainer, I want an ADR to record that the hook-declared views get no serialisable second
    API, so that the question is not argued again.
15. As the maintainer, I want `check:dist` to fail if the calculation's entry gains the directive, or if
    its client file loses it, so that the promise can't break in a build.
16. As the maintainer, I want a check that renders a calculation written in a Server Component through
    React's own Flight renderer, so that the promise is proved, not assumed.
17. As the maintainer, I want a test that the server's markup of each date-showing part holds no instant,
    so that #418 can't come back through a new part.

## Implementation Decisions

- **The ADR.** One new ADR records the promise:
  - every view is a Client Component that a Server Component hands data;
  - the hook-declared views get no serialisable second API;
  - a calculation is written where the page is written.

  It takes back "`"use client"` heads every built entry" (roadmap X2, "Taken as agreed" 6) for the
  calculation's entry. ADR-0060 gets an amendment for instants on a server. The ADR's text stands in
  ticket 01; its number is the coordinator's.
- **The calculation, reader and view.**
  - `<Calculation>` becomes a reader without hooks. It builds the model from its children and its
    `metrics`, and renders a client view with that model and every other prop it was given.
  - The view is today's component without the reading: evaluation, the folding state, the measuring, the
    density, the formats and the wording.
  - The model holds only what React serialises: labels, numbers, Dates, plain objects, a Map, JSX
    (`aside`). It holds no function.
  - The arithmetic stays with the view, because it calls core's `assess`, a client reference on the server.
- **The calculation's elements.** They still render nothing inside a calculation. Rendered on their own,
  each throws the calculation's development error. That happens when a tree written on the server is
  passed through a client component, which renders it to nothing, or when an element stands outside any
  calculation. The message says to write the tree directly inside `<Calculation>`, in one file.
- **The calculation's build.** Two files: the entry, without the directive, which imports the client file;
  and the client file, with `"use client"`, then its stylesheet import, then the view. `check-dist` learns
  which entry of a package is meant to be server-safe. For that entry it asserts the opposite head, and
  for the client file it asserts the directive followed by the stylesheet import. Every other package and
  entry keeps today's rule.
- **Instants after hydration.** Core's `useFormats()` returns, until the page has hydrated, formats whose
  instant members write an empty string: `date`, `dateShort`, `month`, `dateLong`, `time`, `dateTime` and
  `offset`. The numbers, the counts, the per cent, the collation and `relative` are unchanged.
  - "Hydrated" is read through `useSyncExternalStore`: a server snapshot of false and a client snapshot of
    true, so a `createRoot` render sees true from the first render and a hydration renders once more
    right after.
  - The two format sets are built once, not per render.
  - Every part that writes an instant during render takes it from `useFormats()`. A part found formatting
    an instant some other way during render is moved onto it.
- **The schedule's summary on a server.** While the schedule's snapshot is the server snapshot, the
  description holds no summary sentence; the key help may stay. Once lanes have registered, the summary is
  as today. The chart's empty description is unchanged.
- **The READMEs.**
  - Each package's paragraph on `"use client"` says what holds for that package: a hook-declared view is
    declared in a Client Component and takes its data from the server; a calculation is written anywhere;
    instants appear after hydration.
  - Core's README gets a "Server Components" section with one example: a server page and the client file
    that declares a table.
  - Charts' paragraph stands on its own, because a charts-only application installs no core.

## Testing Decisions

- A good test here renders through the public entry and asserts on what a reader gets: markup text, roles
  and names, and the absence of a recoverable hydration error. It never asserts on class names or module
  state.
- **Existing seam: the server tests.** Table, schedule and calculation each have an `ssr.test.tsx`, and
  core renders to a string in its field-width and toast tests. They render with `renderToString` in the
  node environment, and the instants' rule is tested there.
  - Server markup of a table with a date column and of a schedule holds no formatted instant.
  - Server markup of core's pickers with a value holds none either: `DatePicker`, `DateRangePicker`,
    `DateTimePicker` and `DateTimeRangePicker`.
  - Hydrating that markup in jsdom raises no recoverable error, and the instant is then shown.
  - The schedule's existing test that expects "0 lanes, 0 subtasks" turns into the opposite.
- **Existing seam: `check-dist`'s scratch consumer, which every `check:dist` runs after the build.** The
  Flight check goes there for the calculation. A server module writes a tree, React's Flight server
  renders it with client references resolved from the packed package's client file, React's Flight client
  decodes the payload, and `renderToString` turns it into HTML. The HTML must hold the rows and amounts.
  React's own Node route for this is `react-server-dom-webpack`, at the React version the workspace
  resolves. If that route can't be made to run against the packed package within the ticket, the check is
  a minimal App Router fixture built with `next build` instead. The ticket records which, under Comments.
- Prior art: the `ssr.test.tsx` files of every package; the strict consumer compile and the runner step
  (`.scratch/test-runners/`) in `check-dist`.

## Out of Scope

- `rowKey` as a field name, columns or series as data, and widget types declared by data. Under this
  promise nothing needs to cross; any of them as a convenience is a wish for its package's triage.
- Pure helpers callable from a Server Component (`assess`, `pareto`, `findings`, `verdictWeight`). The
  calculation's two-file build is the mechanism, once a case needs it.
- A `react-server` export condition.
- A table, chart, schedule or dashboard that runs as a Server Component, and a static SVG of a chart.
- A time-zone option, on the provider or anywhere: the map's "Time zones" item. ADR-0060's "not yet"
  stands.
- Controlled-only pickers that can't render read-only from a server (`core.md` B12): core's single wishes.
- The chart's `aria-describedby`, which points at a description that is empty until the chart draws.

## Further Notes

- Kendo's RSC grid is the precedent for a reader without the directive in front of a client part. Its
  `Grid` and `GridColumn` carry no directive, so in a Server Component they are the real functions.
- On the client, a client component's type written in a Server Component arrives as a lazy wrapper, whose
  `type ===` comparison fails. The reader avoids that by never crossing: the tree is read in the graph it
  is written in.
- Once a time zone can be named (the map's item), the server could write instants again in that zone. The
  hydration rule in `useFormats()` is then the place that changes.
