# A Server Component hands umriss its data, and writes only a calculation itself

Status: accepted, amends ADR-0060
Date:   2026-10

Every built entry began with `"use client"`, so every component was a client component and every export
a client reference on the server. An App Router report page found this out at its first build. Table,
chart, schedule and dashboard are declared through a hook, and a hook can't be called from a Server
Component. A `<Calculation>` tree written in a Server Component failed `next build`: across the boundary
its elements arrive as lazy wrappers, and the calculation reads its children by type. Functions -
`rowKey`, accessors, a widget type's render prop - can't be passed from a server page at all.

**A Server Component hands umriss its data; every view is a Client Component that renders on the server
and hydrates. Table, chart, schedule and dashboard are declared in a Client Component file, by their
hook, and get no second, serialisable way to be declared. A calculation is written wherever the page is
written: its reader carries no directive.**

- **What crosses is data.** Rows with Dates, chart rows, a schedule's subtasks, a dashboard's view and
  JSX cross the boundary, and the server page fetches them. `rowKey`, the columns, the series and the
  widget types stay in the client file that calls the hook, so no function has to cross.
- **No serialisable second API.** `rowKey` as a field name, columns or series as data, widget types
  declared by data: none comes for the server's sake. A declaration without the hook loses the row
  typing that ADR-0017 and ADR-0048 exist for. The other route would be the unchecked one, so it would
  be the most used. A convenience of that kind is judged on its own case, not as a server feature.
- **The calculation reads its tree in the graph it is written in.** `<Calculation>` and its elements
  carry no directive. `<Calculation>` builds its model from its children wherever it runs, on the
  server or in the browser, and hands that model to a client view, which evaluates, folds and draws.
  The package's entry is the one built file without `"use client"`; its client file carries the
  directive and the stylesheet import (ADR-0021). The tree stays written as it is shown (ADR-0027), with
  no value-based builder beside it.
- **The server's HTML claims nothing it cannot know.** A chart and a schedule give their labelled frame
  with an empty canvas; lanes, subtasks and every count arrive after mount. An instant is written once
  the page has hydrated (ADR-0060, amended).

## Considered Options

- **Promise nothing and document the wrapper.** It costs nothing, and it is what this decision does for
  the four hook-declared views. For the calculation it would leave a view with no hook and no state of
  the caller's behind a client file, and its build error would blame the wrong thing.
- **Serialisable declarations beside the hooks** (a field-name `rowKey`, columns as data, widget types
  by name). That would let a server page configure a table through its own props. But it would be a second
  way to declare every view, and the untyped one.
- **Views that run as Server Components** (KendoReact's RSC grid; ECharts' SVG string). Sorting,
  filtering, a legend and zoom would then go through server actions or be lost. It is a second product.
- **Matching the calculation's children by a marker.** On the client the type is a lazy wrapper, without
  the static property a marker needs.
- **A data tree for the calculation** (`tree={…}`), React's suggested alternative to reading children.
  It is the value-based builder ADR-0027 rules out, and the reader without a directive needs none.
- **`"use client"` per module in every package**, so that pure helpers such as `assess` or `pareto` are
  callable on the server. No task needed it. The calculation's two-file build is the mechanism, once a
  case does.

## Consequences

- "`"use client"` heads every built entry" (open-points roadmap, X2) holds for every entry but the
  calculation's. `check:dist` asserts which entry is server-safe, and the opposite head for it.
- A calculation's elements rendered on their own - a server tree passed through a client component,
  which renders it to nothing - throw a development error that names the cause.
- A Flight render in Node of a calculation written in a Server Component runs in the calculation's
  `check:dist`.
- Reversing the calculation's part breaks every server page that writes one; reversing "no second API"
  is an addition and breaks nobody, but needs a case to argue against this record.
