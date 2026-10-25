# A table stays within its frame, a schedule fills it and loads as the chart does

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket "Loading, empty and filling the parent" (its Answer
holds every decision below); findings `.scratch/shakedown/composed-app.md` 2 and 10 and its wish
"Fill-parent sizing", `design-family.md` (the wish "A `loading` state"), `dashboard.md` 5 and its wish
"Per-widget loading and error reporting"; `wishes.md` section 1; ADR-0042, ADR-0050, ADR-0062, ADR-0064.
Builds on `.scratch/scroll-in-a-widget/`.

## Problem Statement

A dashboard widget, a split pane and a grid cell each have a definite height. The chart fills such a frame
(ADR-0050). The table and the schedule do not.

- **The table grows past its parent.** In a widget, its last rows and its pager are out of reach, and
  `virtual` renders every row: 2,004 `tr` and a 72,216 px table, because the scroll area has no bound. A
  `maxHeight="100%"` looks like the fix and silently changes nothing, since the percentage resolves against
  a frame without a height. What works is a wrapper and a frame class of the application's own, three lines
  of CSS nobody can guess.
- **The schedule takes a number only.** It is 400 px unless told otherwise. In a six-row widget, a hard-coded
  `height={360}` still loses 36 px, its axis and a lane, and there is no right number: the widget's height
  follows the dashboard's width.
- **The schedule has no `loading`.** Table and chart dim a reloading view after the same delay and take no
  pointer until the answer is in (ADR-0042). A planner can drag on a schedule whose plan is being reloaded,
  and nothing tells a screen reader that it is busy.
- **A widget's failure reaches nobody.** The dashboard's boundary shows its sentence, and the application's
  error reporting never learns of it, as far as the README says. What is left for the application, and how
  it adds a retry, is written nowhere.

## Solution

Every view takes a frame of definite height without a prop, and the family loads one way.

- **A table stays within its frame.** In a parent of definite height, the table is never taller than the
  parent. Its toolbar and pager stay in view, and its scroll area takes the rest and scrolls, which also
  bounds a virtual table's window. In a parent without a definite height, nothing changes. The table does
  not stretch to a taller parent.
- **A schedule fills its frame, never below its floor**, as the chart does. Without `height` it takes its
  frame's height, and at least 400 px, which is also its height in a frame without one. A number stays a
  fixed height; a different floor goes through `style`.
- **A schedule takes `loading`.** Over a plan, the plan stays, dims after the family's delay, and starts no
  intent until the answer is in. Over nothing, placeholder lines stand in the lane column. The plot is busy
  meanwhile. There is no `empty`: a plan without subtasks is still a plan.
- **The dashboard's README says what fills a widget and who hears of a failure.** Each view fills or stays
  within the widget's body; below a view's floor, the floor goes through `style`. React's `onCaughtError`
  reports a widget's error, and a retry is an error boundary of the application's own inside the content.
- **ADR-0050 is amended** for the schedule and the table.

## User Stories

1. As an application developer, I want a table in a dashboard widget to keep its toolbar and pager in view
   and scroll its rows inside the widget, so that I write no CSS to make a table fit a widget.
2. As an application developer, I want a virtual table in a pane of definite height to render only its
   window without a `maxHeight`, so that 2,000 vehicles do not put 2,000 rows in the document.
3. As an application developer, I want `maxHeight="100%"` in a widget to do no harm, so that the first thing
   I try is not a silent trap.
4. As an application developer, I want a table on an ordinary page to look and behave exactly as before, so
   that the change costs me nothing where I never had the problem.
5. As an application developer, I want a table with few rows in a tall widget to stay as tall as its rows,
   so that no empty surface stands under the last row.
6. As an application developer, I want a schedule without `height` to fill its widget, pane or grid cell,
   so that I do not guess a pixel number that is wrong at the next width.
7. As an application developer, I want a schedule without `height` on an ordinary page to stay 400 px,
   whatever its lanes, so that a plan of thirty lanes scrolls inside the schedule and does not grow the page.
