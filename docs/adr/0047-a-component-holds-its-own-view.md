# A component holds its own view

Status: accepted
Date:   2026-10

Three packages answered "who keeps how the reader is looking" three ways. The
table kept its **View** itself and took a start through `initialView`, once,
restarted by a new `key`. The schedule kept its span itself but re-applied a
new `initialDomain`, kept its folded groups either way (`collapsedGroups` or
`defaultCollapsedGroups`) and reported each part on its own. The charts kept
nothing: `hidden` with `Legend onToggle`, and `domain` with
`onDomainChange`, were the caller's state (`.scratch/charts-review/spec.md`,
Q17 and Q19), so a caller wrote a `useState` and a toggle function before a
legend would click or an axis would zoom. A developer who had learnt one
package was a beginner in the next.

**Every component holds its own view, takes a start through `initialView` and
reports every change through `onViewChange`, always with the whole view.** The
data stays the application's (ADR-0023); how it is being looked at is the
component's. In particular:

- **A view handed in is applied when it differs in content from the last one
  handed in**; the same view again changes nothing. Two charts or two
  schedules stay in step by handing each other what they report, without a
  remount that would lose the **Active point**. A new `key` still restarts a
  component; it is no longer needed for that.
- **There are no controlled pairs for view state.** No `hidden` on a series,
  no `collapsedGroups`, no `onDomainChange` beside the view: one way in, one
  way out. A selection is not view state (CONTEXT.md, **View**) and keeps its
  own arrangement; making that uniform is a decision of its own.
- **A chart's view** is the span each zoomable x axis shows, by axis `id`, and
  the hidden series, by `name`. **A schedule's** is the span in view and the
  folded lane groups. **A table's** is unchanged. An id or a name that no
  longer occurs falls out, as the table's `onlyKnown` does with columns.
- **An interaction is there by default where it is harmless, on request where
  it is not.** The legend hides and shows series without a prop, as the column
  menu hides columns. Zoom is `zoomable` on an x axis: on a screen of twelve
  small charts a drag must not move every one of them. The schedule, one large
  tool, keeps zooming always.
- **The table's server mode reports its `Request`, not its view.** What a
  server answers depends on search, conditions, sort, page and page size; a
  dragged width must not fetch a page. `manual` becomes `server`, and
  `onViewChange` there becomes `onRequest` (CONTEXT.md, **Server mode**,
  **Request**).

## Considered Options

- **Controlled everywhere** (the charts' way). Clean for an application that
  stores the state, and it made syncing two charts one shared `useState`. It
  costs every other caller the same boilerplate, and it left the charts alone
  against the table and the schedule.
- **Controlled and uncontrolled pairs** (`hidden`/`defaultHidden`, as the
  schedule had for its groups). React's convention, and the most flexible; it
  gives every view part two names and two code paths, and a series' `hidden`
  would have two sources.
- **A start applied once, restarted by `key`** (the table's way). Simple to
  reason about; it makes keeping two components in step a remount per change.

## Consequences

- ADR-0030 is amended: zoom and pan by key exist wherever an x axis is
  `zoomable`, no longer only where the caller controls the domain.
- A chart clamps its own zoom (`zoomLimits`, the schedule's shape) and shows a
  "Show all" control of its own once zoomed; the caller can no longer clamp on
  the way back, because there is no way back.
- The old props are removed, not deprecated: one release breaks the three
  packages once, together with ADR-0048.
- The work stands in `.scratch/component-view/`.
