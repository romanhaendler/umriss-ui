# Server Components in comparable libraries

Type:   research
Status: resolved

## Question

How do data-component libraries serve React Server Components, and how do they render dates without a
hydration mismatch?

- Which of TanStack Table, MUI (`Table`, X Charts, X Data Grid), Mantine, AG Grid, Highcharts/ECharts SSR
  offer a component usable from a Server Component, and how: a client boundary inside the library, a separate
  server entry, a headless function, a static render?
- How do they accept configuration that is a function today (`rowKey`, accessors, formatters, render props)
  when the props come from a server page: field names, serialisable descriptors, a client wrapper?
- Hydration and time zones: how do libraries keep a `Date` rendered on a UTC server and in a Berlin browser
  from tripping React's error #418 - a `timeZone` prop, rendering dates only after mount,
  `suppressHydrationWarning`, a server-passed zone?
- What React 19 and Next 16 document for element-type matching across the boundary (the `<Calculation>` tree,
  `cross-package.md` 3).

Facts only, primary sources. The decision is "What umriss promises a Server Component".

## Answer

Findings: `docs/research/after-shakedown/server-components.md` on the local branch `research/server-components`
(`git show research/server-components:docs/research/after-shakedown/server-components.md`).

- Three shapes in use: a client boundary per file (MUI, Mantine: no wrapper, every prop must serialise), a
  headless core run on the server (TanStack Table v9: only `useTable` is client), a component that detects
  where it runs (KendoReact Grid). AG Grid and Highcharts are browser-only; ECharts renders SVG on the server.
- umriss puts `"use client"` on one file per package, so even pure helpers become client references on the
  server; TanStack and MUI mark per module.
- Function config from a server page: field-name row keys and accessors, format strings; custom render code
  crosses only as a component from a client file.
- Dates: libraries render in UTC, take a zone as configuration, or format in the runtime zone (umriss today).
  Server-only output cannot raise #418 but shows the server's zone; the escapes are `suppressHydrationWarning`,
  a render after mount, and `use(browser())` (react-dom 19.3, per the research; verify before relying on it).
- Element-type matching cannot work: a client type arrives as a lazy wrapper, so `child.type === Ref` and
  static markers both fail. React's docs suggest an array of objects as a prop instead.
