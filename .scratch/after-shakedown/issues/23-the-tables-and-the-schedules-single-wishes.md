# The table's and the schedule's single wishes

Type:       grilling
Status:     resolved
Blocked by: 05, 13, 16

## Question

Take, later or never for each table and schedule wish one persona had (`.scratch/shakedown/wishes.md`
section 3; proofs in `table.md`, `table-export.md`, `reports-bi.md`, `schedule.md`, `audit-family.md`):

**Table:** Shift-click row ranges · a sticky-header offset below an app bar · drag reorder of columns ·
conditional formatting as rules · named custom aggregates (median, std) · bookmarks / URL state that survive
JSON (dates) · server search with debounce and a cancel token (`table.md` 5: one `onRequest` per keystroke;
two personas) · an Excel-friendly export (XLSX: `.scratch/table-xlsx/`; dates as dates, injection-safe -
what is left?).

**Schedule:** zoom and fit buttons and keyboard zoom · touch editing · validity findings for malformed data
and a findings list · a data-table alternative for screen readers · undo in app state (ADR-0032: the
application's) · a plant time zone (the map's fog) · and the "never" that held with caveats: start-to-start
via negative lag is not marked in the picture, the critical path untested.

Handles (scroll to a row, `zoomTo`, `fit`) are answered by "One root contract across the packages"; pivot by
"Pivot with columns unknown at compile time"; an active row by "Linked views".

## Proposed answer

Proposed 2026-10-25 by the agent; the maintainer decides. *take* = build it; *never* = the Instead holds, an
example in the demo shows it where it is not obvious. Sizes: S about a day, M a few days.

### The table

| Wish | Recommendation | Reason | Spec or size |
|---|---|---|---|
| Shift-click row ranges | **take**, straight to spec | ADR-0032 rules out cell ranges, not row ranges ("select rows, not ranges"). Only the table knows the order the reader sees (sort, grouping), so the app's 15-line capture handler cannot do it right. Shift-click on a row checkbox selects or clears from the last row toggled to this one, in the order shown, within the filtered set. It works with a handed-in `selection` too, so `TableSelection` needs a way to set several keys at once. | S; new spec, shared (below) |
| A sticky-header offset below an app bar | **never** (no token) | No offset can help. The head sticks inside the table's own scroll area (`.scroll`, `overflow: auto`), which carries the horizontal scroll, the pinned blocks and the virtual window, so it can never stick to the page. *Instead:* make the page's main area below the bar the table's frame (`.scratch/views-in-their-frame/`: the table stays within a parent of definite height), or `maxHeight="calc(100dvh - 64px)"`. | S example, in `.scratch/views-in-their-frame/` |
| Drag reorder of columns | **take**, decision left (product): drag in the ColumnMenu's list; drag on the header **never** | The move buttons and `setOrder` work, and stay the keyboard route. Dragging is what users of AG Grid or MUI expect. The header cell already takes the sort click, the resize grip and the pin blocks, and on touch the pan, so a drag there would compete with all of them. The menu's list has none of them. | M; new spec, shared (below) |
| Conditional formatting as rules | **never** | A rule set is a second way to present a cell beside `children` (ADR-0017). `cellClassRules` is a class hook (ADR-0045). *Instead* holds at about 3 lines per column: `Meter` for a data bar, `color-mix` for a scale, `Badge` for an icon, `VerdictColumn` for limits. | S example page "Conditional formatting" |
| Named custom aggregates (median, std) | **take** the name; **never** built-in median/std kinds | The trap is "Aggregate 42": an own function always gets the word `footerAggregate`. Let a column name its own aggregate (a label beside the function; the spec picks the shape). A median or a standard deviation is 4 lines as a function. As built-in kinds each would need two wordings, a sign and tests. | S; new spec, shared; median/std in that example |
| Bookmarks / URL state that survive JSON | **take**, straight to spec | `t.view` holds `Date`s in a date range condition. After `JSON.stringify`/`parse` they are strings, `isCondition` rejects them, and the date filter drops out of the bookmark without a word. A built-in condition that holds a date then also accepts the date's ISO text on the way in (`initialView`, `setView`). The view keeps `Date` on the way out. Add an example "the view in the URL": `setView` already compares by content, so no JSON compare is needed. | S; new spec, shared |
| Server search with debounce and a cancel token | **take** the debounce; **never** the cancel token | In server mode, typing in `Search` reports its request after a short fixed pause; the field itself updates at once, and Enter, clearing and `setSearch` report at once. No option: the delay is not configurable. The cancel token is answered by server mode 2: `answers` is the id, and a late answer is never shown. An abort is the app's `AbortController` in `onRequest`, and that spec's example can show it. | S; a ticket in `.scratch/table-server-mode-2/` after T1 |
| An Excel-friendly export | **take** what is left: CSV dates | XLSX (types, dates as dates, no formulas) is `.scratch/table-xlsx/`, and CSV injection is fixed (ADR-0061). What is left: a date-only value exports as UTC ISO and lands a day off (`table.md` 10, `table-export.md` 6). The CSV writes a column whose dates all fall at local midnight as the local `YYYY-MM-DD`, which is the XLSX spec's own rule. Date-times stay ISO. ADR-0061 is amended ("dates as ISO text"). | S; a ticket in `.scratch/table-xlsx/` (it already rebuilds the CSV writer as a format) |
| A field-name `rowKey` | **never** | It would be a second way to write one option (`(r) => r.id`). The Server Components answer (04) already turned it down for the server's sake. The real trap, a missing `rowKey` that crashes with `initialView`, is answered by a message that names `rowKey` (ticket 18). | - |

