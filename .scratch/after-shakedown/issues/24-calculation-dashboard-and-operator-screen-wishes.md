# Calculation, dashboard and operator-screen wishes

Type:       grilling
Status:     resolved
Blocked by: 14, 15, 17

## Question

Take, later or never for each remaining wish of the calculation, the dashboard and the operator screens
(`.scratch/shakedown/wishes.md` section 3; proofs in `calculation.md`, `dashboard.md`, `operator-screens.md`,
`kiosk.md`):

**Calculation:** a print stylesheet (roadmap P3 - point at it) · a total that skips missing values ·
uncertainty propagation (a non-goal in spirit - confirm never). Per-line rounding, currency and the negative
format are answered by "Number formats".

**Dashboard:** hide a widget without losing it · a schema version and migration for stored views · lock a
widget · drag from the catalogue to a chosen place · widget chrome (a head slot, the heading level - today a
fixed `h2`, `audit-family.md` 7). Scroll is answered by "Scroll in a dashboard widget", loading and the
widget's size by "Loading, empty and filling the parent".

**Operator screens beyond alarm management:** data quality (good / uncertain / bad) beside ADR-0010's
freshness · a symbol / P&ID mimic layer. Alarm sound, flash and hotkeys belong to "Alarm management:
priorities, acknowledge-all, wording, sound, time and shortcuts".

## Proposed answer

Proposed 2026-10-25 by the agent for the maintainer to decide; nothing here is decided. Rows marked
*(agent)* are technical calls under the delegation note of the map.

Already answered elsewhere, only pointed at: scroll in a widget - 14 (`.scratch/scroll-in-a-widget/`);
widget loading, pixel size, retry, `onError` - 17, never (`.scratch/views-in-their-frame/`); per-line
rounding, currency, the negative format - 15 (`unit` + `decimals`, per-line rounding never;
`.scratch/number-formats/`); a calculation in a Server Component - 04 (`.scratch/server-components/`); alarm
sound, flash, hotkeys - 10 (`@umriss-ui/alarms`, `.scratch/alarms/`); a plant time zone - 25; touch sizes
and the 4K wall - 06 (`.scratch/under-a-finger/`) and the defects triage. The dashboard's focus drops, the
size `menuitem` with "✓" and the same-named `region`s (`audit-family.md` 7, `dashboard.md` 9) are defects,
not wishes - the defects triage.

