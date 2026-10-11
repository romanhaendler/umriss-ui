# From the open points to work

Status: ready-for-agent
Date:   2026-10-11
Origin: the scan of the workspace against comparable libraries on 10 Oct 2026
("Was fehlt uns noch, wo sollten wir weitermachen?"), the release of 11 Oct
2026, and a grilling over everything that was still open the same day. The
facts the grilling stood on are in `docs/research/open-points-2026-10/`: the
table's server mode beside three other grids, how six chart libraries select a
range, what the packages claim about their platform, how the table exports, and
five topics nobody had looked at.

The verdict: almost nothing on the list was undecided because it was hard; it
was undecided because it "waited for a caller". The maintainer ended that for
this list - "Selbst der Aufrufer" - so the question became the order and the
cut of each piece, and four things changed that were not on the list at all:
the set of chart kinds is open again, the CSV export stops being German under
an English wording, a late answer in server mode is a fault and not a missing
feature, and two claims the READMEs make are to be proved rather than trusted.

This file is the map. Each piece below has, or gets, a spec of its own; the
decisions here are binding for those specs and are not argued again in them.

## What was decided

| # | Question | Decision |
| --- | --- | --- |
| G1 | The measure | The maintainer is the caller for the whole list. "Waits for a caller" no longer parks anything named here. |
| G2 | 1.0 | Not a goal now. No criteria, no date. |
| G3 | Deferred | `search-visibility` 05 (the sitemap's "Couldn't fetch", Bing) and the VoiceOver pass of the listbox announcements - both put aside by the maintainer, not closed. |
| C1 | What a marked stretch is | A **Range** (`CONTEXT.md`): a chart reports it and keeps none. `onRange({ axisId, from, to })` on `useChart`, once on release, in the axis' values. A band is drawn while dragging and nothing after (not a **Ghost**: that word is the schedule's). It does not travel over `syncId`. To zoom into it is the application's, by handing it back as the view. |
| C2 | The gesture | Alt with a drag on a zoomable chart, a plain drag where the axis is not zoomable. A drag of less than 4 px stays a click and reaches `onSelect`. A touch gets no range on a zoomable chart in this version: one finger pans. |
| C3 | The keyboard | Space sets the start at the Active point, the walk moves on, Space sets the end, Escape cancels; the live region says the start and the range. It needs a `<Tooltip>`, as the walk does. Built in the same version as the pointer's gesture. Three new required keys in the charts' wording: the start, the range, and the sentence in the summary that names the key (ADR-0030). |
| C4 | A category axis | `from` and `to` are the first and the last category covered (ADR-0052: a category is a value). Milliseconds on a time axis, numbers on a numeric one. |
| C5 | The navigator | Its own piece, later, with its own grilling; the ten questions already written stay with it. |
| C6 | The set of chart kinds | Open, by the same test as before: a kind is added when it answers a question no kind there answers better, and each gets an ADR saying which question. ADR-0032's "the set of kinds is closed" is superseded in that sentence, and so is its exclusion of horizontal bars - a kind named as the first to come cannot also stand under "never"; its reasons against pie, donut, radar, candlestick, violin and a log scale stand. |
| C7 | Which kinds | Horizontal bars first (a ranking with long names). Sankey with a case of its own (what flows where). A bullet graph, in core beside `Meter`. A treemap later. |
| C8 | Foreign renderers | Still none. Opening means the library builds more kinds, not that others build them in. |
| T1 | Server mode: a late answer | A fault, fixed first. The application says which request its rows answer (`answers={request}`); an answer to an older request leaves the table loading. `error` shows a message in place of the rows with "Try again", which reports the same request once more. |
| T2 | Server mode: select all | After ticking the page: "All 50 on this page are selected. Select all 12,400 that match". The selection is then a state - all that match, except these - and a bulk action receives the request and the exceptions instead of rows. Server mode only; a second shape of the bulk action's argument, visible in its type. |
| T3 | Server mode: export | `exportRows(request)` hands every match over, asynchronously, and the table writes the file in its own columns. Without it the export stays "Export page". No cap by the library; a refusal shows as an error on the export. |
| T4 | Server mode: sums | Footer aggregates over every match, handed in beside the rows, in step 1. Groups from the server are a piece of their own with their own spec and grilling. Loading on scroll and tree rows from the server wait for a case. |
| T5 | Copying rows | Ctrl or Cmd with C copies the selected rows when the focus is in the table and no text is marked: the visible columns in the order shown, with a header line, tab-separated, the values the export writes. In grid mode without a selection it copies the active cell's value - a cell, not a range (ADR-0032 stands). Said to a screen reader, no toast. A small function hands the same text to a caller's own button. |
| T6 | The CSV's conventions | They follow the language in use. English: comma, decimal point, "yes"/"no". German: as today. The BOM stays; dates stay ISO. A change for English callers, under "Changed". |
| T7 | XLSX | A writer of the library's own, no foreign dependency, behind an entry point of its own: `<Export format={xlsx} />` with `xlsx` from `@umriss-ui/table/xlsx`. One sheet, a header line, real cell types (number, date, boolean), column widths from the table, no styling, no formulas, no group rows. Dates in the reader's local time. |
| T8 | A snooze's stored reason | Shown where the list already explains a snoozed alarm - the tip and what a screen reader hears. The wording takes a third, optional argument; a wording written out by a caller still fits. |
| X1 | React 18 | Proved, not only said: the unit tests run against React 18 as well as 19 in CI. |
| X2 | Server rendering | A server-rendering test for every package, and `"use client"` at the head of every built entry. |
| X3 | Data that keeps arriving | No new API. A test of the table under rows that change every second, and a sentence in the documents saying what holds then. |
| X4 | Time zones | Not yet, and said: umriss shows the reader's time. An option would run through axes, raster, date fields and formats and waits for a real case. |
| X5 | Form validation, a dashboard a user arranges | Never; both go where a reader looks for "not, or not yet?". |
| X6 | A chart that filters a table | No feature - a scenario, built with the range. |
| P1 | Saved views | A part that lists named views, changes between them and offers "save this view"; where they are kept is the application's, through callbacks (ADR-0047). |
| P2 | Utilisation | A line under the plan on the same time axis, drawn from the occupancy the schedule already computes (ADR-0026). |
| P3 | Print | A print stylesheet for all five packages first. A schedule over several pages is a large piece of its own and waits for a need. |
| P4 | Avatar | A mark for a person or a team - initials, a picture if given - in two sizes, for a lane's header and a table's cell. No stack, no presence. |
| P5 | Timeline | A vertical list of events with their instant, text and state, in core, not a chart. Its spec says how it differs from `AlarmList` and `Stepper`. |