### The schedule

| Wish | Recommendation | Reason | Spec or size |
|---|---|---|---|
| Keyboard zoom | **take**, straight to spec | Today zoom is reachable only by Ctrl+wheel and pinch, so a keyboard user cannot zoom. The chart's keys exist (`charts/src/sceneKeys.ts`: `+`/`=`, `-`, `0`, announced "From … to …"), and the schedule's plot does not use them. Zoom about the active subtask or the centre, within `ZoomLimits`. `0` = `setDomain(null)`, the subtasks' extent, which also answers finding 8 from the keyboard. | S; new spec, shared (below) |
| Zoom and fit buttons | **never** (as built-in chrome) | `setDomain` is the API (05). A button pair is about 15 lines of app code next to the app's own toolbar. | S example (zoom in, out, fit) |
| Touch editing | **take**, straight to spec | One finger always pans, so a phone cannot edit at all. A long press on a bar (core's detector, 500 ms and under 10 px, made reachable to schedule) grabs it: the ghost appears and the drag moves in time and across lanes, ending in the same intents as a mouse drag. Under ticket 10's `touch-action: pan-y` the browser has already chosen at touch start, so once grabbed the plot cancels the page scroll (non-passive `touchmove`). Lead-in and lead-out stay pointer and keyboard. | M; a ticket in `.scratch/under-a-finger/` after its 05 and 10 |
| Validity findings for malformed data | **take** a DEV warning; **never** a finding kind | Today the schedule drops an end before its start, an unknown lane, task or dependency end, or a duplicate id without a word. These are errors of the data, not conflicts of the plan. A finding is the planner's (CONTEXT, **Overlap**: "the conflict is the finding"). The warning names the subtask and what to write. An app with imported data checks it at the boundary, as it would anyway. | S; with ticket 18's warning helper |
| A findings list | **never** (as a component) | `findings()` returns all of them as data. A list of it, with "go to" through `focusSubtask` (05), is app code. | S example |
| A data-table alternative for screen readers | **take**, straight to spec | The charts set the precedent: `DataTable` opens a table of what the chart shows. Do the same for the schedule: one row per subtask in lane order, with lane, task, from and to with date, duration and its findings. That also gives the date the tooltip lacks (finding 3). It is opt-in, as in the chart. | M; new spec, shared (below) |
| Undo in app state | **never** (ADR-0032, ADR-0023) | Intents are plain data, so a history is a stack in the app's state. The shakedown never built it, so the example is the proof. | S example "Undo", Ctrl+Z |
| Start-to-start via negative lag, not marked | **never** (ADR-0032; CONTEXT, **Dependency**: "no other kind of connection") | A negative lag is the Instead, and it holds. The picture can already set such a dependency apart: per-dependency `route` and `ends` are picture-only by design. | in the "Undo" example page, a few lines |
| The critical path, untested | **never** (ADR-0032) | The path is the planning system's. The schedule shows it once the app marks it (`appearance`, `selectedTask`). No persona built it, so nothing was found to fail. | - |
| A lane highlight from outside | **never** | `Lane label` is a `ReactNode`, so a `Badge` or a mark is a highlight. `scrollToLane` (05) brings the lane into view, and `selectedTask` mutes the rest (16). A class hook is not offered (ADR-0045). | in core's linked-views scenario (`.scratch/linked-views/`) |

### Pointed at, not triaged here

Row click and active row: the **Current row**, `.scratch/linked-views/` (16). Handles (scroll to a row, focus a
cell, scroll to a lane or subtask; `zoomTo`/`fit` = `setDomain`): `.scratch/root-contract/` (05). Pivot:
`.scratch/table-columns-from-the-data/` (13). Number formats: `.scratch/number-formats/` (15). The stale
accessor: ticket 18. A plant time zone: ticket 25.

### Specs the takes could share

- **Table selection and view**, a new spec: Shift-click ranges, a named own aggregate, a view that survives
  JSON (with the URL example), and the ColumnMenu drag if the maintainer takes it.
- **The schedule for keyboard and screen reader**, a new spec: keyboard zoom and the data table.
- Into existing specs: the debounce goes to `table-server-mode-2`, CSV dates to `table-xlsx`, touch editing to
  `under-a-finger`, and the DEV warning to ticket 18.
- The never-examples (conditional formatting, the sticky head under an app bar, zoom buttons, a findings list,
  undo with a marked start-to-start) need no decision. Each lands in the spec its demo page belongs to, or in
  one examples ticket per demo.

## Answer

Decided 2026-10-25 by the maintainer: the proposed answer above, as it stands (the column drag in the ColumnMenu's list is taken; the header drag never). It becomes the specs `.scratch/table-small-wishes/` and `.scratch/schedule-keyboard-and-reader/`, plus tickets added to `.scratch/table-server-mode-2/` (debounce), `.scratch/table-xlsx/` (CSV dates), `.scratch/under-a-finger/` (touch editing) and `.scratch/dev-warnings/` (malformed schedule data).