| Wish | Recommendation | Reason | Spec or size |
| --- | --- | --- | --- |
| Calculation: a print stylesheet with every level open | **take - already decided** | Roadmap P3 (package C, "the print stylesheet", `.scratch/open-points-roadmap/spec.md`). Its share here: folded levels open and disclosure buttons hidden under `@media print`. P3 says "all five packages"; there are six now, the dashboard joins it. The chart's print is `.scratch/chart-picture-and-print/`. | P3's own spec; S for the calculation |
| Calculation: a total that skips missing values (`missing="skip"`, "n of m") | **never** | Against the calculation's rule (CONTEXT "Quantity", ADR-0028, ADR-0038: an absent operand makes the result absent, never carried on as zero, "never guessed around"). A skip is a guess of zero under another name. The honest way is two lines of app code: filter the rows a `Sum` takes from data (ADR-0049) and say in `explanation` what was left out ("1 of 4 lines has no value"). | Example in `calculation/demo/examples/What-can-go-wrong`, S |
| Calculation: uncertainty propagation | **never** (confirm) | It needs a model of errors (correlation, distribution) and operators the calculation does not have (sqrt, power). ADR-0027 writes a calculation as it stands on paper, and no unit algebra is a documented non-goal. A caller with a computed error shows it as its own `Given` or in `aside`. Record it so a request is answered by the ADR. | One line in ADR-0032 (a new "The calculation" section, beside unit algebra) |
| Dashboard: hide a widget from a user without losing it | **never** as a feature | Already holds since `.scratch/shakedown-defects/`: a widget of a type not declared survives in the stored view through Done. So the app hides it by declaring the type only for the role or flag (`{canSeeCost && <WidgetType name="cost" …/>}`). ADR-0064: "which default a role gets" is the application's. The README still says such a widget "falls out" - one sentence there, and the example. Not ADR-0064's "not yet: hiding a widget that has nothing to show"; that one stays. | Example + README sentence, S |
| Dashboard: a schema version and migration for stored views | **never** a version field or migrate hook; **take** one small change *(agent)* | The stored value is the application's (ADR-0064): it can wrap its own `{ version, view }` and migrate it before `initialView`, a few lines in the example. umriss's own format already reads leniently, and a change to it falls under the upgrade promise (19). The real pain (`dashboard.md` 5) is a type's options that gained a key in an update. *(agent)*: a widget's stored options are read over its type's `defaultOptions` (shallow), so a new key has its default. | Example + `{...defaultOptions, ...stored}` in `readView`, S |
| Dashboard: lock a widget | **take**, decision left | Today there is no way at all ("gave up"); the app can only put a removed widget back after Done, which the reader sees. ADR-0064 has it under "not yet", whose only reason was its order of work - under G1 that parks nothing. Left for the maintainer: what a lock promises in a sequence - (a) cannot be removed, resized or have its options changed, but moves with the others, or (b) also keeps its place, others moving past it. The agent proposes (a), set by the app per widget in the view (`locked: true`), never by the reader: it is what a mandatory widget needs, and (b) breaks "earlier / later" in a sequence. ADR-0064 amended. | New spec `.scratch/dashboard-locked-widget/`, M |
| Dashboard: drag from the catalogue to a chosen place | **never** for the drag; the smallest part goes with the focus defect | ADR-0064, "every action without a drag": the catalogue is a Drawer over the board, so a drag from it reaches the grid with a pointer only, and only by moving the Drawer aside. Add, then place, already does it: the new widget stands at the end and scrolls into view. What is missing is that it takes the focus, so the arrow keys and "to the start" place it at once - that belongs with the focus drops in the defects triage (`dashboard.md` 9). ADR-0064's "not yet" line becomes "never". | ADR-0064 line; defects triage |
| Dashboard: widget chrome - a head slot | **never** | The head is the grip, takes the arrow keys and carries the one menu (ADR-0064). Content of the app's own there would be a second interactive thing in a grip, and would have to turn inert in the editing mode as the body does. A toolbar row at the top of the content is three lines and is already inert while editing. | Example, S |
| Dashboard: widget chrome - the heading level (a fixed `h2`) | **take**, straight to spec | An outline defect with a known shape: a dashboard under a page's `h2` gives widget titles the wrong level, and the heading widget and the titles share `h2`, so a heading widget structures nothing. `headingLevel?: 2 \| 3 \| 4 \| 5 \| 6` on `Dashboard`, as core's `Accordion` names it (default 2). *(agent)*: the heading widget stands at that level, widget titles one below it when the view holds a heading widget, at it when not. | S |
| Operator screens: data quality (good / uncertain / bad) | **take**, decision left | The control room is the audience (ADR-0035) and the shakedown "gave up"; a hand-placed Badge cannot reach the Stat's sentence or its verdict. Left for the maintainer, one ADR: quality is a third axis beside verdict and freshness (ADR-0010's reasoning - a bad reading keeps its value and its verdict, said in words), and where it stands first - the agent proposes `Stat` and the calculation's `Given` only, three words in the wording, OPC UA's three levels and no status codes; table cells and the tooltip later, through a cell renderer and the tooltip's own content in an example, because charts carry no freshness either (ADR-0010). Overlaps with `@umriss-ui/alarms` (an alarm on a bad value) - decided together with `.scratch/alarms/`. | New spec `.scratch/data-quality/`, M, ADR |
| Operator screens: a symbol / P&ID mimic layer | **never** | `docs/standards.md`: "Screens, navigation and faceplates are the application's. umriss ships components, not an operator interface." A mimic is the app's SVG; umriss gives it the verdict tokens and `Stat`. Record it in ADR-0032 ("Everywhere") so a request is answered there. | ADR-0032 line; optionally a small SVG mimic in core's kiln scenario, S |

**Could share one spec:** the dashboard's small takes - `headingLevel`, options read over `defaultOptions`,
and the three examples with the README sentence (hiding by role, migrating a stored view, a toolbar row) - as
one spec, `.scratch/dashboard-small-wishes/`. The ADR lines (ADR-0032: uncertainty and the mimic; ADR-0064:
drag from the catalogue "never", lock taken) go into the first ticket of whichever spec lands first, or one
docs commit. The calculation's print share goes into P3's spec. Lock and data quality are a spec each, after
their decision.

## Answer

Decided 2026-10-25 by the maintainer: the proposed answer above, as it stands; the lock is option (a) - it cannot be removed, resized or have its options changed, and moves with the others. It becomes the specs `.scratch/dashboard-small-wishes/` (heading level, the options merge, the three examples, the README sentence, and the ADR-0032 and ADR-0064 lines), `.scratch/dashboard-locked-widget/` and `.scratch/data-quality/`; the calculation's print part goes to roadmap P3.
