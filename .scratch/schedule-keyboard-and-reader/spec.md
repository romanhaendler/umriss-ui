# The schedule zooms from the keyboard and reads as a table

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket "The table's and the schedule's single wishes"
(its Answer holds every decision below, the schedule's half); findings `.scratch/shakedown/schedule.md` 3, 6
and 8 and its wishes, `qa.md` 5, `accessibility.md`'s held-up list; ADR-0022, ADR-0023, ADR-0030, ADR-0032.

## Problem Statement

A planner who works the schedule from the keyboard, or hears it through a screen reader, meets a picture
built for the mouse.

- **No keyboard zoom.** Zoom is reachable only by Ctrl with the wheel and by a pinch. `+`, `-` and `0` do
  nothing, although the charts, which the schedule is built on, take exactly those keys and announce the
  new span.
- **No way back to the work.** A schedule without a domain whose subtasks lie far apart opens on an empty
  28-day window, with no hint where the work is. `setDomain(null)` fits the work, but only the application
  can call it.
- **Every value one key at a time.** A screen reader reaches the plan only by walking it with the arrow
  keys: one subtask, one readout. Nobody can read a week of work at once, compare two lanes, or find the
  one subtask with a finding without walking past all the others.
- **The tooltip gives times without a date.** Across midnight, the year boundary or a leap day it reads
  "22:00–03:00", and nothing says which day or how long.
- **A test cannot read the plan.** The bars are canvas: no bar has a role or a name, so a test asserts on
  pixels or boxes.
- **What the schedule leaves to the application is not shown.** Zoom and fit buttons, undo, a
  start-to-start dependency, a critical path and a highlighted lane are each a few lines of the
  application's own. The shakedown's personas wrote none of them, and no example shows how.

## Solution

The schedule takes the chart's zoom keys and the chart's data table. Everything else stays the
application's, and the demo shows how in a few lines each.

- **The zoom keys.** On the focused plot, `+` (or `=`) zooms in, `-` zooms out, and `0` fits the work, as
  `setDomain(null)` does. The zoom keeps to `zoomLimits`. It zooms about the **Active subtask** where there
  is one, else about the middle of the view. After the keys rest, the new span is spoken: "From … to …".
- **The data table, opt-in.** `useSchedule` hands back a `DataTable` part. Placed inside a `Schedule`, it
  gives the schedule a "Show data" key. The key opens a table of the plan in view: one row per subtask in
  lane order, with its lane, task, start and end with their dates, its duration and its findings.
  Without the part nothing changes.
- **The examples.** Zoom in, zoom out and fit as buttons around `setDomain`. Undo with Ctrl+Z, as a stack
  of intents in the application's state, with a start-to-start dependency drawn apart. A critical path
  marked through `appearance`. A lane highlighted by a `Badge` in its label.

## User Stories

1. As a planner on the keyboard, I want `+` and `-` on the focused plot to zoom in and out, so that I can
   read a shift in detail and a month at a glance without a mouse.
2. As a planner who learned the charts, I want the schedule's zoom keys to be the chart's, so that one set
   of keys works on every umriss view.
3. As a planner on a German keyboard, I want `+` and `-` to work as they are printed on my keys, and `=` to
   zoom in too, so that no layout leaves me without zoom.
4. As a planner on the keyboard, I want the zoom to keep the subtask I stand on in view, so that I zoom in
   on what I am reading.
5. As a planner, I want `0` to fit all the work into view, so that a plan whose work lies far apart is never
   an empty window.
6. As a planner, I want the zoom to stop at the schedule's limits, so that a key does what Ctrl with the
   wheel does and no more.
7. As a screen reader user, I want the new span spoken after I zoom, so that I know what is in view without
   reading the axis.
8. As a screen reader user, I want the key help to name the zoom keys, so that I find them without the
   documentation.
9. As a planner, I want Ctrl with `+`, `-` and `0` to stay the browser's page zoom, so that the schedule
   takes nothing from the browser.
10. As an application developer, I want a zoom by key to be reported through `onViewChange` like a zoom by
    wheel, so that a kept view and a linked schedule follow it.
11. As a screen reader user, I want to open the plan as a table, so that I read every subtask in view with
    my reader's table keys instead of walking one at a time.
12. As a screen reader user, I want each row to name the lane, the task, the subtask, the start and the end
    with their dates, and the duration, so that a subtask across midnight or the year boundary is clear.
13. As a planner, I want each row to name its findings in words, so that I find an overlap or a violated
    dependency by reading, not by colour.
14. As a planner, I want the table to list what the plot shows, the span in view, in lane order, so that
    the table and the picture tell the same story.
15. As a screen reader user, I want the plot hidden while the table is open, so that I meet one picture of
    the plan at a time.
16. As a keyboard user, I want the table's key to follow the plot in the tab order, and the open table to
    be a tab stop that scrolls, so that I reach every row.
17. As a QA engineer, I want the open table to hold the plan as rows and cells with names, so that a test
    reads the plan by role instead of by pixel.
18. As an application developer, I want the table to be opt-in, as the chart's is, so that a schedule
    without it renders exactly as before.
19. As an application developer, I want the table's words to come from core's wording, German included, so
    that one provider switches it with everything else.
20. As an application developer, I want an example of zoom and fit buttons around `setDomain`, so that my
    toolbar has them in fifteen lines.
21. As an application developer, I want an example of undo with Ctrl+Z over the intents, so that I see
    that a history is a stack in my own state (ADR-0032).
22. As a planner, I want a start-to-start dependency drawn apart from the others in that example, so that
    a negative lag reads as what it means.
23. As an application developer, I want an example that marks a critical path my planning system worked
    out, so that I see the schedule show it without computing it.
24. As an application developer, I want an example that highlights a lane from outside through its label,
    so that I need no class hook for it (ADR-0045).

## Implementation Decisions

- **The zoom keys.**
  - They are the chart's. `+` and `=` zoom in by the chart's key factor, `-` and `_` zoom out by it, and
    `0` fits. They are read by the character, as the brackets are, so every keyboard layout reaches them.
  - They act only with no Ctrl, Alt or Meta held, and only while no drag is in flight. Ctrl with them stays
    the browser's.
  - The zoom goes through the view's existing zoom, so it keeps to `zoomLimits` and to the working
    calendar, as the wheel does.
  - The anchor is the middle of the **Active subtask**'s main time, clamped into the view. Without an
    Active subtask, it is the middle of the plot *(agent)*. The Active subtask stays where it is.
  - `0` does what `setDomain(null)` does: the view names no domain, and the schedule shows the subtasks'
    extent within the limits.
  - Each key's change is reported through `onViewChange` once, as the planner's wheel zoom is.
  - Shift with the arrows does not pan. The walk already pans the view, and the triage took only the
    three keys.
- **The announcement.**
  - After the keys rest (the readout's pause), the live region the readout uses says the span in view.
    The words are those of the chart's `visibleRange`, "From … to …". Each end is written as the summary
    writes an instant: date and time from core's formats.
  - A key at a limit, which changes nothing, still says the span *(agent)*, so the key is not silent.
  - The words are a new entry in core's wording, in English and German, beside the schedule's others. The
    key help gains one sentence naming the three keys.
- **The data table.**
  - **The part.** `useSchedule` hands back `DataTable` beside `Lane` and the other parts *(agent)*: a part,
    as in the chart, rather than a prop, so the two packages offer the table the same way. It takes no
    props and renders nothing of its own outside a `Schedule`.
  - **The key.** It is a disclosure button with the chart's words, "Show data" and "Hide data", in core's
    wording. It stands in the corner cell beside the time band at the bottom *(agent)*. The top corner is
    where the schedule puts the zone label (ADR-0076). The key follows the plot in the tab order.
    It is in the server's markup, closed.
  - **The panel.** It covers the middle row, the lane headers and the plot together *(agent)*: the lane
    headers are part of the picture, and the plot's width alone is too narrow for seven columns on a
    phone. The time bands stay visible above and below it, since they show the span the table lists. While
    the panel is open, the headers and the plot are hidden from the eye and from a screen reader, and they
    leave the tab order. The panel is a tab stop of its own, because it scrolls.
  - **The rows.**
    - One row per subtask that the plot shows: every subtask whose occupied interval (lead-in and
      lead-out included) touches the span in view *(agent)*. That is the chart's rule, its visible
      domain. A reader who wants the whole plan presses `0` first.
    - The rows run in the order the lanes stand, and by start within a lane.
    - Lanes inside a folded **Lane group** are listed too, since their **Miniature** still shows their
      work *(agent)*.
    - The table is written only while it is open, and anew when the data or the view changes.
  - **The columns.**
    - Lane: the lane header's own label, so an application's label reads as it is shown.
    - Task: its name, or its id without one.
    - Subtask: its name, or its id without one. This is the row header *(agent)*, as each row's one unique
      name.
    - From and To: the main time's ends, each with its date and time, in the readout's format. These give
      the date the tooltip lacks.
    - Duration: the main time's length in the readout's words. Where a lead-in or a lead-out is set, the
      cell adds it with the tooltip's words *(agent)*, so they need no columns that would stay empty in
      most plans.
    - Findings: each of the subtask's findings in the tooltip's words, joined. Empty where there is none.
  - **The caption** says the span, in the words of the chart's `tableCaption`.
  - **Wording.** Every column head and the caption are new entries in core's wording, in English and German.
    Every number and instant comes from core's formats, so a named time zone reaches the table with
    nothing more.
- **The examples** stand in the schedule's demo and pass the shell's page rules.
  - **Zoom and fit.** Three buttons beside a schedule. "Zoom in" and "Zoom out" halve and double the span
    around its middle, kept within the limits the example passes as `zoomLimits`. "Fit" calls
    `setDomain(null)`. It stands on the pan and zoom page.
  - **Undo.** A new page. The application keeps a stack of the plans before each applied intent. Ctrl+Z (⌘Z
    on a Mac) pops it, and so does an "Undo" button. The schedule does nothing for it: the key is not the
    plot's (ADR-0023, ADR-0032).
  - **Start-to-start.** In the undo example, one dependency with a negative lag stands for a start-to-start.
    It is set apart with its own `route` and `ends`, which are picture-only by design.
  - **The critical path.** The application holds the path as a list of subtask ids, as a planning system
    hands it over. Every subtask off the path gets `"muted"`, and the path keeps its colours. A toggle
    switches the marking. The schedule computes nothing. It stands on the dependencies page.
  - **A lane highlight.** A lane's `label` holds a `Badge` beside its name while the application marks it.
    A button brings it into view with `scrollToLane` (`.scratch/root-contract/` 09). It stands on the
    lane page.
  - **The findings list with "go to"** is the example `.scratch/root-contract/` 09 builds. This spec builds
    no second one.
- **No ADR.** The keys and the table follow the charts' precedent, and the examples decide nothing.

## Testing Decisions

- A good test drives the scene or the hook as an application and a planner do: keys on the plot, the
  hook's view, the table's rows by role and name. It never asserts on class names or the scene's private
  state.
- **The keys:** the scene's keyboard unit tests in jsdom, as the existing walk and Alt-edit tests do.
  - `+` narrows the span by the key factor about the Active subtask, and `-` widens it back.
  - Both stop at `zoomLimits`.
  - `0` leaves a view with no domain and shows the subtasks' extent.
  - Each key reports `onViewChange` once.
  - The span is spoken after the pause, also at a limit.
  - Ctrl with a key, and a key during a drag, do nothing.
- One Playwright check in the keyboard suite presses `-`, then `0`, and asserts the axis' span and the
  live region's text.
- **The table:** jsdom unit tests through `useSchedule`, as the readout and milestone tests render.
  - Without the part, no key renders.
  - The key opens the table. Its rows are the subtasks in view in lane order, with dates, duration and
    findings in words.
  - A subtask outside the span is not listed, and a folded group's lanes are.
  - While the table is open, the plot is hidden and out of the tab order.
  - The server render holds the closed key.
- Visual: screenshots of the open table, light and dark, compared by eye with the chart's open data table.
  The accessibility suite runs axe over a page with the table open.
- **The examples:** the demo's smoke and silent-pages tests cover them. The undo example gets one
  Playwright check: a drag, then Ctrl+Z, and the bar stands where it was.

## Out of Scope

- Zoom and fit buttons as built-in chrome. `setDomain` is the API.
- A findings list as a component. `findings()` returns the data, and `.scratch/root-contract/` 09 shows the
  list.
- Undo, a history, or start-to-start, finish-to-finish and start-to-finish as kinds of dependency
  (ADR-0032; CONTEXT, **Dependency**).
- A critical path computed by the schedule (ADR-0032).
- A class hook or a highlight prop for a lane (ADR-0045).
- Panning by Shift with the arrows. The walk pans.
- A date and a duration in the default tooltip. The table and the readout carry them, and a caller's
  `tooltip` function can add them.
- Milestones, dependencies and blocked times as tables of their own. The keys reach each of them. They
  get a table when a reader asks.
- A focusable, named element per bar (`qa.md` 5's idea). The table is the readable form of the plan.
- Touch editing and the DEV warning for malformed data. They are tickets in `.scratch/under-a-finger/` and
  `.scratch/dev-warnings/`.

## Further Notes

- The table writes one row per subtask in view, with no downsampling. A plan of thousands of subtasks in
  view writes thousands of rows. That is accepted, because the table is opened on demand. If it ever
  stalls a screen, the chart's downsampled caption is the precedent.
- The plant time zone (ADR-0076) changes how instants are written, and the table follows by itself
  through core's formats. Where 06 has landed, an instant in the doubled hour carries its offset, as in the
  tooltip.
- `.scratch/under-a-finger/`'s floor check measures the table's key under a finger. The corner cell is
  28 px tall, above the 24 px floor.
- `.scratch/views-in-their-frame/` (03) marks the plot stale while `loading`. The zoom keys report no
  intent and keep working while `loading` is on, as the walk does.
