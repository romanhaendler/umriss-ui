# What umriss promises a Server Component

Type:       grilling
Status:     open
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
