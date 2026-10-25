# Loading, empty and filling the parent, for every view

Type:   grilling
Status: resolved

## Question

Do Chart, Schedule and a dashboard widget get the loading and empty states the table has, and do table,
chart and schedule fill their parent?

- Loading and empty states (`.scratch/shakedown/design-family.md`, `dashboard.md`): the same props and wording
  as the table's, per view?
- Fill-parent sizing for table, chart and schedule (`composed-app.md`, `design-family.md`, `charts.md`):
  ADR-0050 says a chart fills its frame, never below its floor - what is missing for the table and the
  schedule, and is "fill the parent" a prop or the default?
- The widget's pixel size handed to its render prop (`dashboard.md`).
- Per-widget Suspense and an error hook with retry (`dashboard.md`; the Suspense part was fixed in
  `.scratch/shakedown-defects/` - what is left?).

## Answer

Decided 2026-10-25 by the agent, under the maintainer's delegation. Technical decisions are marked *(agent)*;
the two product calls are marked *(agent, product - for review)*. It builds on "Scroll in a dashboard
widget": the widget body is a scroll box of its size's height, so a view that fills its frame fills that
body, and whatever needs more scrolls instead of being cut.

- **The chart needs nothing new.** It has had `loading` and `empty` since 2026-10-05, on the table's rule
  (ADR-0042: a course already drawn dims and takes no pointer; over nothing, a silhouette). Without `height`
  it fills its frame, never below 300 px (ADR-0050). The shakedown's "gave up" missed both. In a widget
  smaller than the floor, the floor goes through `style`'s `minHeight`, as the dispatcher's trends already
  do.
- **A table stays within a frame of definite height, by default** *(agent)*. The table's outer frame gets
  `max-height: 100%`.
  - In a parent without a definite height, the percentage resolves to none, and nothing changes.
  - In a widget body, a pane or a grid cell of definite height, the table is never taller than its parent.
    Toolbar and pager stay in view; the scroll area takes what they leave, and scrolls.
  - The scroll area is then bounded, so `virtual` renders a window there without a `maxHeight`
    (`composed-app.md` 2: 2,004 rows become a window, and `maxHeight="100%"` stops being a trap).
  - The table does not stretch to fill a taller parent. A table is as tall as its rows, and blank surface
    under the last row says nothing.
  - A prop was rejected for the reason ADR-0050 rejected `"fill"`: no one wants to opt out where the parent
    has a height. The cost: a table in a parent of definite height that overflowed it now scrolls inside it.
- **A schedule fills its frame, never below 400 px, as the chart does** *(agent)*. Without `height`, the
  schedule's root is `height: 100%` with a floor of 400 px, today's default height. In a frame without a
  definite height it stays 400 px, whatever its lanes; the lanes beyond scroll inside, as they do now. A
  number stays a fixed height, and a different floor goes through `style`'s `minHeight`. This is ADR-0050's
  rule, so ADR-0050 is amended for the schedule and the table, not replaced. The cost: a schedule without
  `height` in a frame taller than 400 px now fills it. A schedule in a widget needs no hard-coded pixels
  (`composed-app.md` 10).
- **The schedule takes `loading`, as the chart and the table do** *(agent, product - for review)*.
  - Over a plan already drawn, the plan stays. It dims after `--u-delay-stale`, and no new intent starts, by
    pointer or by key, until the answer is in. A drag under way finishes and reports as usual.
  - Over nothing (no lanes yet), the lane column holds placeholder lines at the lane pitch, as the table
    holds placeholder rows.
  - The plot is `aria-busy` meanwhile. No new wording.
- **No `empty` on the schedule** *(agent, product - for review)*. A plan with lanes and no subtasks is still
  a plan: the free capacity, the time axis and a target for work dragged in. A message over it would stand
  in the way. A schedule with no lanes at all is the application's empty state, with core's `EmptyState`.
- **A dashboard widget gets no `loading`, `empty`, retry or `onError`** *(agent)*. Its loading is the
  per-widget `Suspense` with core's `Skeleton`, built in `.scratch/shakedown-defects/`. A view that knows it
  is loading says so with its own `loading`. An empty widget is its content's `EmptyState`. A failing widget
  keeps its frame and its sentence, and gets another try when its size or options change, as today.
  - **Reporting** is React's: the root's `onCaughtError` (React 19, ADR-0062) receives every error the
    widget's boundary catches. That is where Sentry's React handler goes. A second hook would report the
    same error twice.
  - **A retry** depends on the application's data layer. `React.lazy` and a cached rejected promise throw
    again on a re-render, and a query library needs its own reset. A button umriss draws could not keep that
    promise. An application that wants one puts its own error boundary inside the content, which takes over
    from the dashboard's.
- **No pixel size in the widget's render prop** *(agent)*. Every view now fills, or stays within, the body
  by CSS. A measured size exists only after mount: the server and the first render would have none, and
  every resize would render the content again. An application that needs a number measures its own element.
- **Out:**
  - a `fill` prop on any view, and a table that stretches to a taller parent;
  - a pixel size in `WidgetContent`; a widget `loading` or `empty`; a retry button or `onError`;
  - an `empty` message on the schedule;
  - a DEV warning for a virtual table with no bounded scroll area (`table.md` 2) and for a chart's
    `data={undefined}` (`charts.md` 5): "DEV warnings for the silent traps" (ticket 18);
  - the looks: an empty chart's legend and placeholder ticks (`design-family.md` 4), a loading table's
    "0 entries" and "Page 1 of 1" (`design-family.md` 8), a card in a card (`design-family.md` 2). They are
    polish for the triage of looks, not decisions.
- **Costly to reverse:** the two defaults. Applications will rely on a table that stays within its widget
  and a schedule that fills it. ADR-0050 is amended (the text is in the spec's tickets 01 and 02), and
  ADR-0042's paragraph on the chart's `loading` gets a sentence for the schedule's. There is no new ADR.
- **Touches:** `@umriss-ui/table` (its stylesheet, README, an example, the visual suite),
  `@umriss-ui/schedule` (`Schedule`, its stylesheet, README, examples, the unit and visual suites),
  `@umriss-ui/dashboard` (README and one unit test), and the texts of ADR-0050 and ADR-0042.
- **Becomes the spec** `.scratch/views-in-their-frame/`, with four tickets: a table stays within its frame;
  a schedule fills its frame; a schedule takes `loading`; the dashboard's README says what fills a widget
  and who reports a failure.
