# What umriss promises a Server Component

Type:       grilling
Status:     resolved
Blocked by: 03

## Question

Which umriss views can a Server Component render, and what changes in their API so that a server page can
configure them?

Today every built entry starts with `"use client"` (roadmap X2), table, chart, schedule and dashboard are
reached only through hooks, and a read-only report page needs about 35 lines of client wrappers
(`.scratch/shakedown/cross-package.md` 2-6). To settle:

- The promise: none (document the wrapper), read-only views only, or the whole family.
- Configuration that is a function today: `rowKey` as a field name, column accessors by field, widget types
  declared by data - which, and is the function form kept beside it?
- The `<Calculation>` tree read by element type (`cross-package.md` 3): a marker, or a data tree.
- Dates: the hydration error under a server in another zone (`cross-package.md` 5) - render after mount, take
  the zone from the server, or a decision on time zones (see "Not yet specified" on the map).
- The false server HTML: the schedule's "0 lanes" summary, a chart's empty `aria-describedby`
  (`cross-package.md` 6), and the open confirmation in `.scratch/open-points-roadmap/next.md` ("Loose ends").

Costly to reverse if it changes the hook-first shape (ADR-0048): then an ADR. Input: the research of
"Server Components in comparable libraries".

## Answer

Decided 2026-10-25 by the agent, on the maintainer's delegation. The technical decisions are marked
*(agent)*; the three that set what umriss promises are marked *(agent, product - for review)*.

- **The promise: a Server Component hands umriss its data; every view is a Client Component**
  *(agent, product - for review)*. Every component renders on a server and hydrates, as today. A Server
  Component renders umriss components and passes them anything React can serialise: rows with Dates,
  chart rows, schedule tasks, a dashboard view, JSX.
  - **Table, chart, schedule and dashboard are declared in a Client Component file.** The server page
    fetches the rows and passes them. That file is where `rowKey`, the columns, the series and the widget
    types live, so no function ever crosses the boundary. This is the shape React and Next document for a
    library with client features, and the one MUI, Mantine, AG Grid and Highcharts ask for.
  - **No second, serialisable way to declare them.** `rowKey` as a field name, columns or series as data,
    widget types declared by data: none of it comes for the server's sake. A hook can't run in a Server
    Component, and a declaration without the hook loses the row typing that ADR-0017 and ADR-0048 exist
    for. The hook-first shape stays.
  - Every README's paragraph on `"use client"` says what holds for its package. Core's README gets a short
    "Server Components" section with the one example: a server page and the client file it renders.
- **A calculation is written in a Server Component directly** *(agent, product - for review)*. It is the
  one view with no hook, and the one a report page writes as it is shown.
  - Mechanism *(agent)*: `<Calculation>` and its elements lose the directive. `<Calculation>` reads its
    tree where the tree is written, on the server or in the browser, and hands a serialisable model to a
    client view. This is KendoReact's shape: a reader without the directive, and a client part.
  - The package's build emits two files *(agent)*. The entry has no directive and holds the reader, the
    elements and the model. The client file starts with `"use client"` and its stylesheet import, and
    holds the view and the arithmetic. ADR-0021 holds: the JS still imports its CSS. `check:dist` asserts
    both heads.
  - Matching by a marker is out: across the boundary the type arrives as a lazy wrapper, which carries no
    static property. A data tree is out too: ADR-0027 allows no value-based builder, and the reader needs
    none.
  - An element rendered on its own throws a development error that names the cause *(agent)*. That
    happens when a server tree is passed through a client component, which renders it to nothing. Today
    it would be a silent empty line.
- **The server's HTML claims nothing it cannot know** *(agent, product - for review)*.
  - **An instant is written once the page has hydrated.** Before that, its text is empty. The reader's
    zone is known only in the browser (ADR-0060), so a server that writes a time writes a guess, and
    under a server in another zone that guess raises #418. Mechanism *(agent)*: core's `useFormats()`
    hands out formats whose instant members (`date`, `dateShort`, `month`, `dateLong`, `time`,
    `dateTime`, `offset`) write nothing until hydration, through `useSyncExternalStore` with a server
    snapshot. The table and the schedule get this through core, with no change of their own.
    An app that renders only on the client (`createRoot`, every test) sees no difference.
  - `suppressHydrationWarning` is out: it keeps the server's wrong text. `use(browser())` is out: it
    needs React 19.3 and a `<Suspense>`, above the React 19 floor (ADR-0062).
  - ADR-0060 gets the amendment: on a server, no instant is shown. A time zone the application names
    would let the server write instants again. That stays the map's open "Time zones" item.
  - **A chart and a schedule give their labelled, empty frame on a server.** Lanes, subtasks and every
    count arrive after mount. This confirms the open point in `.scratch/open-points-roadmap/next.md`
    ("Loose ends"). The schedule's summary is left out until its first client snapshot *(agent)*; today it
    reads "0 lanes, 0 subtasks … from 01/01 01:00 to 01/01 01:00". The chart's `aria-describedby` points
    at a description that is empty until the chart draws. An empty description claims nothing, so it
    stays *(agent)*.
- **Explicitly out.**
  - Pure helpers callable from a Server Component (`assess`, `pareto`, `findings`, `verdictWeight`;
    `upgrade.md`). No task needs them. A client file calls them. If a case comes, the calculation's
    two-file build is the mechanism.
  - A `react-server` export condition. None of the compared libraries uses one, and the reader needs
    none.
  - Server Components that run table, chart, schedule or dashboard on the server (Kendo's RSC grid,
    ECharts' SVG string).
  - Controlled-only pickers that can't render read-only from a server (`core.md` B12): core's single
    wishes.
  - A time-zone option: the map's "Time zones" item.
- **Costly to reverse: yes, so an ADR.** Two parts would break users' server pages if reversed: a
  calculation written on the server, and "no serialisable second API". The ADR is the spec's first
  ticket, with its decision text; its number is the coordinator's. It also takes back roadmap item X2 /
  "Taken as agreed" 6 ("`"use client"` heads every built entry") for the calculation's entry. The
  instants after hydration and the schedule's empty summary are not costly to reverse: an amendment to
  ADR-0060 and a commit message.
- **Touches:** calculation (reader and view, build, `check:dist`, a Flight check in Node, README), core
  (`useFormats`, README section, changelog), schedule (summary on the server, README), the README
  paragraphs of table, charts and dashboard, `scripts/check-dist.ts`, and root devDependencies
  (`react-server-dom-webpack`).
- **Becomes the spec** `.scratch/server-components/`.
