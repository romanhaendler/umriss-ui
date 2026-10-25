# Where the work stands, and what comes next

As of 11 Oct 2026. One page to point at: everything here is a pointer to where
the thing itself is written. The decisions and their reasons stand in
[`spec.md`](spec.md) beside this file; this page only says where the work is.

To take it up again, say: *read `.scratch/open-points-roadmap/next.md` and
build package B.*

## Done

**Package A is released**: `@umriss-ui/core` 0.33.0, `charts` 0.16.0, `table`
0.16.0, `schedule` 0.7.1, `calculation` 0.7.3. What it holds stands in
`spec.md`, section "A - small and clear"; what happened while building it, in
`docs/journal.md`, entry "The open points, grilled and begun".

## Next: package B

**Superseded in order (2026-10-25):** package B is release 3 of
`.scratch/after-shakedown/order.md`, and package C follows that page's sixth release.

Three specs, 17 tickets, all `ready-for-agent`. Each ticket names what blocks
it and its size.

| Spec | What | Tickets |
| --- | --- | --- |
| `.scratch/chart-range-selection-and-navigator/` | A chart reports a range (`onRange`), with the scenario "a chart filters a table" | 6 |
| `.scratch/table-server-mode-2/` | Server mode, step 1: a late answer and an error, all that match, exporting all that match, sums from the server | 7 |
| `.scratch/table-xlsx/` | XLSX through `@umriss-ui/table/xlsx`, a writer of the library's own | 4 |

The three are independent of each other. In the server mode the late answer
comes first: it is a fault, the rest are additions.

## After that: package C

No specs yet - each piece gets one, some a grilling of their own. The order,
and a line on the cut of each, is in `spec.md` (section "C", rows C5, C7 and
P1 to P5 of the decisions):

line colour by limit · horizontal bars · stacked overlap in the schedule ·
dependencies across tasks · the navigator · avatar · timeline · the
utilisation line · saved views · the print stylesheet · groups from the
server · later a Sankey and a bullet graph.

The navigator already has its questions written down:
`.scratch/chart-navigator/spec.md`, `needs-triage`.

## Loose ends

Each is recorded where it belongs; here they stand together.

- **A fix that is on `main` and in no released version**: the library's voice
  no longer throws when its page is gone (`packages/core/CHANGELOG.md`,
  "Unreleased"). It goes out with the next release of core.
- **Four browser cases that are written and not run**: the scroll position and
  the row motion under rows that change every second
  (`packages/table/tests-visual/rows-that-keep-arriving.spec.ts`, marked
  `fixme`; `.scratch/table-rows-that-keep-arriving/`). No demo page ticks, and
  the spec allowed no new API.
- **Nobody has pasted a copy into Excel, Numbers or LibreOffice**, nor heard
  it with VoiceOver or NVDA. The clipboard's text was read in a browser test.

## Put aside, not closed

- `.scratch/search-visibility/issues/05-search-consoles.md`: the sitemap's
  "Couldn't fetch" in the Search Console, and Bing.
- The VoiceOver pass of the listbox announcements
  (`.scratch/listbox-announcements/`, ticket 02).

1.0 is not a goal for now.

## How the work is done here

- A spec and its tickets are the brief. Implementation goes to subagents with
  the smallest brief that works; coordination, the review of every diff, the
  commits and the visual suite stay with the session that leads.
- Before a release: lint, typecheck, unit tests, build, `check:dist`, the
  whole visual suite - and `pnpm build:site`, which the release of package A
  went without and whose guard then refused the site.
- The maintainer looks at a package by hand before it is released. His look
  found what no test had, twice.
- Only `main` goes to GitHub, and a push to `main` publishes every raised
  version (`docs/releasing.md`).

## Where the rest is

| I want to know | Read |
| --- | --- |
| what was decided, and why | [`spec.md`](spec.md) |
| the facts the decisions stood on | `docs/research/open-points-2026-10/` |
| what was built, in order | `docs/journal.md`, the three newest entries |
| what changed for a caller | `packages/<package>/CHANGELOG.md` |
| which decisions became ADRs | `docs/adr/README.md`, 0053 to 0061 |