8. As an application developer, I want a schedule in a widget smaller than its floor to take a lower floor
   through `style`, as a chart does, so that both views are sized the same way.
9. As a planner, I want a schedule that is reloading to show me that it is, so that I do not drag a subtask
   on a plan that is about to change.
10. As a planner, I want a drag I began before the reload to finish and be reported, so that the reload
    never takes a move out of my hand.
11. As a planner, I want the plan to stay in view while it reloads, dimmed, so that I keep my bearings.
12. As a screen reader user, I want a reloading schedule to be busy, so that I know its content is about to
    change.
13. As a planner, I want a schedule whose lanes have not arrived yet to show placeholders where the lanes
    will be, as a table shows placeholder rows, so that an empty frame does not look like an empty plan.
14. As a planner, I want a plan with lanes and no subtasks to show its lanes and its time axis without a
    message, so that I can drag work into it.
15. As an application developer, I want the dashboard's README to tell me how each view sits in a widget,
    so that I know which needs nothing and when to lower a floor.
16. As an application developer, I want to know that React's `onCaughtError` receives the error of a failed
    widget, so that it reaches my error reporting with one line at the root.
17. As an application developer, I want to know how to add a retry to a widget, so that I wrap its content
    in my own error boundary that resets my data layer.
18. As the maintainer, I want ADR-0050 to say how the table and the schedule meet a frame, so that no later
    reader adds a `fill` prop to one of them.

## Implementation Decisions

### The table

- **The outer frame is capped at its parent.** The table's outer frame takes `max-height: 100%`. The frame
  is already a flex column, and its scroll area is a flex item that may shrink to nothing, so the toolbar,
  the pager and the parts beneath keep their height and the scroll area takes what is left. No prop and no
  option change.
- **`maxHeight` keeps its meaning.** It still bounds the scroll area. Where both bound it, the smaller wins.
- **A wrapper between the parent and the table** passes the height on with `height: 100%`, as for a chart.
  The README says so.
- **ADR-0050 gets this amendment**, dated the day of the change:

  > *Amended:* a table does not fill its frame; it stays within one. Its outer frame is at most as tall as a
  > parent of definite height, and its scroll area takes what the toolbar and pager leave. Where the parent
  > has no definite height, nothing changes. A table is as tall as its rows and does not stretch: blank
  > surface under the last row says nothing. A prop was rejected for the reason `"fill"` was: no one wants
  > to opt out where the parent has a height.

### The schedule's size

- **Without `height`, the schedule fills its frame, never below 400 px.** Its root is `height: 100%` with a
  floor of 400 px; with a number, it is that number, as today. `style` goes to the root after the schedule's
  own sizing, so its `height` or `minHeight` wins, as on the chart.
- **The schedule contributes its floor, never its lanes.** In a frame without a definite height it is
  exactly 400 px, however many lanes it holds: the lane headers and the plot do not size the root. Lanes
  beyond the plot scroll inside it, as they do now. The plot area is already observed in both directions.
- **The `height` prop's documentation** says what the chart's says: left out, the schedule fills its frame,
  at least 400 px.
- **ADR-0050 gets this amendment**, dated the day of the change:

  > *Amended:* the schedule follows the same rule. Without `height` it fills its frame and never goes below
  > 400 px, its height before; in a frame without a definite height, it is 400 px whatever its lanes. A
  > number stays a fixed height, and a different floor goes through `style`'s `minHeight`.

### The schedule's `loading`

- **One boolean prop, `loading`, as on `Chart` and `Table`.** Default `false`.
- **Over a plan.** The plan is drawn as before and marked stale. After the core token `--u-delay-stale` it
  dims, and it takes no pointer. No new intent starts, by pointer or by key, and no hover tooltip opens. A
  drag that began before `loading` turned on finishes and reports its intent as usual. Walking the plan with
  the keyboard and the readout stay.
- **Over nothing.** When there are no lanes, the lane column holds placeholder lines at the lane pitch, as
  many as the plot holds, drawn with core's `Skeleton`. The plot stays empty, and the bands show the time
  axis as usual.