## The work, in three packages

Each package ends with a release, after the maintainer has looked at it by
hand. Within a package the specs are independent unless one says otherwise.

### A - small and clear

| Spec | Package | What |
| --- | --- | --- |
| `alarm-snooze-reason-shown` | table, core | T8 |
| `charts-stack-total-in-table` | charts | The data table of a stacked chart carries the stack's total, as the tooltip and the readout do |
| `table-export-by-language` | table, core | T6 |
| `table-copy-rows` | table, core | T5 |
| `table-rows-that-keep-arriving` | table | X3 |
| `platform-claims-proved` | all | X1, X2 |
| `what-umriss-is-not-2` | docs | Two ADRs: the open set of chart kinds (C6, C7, C8), and what is never or not yet (X4, X5) |

### B - with a spec from this session

| Spec | Package | What |
| --- | --- | --- |
| `chart-range-selection-and-navigator` | charts | C1-C4, and the scenario of X6. Rewritten to the decisions; the navigator leaves it |
| `table-server-mode-2` | table | T1-T4, in that order |
| `table-xlsx` | table | T7 |

### C - each a spec of its own, some with a grilling of their own

In this order: line colour by limit · horizontal bars · stacked overlap in the
schedule · dependencies across tasks · the navigator (`chart-navigator`) ·
avatar · timeline · the utilisation line · saved views · the print stylesheet ·
groups from the server · and, when their case is there, a Sankey and a bullet
graph.

## What stays as it was decided

- **No foreign runtime dependency.** No package has one; XLSX does not start it.
- **Components report, the application decides** (ADR-0023): a range, a
  selection of all that match, a request to export - each is reported.
- **A chart holds no selection** (ADR-0056, ADR-0003). A range is reported, not
  selected, and the word "selection" stays out of the charts.
- **Pivot, cell ranges, undo, a Gantt engine** stay out (ADR-0032).

## Taken as agreed

Seven things nobody decided one by one; the maintainer confirmed them together.

1. The range adds required keys to the charts' wording, as `onSelect` did - three, not the two first counted: the summary has to name the key (ADR-0030).
2. The props in server mode are called `answers` and `error`.
3. Selecting all that match exists in server mode only, and changes the type of
   a bulk action's argument there.
4. An English CSV means comma, decimal point, "yes"/"no"; nothing changes for a
   German one.
5. Copying is announced to a screen reader and shows no toast.
6. `"use client"` heads every built entry, so every component is a client
   component.
7. Versions rise as usual: a new word in core takes table, schedule and
   calculation with it.
