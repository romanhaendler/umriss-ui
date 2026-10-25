# Server Components in comparable libraries

Type:   research
Status: open

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