- **Busy.** The plot carries `aria-busy` while `loading` is on.
- **No `empty`, no wording.** Nothing new is said.
- **ADR-0042**, which already says that the chart's `loading` follows the table's rule, gets the same
  sentence for the schedule.
- **On the server**, `loading` gives `aria-busy` and the placeholders in the server's markup; the rest
  arrives on the client after mount, as today.

### The dashboard

- **No new API.** `WidgetContent` stays `size` and `options`. The boundary and the `Suspense` stay as they
  are.
- **The README** gets, beside "the height follows the size, never the content" (whose second half
  `.scratch/scroll-in-a-widget/` writes):
  - how each view sits in a widget's body: a chart and a schedule fill it, a table stays within it, a
    wrapper of one's own passes the height on with `height: 100%`, and a view whose floor is taller than a
    size takes a lower one through `style`'s `minHeight`;
  - that a widget whose content throws is reported by React's `onCaughtError` on the root;
  - that a retry is the application's error boundary inside the content, which takes over from the
    dashboard's.
- **`API.md`** of the table and the dashboard does not change; the schedule's is regenerated for `loading`
  if the gate asks.

## Testing Decisions

- A good test here measures what the browser draws or what the reader can do: a frame's height against its
  parent's, whether the pager is in view, how many rows the document holds, what a drag reports, whether the
  plot is busy. It does not assert on class names or computed styles.
- **The table.** The seam is the table's visual suite, beside `features-virtual` and `features-table`, tagged
  `@quick`. One new example sets a table in a pane of fixed height. The checks:
  - the frame is no taller than the pane, and the pager is in view;
  - a virtual table in the pane holds a window, not every row, with no `maxHeight`, and with
    `maxHeight="100%"`;
  - the existing examples keep their heights, which the screenshots hold.
- **The schedule's size.** The seam is the schedule's visual suite, beside `features-schedule`, tagged
  `@quick`. One new example sets a schedule without `height` in a pane of fixed height, and one with thirty
  lanes in a block with no height. The checks:
  - the root is exactly the pane's height;
  - it is 400 px in the block, and its plot scrolls to the last lane;
  - a numeric `height` still wins.
- **The schedule's `loading`.** The seam is the unit tests that already drive the scene in jsdom
  (`gestures`, `keys`, `useSchedule`). A test sets `loading` and asserts:
  - the plot is busy and marked stale;
  - a drag begun before the reload reports its intent;
  - a drag or a key press begun during it reports none;
  - the placeholders stand when there are no lanes, and not when there are.

  The server-render test checks the busy plot in the markup. The visual suite gets one screenshot of a
  loading plan and one of a loading empty schedule, compared by eye with the chart's and the table's.
- **The dashboard.** A unit test beside `suspense.test.tsx` renders a widget that throws under a root
  created with `onCaughtError`, and asserts that the callback receives that error while the frame and its
  sentence stay. It holds the README's sentence.
- Prior art: ADR-0050's check in core's `features-control-room`, which measures a chart against its row;
  `loading.jsdom.test.tsx` in charts for the chart's `loading`.

## Out of Scope

- A `fill` prop on any view, and a table that stretches to a taller parent.
- A pixel size in the widget's render prop.
- A `loading` or `empty` on a dashboard widget; a retry button; an `onError` prop.
- An `empty` message on the schedule.
- DEV warnings for a virtual table with no bounded scroll area and for a chart's `data={undefined}`: the
  map's ticket "DEV warnings for the silent traps".
- The looks: an empty chart's legend and placeholder ticks, a loading table's "0 entries" and "Page 1 of 1",
  a card in a card.
- Any change to the chart.

## Further Notes

- The chart already has `loading`, `empty` and a frame it fills; the shakedown missed them. Its examples are
  the model for the schedule's.
- A print stylesheet (the roadmap's package C) must lift the table's cap, or a table in a pane of definite
  height prints only what fits the pane.
- The table's cap reaches only a parent of definite height. A table inside a block of auto height inside a
  widget is not capped; the README's `height: 100%` line on the wrapper covers it.
