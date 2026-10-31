Status: done
Date:   2026-10-31

# Every open defect of three shakedowns is fixed, the fields share one contract, and the chosen wishes are built

## Problem Statement

The third shakedown (`README.md` beside this file) put core and table at 0.51.0 into eleven hosts and two
source reviews; the open defects of the first two runs were checked against 0.51.0 and settled in a browser
(`earlier-runs-open.md`). From a host's side:

- **Work is lost or wrong without a word.** A delete confirm inside an edit dialog closes the edit dialog;
  week groups carry the wrong ISO week on two days in three; "delete selected" deletes rows the search hid;
  a fitted server page shrinks when "select all" is ticked and drops the ticked row; a live update throws away
  a cell being typed; a sum over `3` and `"3"` is wrong; a NumberInput in Spanish or Swedish empties itself.
- **Forms fight every form library.** Combobox, MultiSelect and the pickers post nothing (or the label) to
  `FormData`, call `onBlur` when their panel opens, forbid `name` in their types and crash on `undefined`;
  `onChange` hands an event here and a value there; Checkbox cannot show an error; RadioGroup ignores
  `ref.focus()`; a form reset leaves Slider and FileInput out of step.
- **Focus falls to `<body>`** in the date calendar, after Ctrl+Home in a virtual grid, when a focused row
  scrolls away or is removed, after a nested dialog, after Button `loading`, in the dashboard's edit bar.
- **Screen readers hear nothing** on sort, fold, selection, validation, a picked date; names collide
  ("Operator" twice, "Alle" twice, "Actions for Figure" on every widget).
- **Looks and numbers are off at the edges:** muted text below AA, radios that look like checkboxes, chart
  text that does not grow with the root size, ticks of `0.000000`, a waterfall without its labels at 375 px.
- **No page prints well**, and the docs an agent reads miss install notes and still name removed limits.

Plus the wishes the maintainer took on 2026-10-31: numeric ids, one field contract, form participation,
date-time and boolean editors, per-row action state, a sticky footer, Avatar, input slots, a creatable
Combobox, RangeSlider and TimeInput, keyboard lane change in the schedule, print, a visible toast shortcut.

## Solution

Forty-two tickets in `issues/`, numbered blockers first, each with its findings' sources (`README.md`
item numbers, `earlier-runs-open.md` ids, `reds/`) and a red test first. The field contract is a wide rename
and runs expand-migrate-contract: 01 adds the new names beside the old (everything stays green), 02 and 03
move core and table/alarms over, the run releases 0.52.0, and 42 removes the old names on `main` for the
next minor (ADR-0066). Ticket 41 sweeps what no host covered, on the finished code, before the release. Every ticket touching a core field builds on 01. The table, chart, schedule, calculation,
dashboard, alarms, print, docs and security tickets are independent of it and of each other.

## Decisions (maintainer, 2026-10-31)

1. **One field contract (ADR).** The state prop names the callback: `value`/`defaultValue` with
   `onValueChange(value)` on every field, `checked`/`defaultChecked` with `onCheckedChange(boolean)` on
   Checkbox and Switch. The value types: Input/Textarea `string`; NumberInput `number | null`; Select,
   Combobox, SegmentedControl, RadioGroup `T | null`; MultiSelect `T[]`; Slider `number`; DatePicker and
   DateTimePicker `Date | null`; the range pickers `{ start, end }`; FileInput `File[]`. Empty is `null`
   (text fields `""`), never `undefined`; an `undefined` from the caller reads as empty. `onChange(event)`
   stays only where a native `<input>`/`<textarea>` stands behind the field (Input, Textarea, Checkbox,
   Switch, Slider), for `register` and Formik. Where `onChange(value)` exists today it becomes
   `onValueChange`; the old name works one minor and warns in DEV (ADR-0066).
2. **The same behaviour on every field:** controlled and uncontrolled; `onBlur` only when focus leaves the
   whole field (trigger and panel); `ref.focus()` focuses the operable part (RadioGroup and SegmentedControl:
   the checked option, else the first); `invalid`, `disabled`, `required` act alike (Checkbox gains
   `invalid`).
3. **Form participation.** With `name`, a field posts its value through a hidden input: Combobox the value
   (not the label); MultiSelect one entry per value under the same name; DatePicker `YYYY-MM-DD`;
   DateTimePicker ISO with the offset (`2026-10-31T14:30:00+01:00`); the range pickers two entries,
   `<name>Start` and `<name>End` by default, both names overridable; NumberInput the plain number
   (`1234.5`); empty `""`. `formValue={(value) => string}` replaces the default format. A form's `reset`
   restores every field, Slider and FileInput included.
4. **Numeric ids.** `rowKey` may return `string | number`; Select, Combobox, MultiSelect, SegmentedControl
   and RadioGroup take `T extends string | number`. `1` and `"1"` stay different keys.
5. **Taken as defects although they may have been deliberate:** a date column without `format` shows only
   the day when every value is midnight; a numeric header sits flush with its numbers; a Modal without
   `autoFocus` focuses its first field (else the dialog), not Close; the schedule's lane gutter is capped
   narrower on a phone.
6. **Accessibility calls:** the toast's Alt+T shortcut is shown visibly; chart colours stay the default
   (`encoding="marks"` documented as the route); Tab+Enter alone for radios, tabs and sliders and a toast near
   its trigger are not built.
7. **Taken into this spec:** print stylesheets for all packages (roadmap P3), keyboard lane change in the
   schedule, the unified field contract.
8. **Wishes taken:** table date-time and boolean editors; `disabled`/`hidden` per row on `Action`; Cmd+Arrow
   on macOS; a sticky footer row; Avatar (roadmap P4); start/end slots on Input; a creatable Combobox for
   string values; RangeSlider and TimeInput.
9. **Groups from the server and branches that load on opening** (taken; the API decided by the coordinator on
   the maintainer's trust, 2026-10-31). In ADR-0072's terms - the table asks, the application answers and
   names the answer: the request carries `grouping` and `folded`; the answer carries the page's group lines
   (`groups`: `path`, `count`, `totals`, `at`) beside its rows; a page counts lines. A tree's `childRows` may
   return `null` for a branch not yet loaded; opening it calls `onBranchOpen(key, row)`, which may return a
   promise for the loading line and the failure's "Try again". One ADR (0081) for both.
10. **Everything in one run** (maintainer, 2026-10-31): the run also sweeps what no host covered (ticket 41),
    releases 0.52.0 and pushes `main` (npm's publish waits for the maintainer's approval on GitHub), then
    removes the deprecated names on `main` for the next release (ticket 42).

## Implementation Decisions

Each ticket names its own. Shared rules:

- **Root cause, once.** A fix goes where all callers route through (`dialogChoreography`, `separatorsOf`,
  `useTableSelection`, `portalTarget`, the token), never in each caller.
- **DEV warnings** use each package's warn-once helper and name the prop and the expected shape.
- **Wording**: every new user-facing string goes into core's two language files.
- **Renames** follow ADR-0066 (one minor, DEV warning, `Migration:` line in the commit body).
- **No new dependency.**

## Testing Decisions

- Every defect starts from its red: the host's repro turned into a unit test in the package (`tests-unit/`),
  or a `@quick` Playwright case where only a browser shows it. The reds - the bug hunters' failing tests and the hosts' repros - are in
  `reds/` beside this spec (`reds/README.md` says how to rerun them); the tickets name them.
- Property tests where an invariant fits: `parse(format(n)) === n` for every locale `formatsFor` knows; ISO
  week against a Thursday-rule oracle over 2020-2030; a fitted page never larger than its frame.
- Workers do not edit an existing test; if one seems to need it, they stop and report. The one exception: tickets 02
  and 03 move existing tests from a deprecated prop name to its new name, the assertion unchanged.
- Each ticket ends with `pnpm check <pkg>` for every package it touches, `pnpm typecheck`, `pnpm check:site`
  where an API changed (API.md regenerated), and a look as a user at every visible change.

## Out of Scope

- **Decided and kept:** rows that wrap (ADR-0042); custom header content and a per-column menu (2026-10-28,
  decision 8); Tab through grid cells (ADR-0034); more than two text-filter terms and conditions on range
  filters (2026-10-31); the 2026-10-25 "never" list
  of core (PasswordInput, icon set, core Pagination, AppShell, list row, per-file progress, clickable Stepper,
  error summary helper); an optimistic-edit helper (ADR-0023); range selection, paste, fill, header drag,
  pivot (ADR-0032); the rest of 2026-10-28's "not taken now": Delete to clear, context menu, infinite scroll,
  column virtualisation, styled Excel, pinned rows at the top (ticket 33 pins only the footer).
- **Kept as they are, by judgement:** a Stat as a flex item (its stylesheet: a layout problem, not the
  tile's); the Drawer as the full screen at 375 px; the chart's data card beside core's label tooltip; the
  clipboard text without a formula guard (documented); control characters in CSV (raw data); no React-version
  check (ADR-0062); a changed `initialView` after mount (after-shakedown 18); the calculation's minus
  (after-shakedown 15); old rows under a new page in server mode without `loading` (documented: the app
  sets `loading`); TypeScript's own "No overload matches this call" for a misspelt column prop.
- **Wishes not taken** (`core-coverage-diff.md`, `table-feature-matrix.md`): core - TagsInput, PinInput, Chip,
  `useMediaQuery` (no media hook, after-shakedown 06), `useDisclosure`/`useClipboard`/`useDebouncedValue`,
  Kbd/Code/Mark, a Dropzone with per-file progress, a theme object (after-shakedown 20, ADR-0045);
  typed date entry exists in the picker's panel (2026-10-25). Table - the "rarer ones" of 2026-10-28: cell
  merge, floating filters, bulk edit, row drag, formulas, charts from a range, sparklines in cells, PDF, a
  side panel, a status bar, a loading overlay of its own; and the matrix's remainder: a delta API with cell
  flash for streaming rows, nested or collapsible column groups, `maxWidth`, a comparator beyond `sortValue`,
  copy of a range, undo/redo (a recipe), RTL. Alarms - a louder annunciator banner variant (10-28 p6-3).
- **Not a defect:** a number column without `format` shows Intl's default, at most three decimals
  ("1,234,567.891" has exactly three).
- **Firefox** (does not launch in the job sandbox), **real touch devices and real screen readers** - what
  emulation can tell is ticket 41; the rest is listed in its report. `.scratch/touch-scale-opt-in/` is
  delivered (status set to done).
- **Not reproduced at 0.51.0:** a chart's leftover listener, the schedule's empty plot of two lanes, the
  165 px plot, an overlapping Checkbox and Switch, the browser's ring on Checkbox/Switch/FileInput.
- **Needs a device or a real screen reader** beyond ticket 41's emulation: a Popover above a real on-screen
  keyboard; the Combobox's and the palette's double announcement in NVDA/VoiceOver.

## Tickets

| # | Ticket | Size | Blocked by |
|---|---|---|---|
| 01 | The field contract: the ADR, and the new names beside the old | M | - |
| 02 | The field contract: core's demos, docs and tests on the new names | S | 01 |
| 03 | The field contract: table and alarms on the new names | S | 01 |
| 04 | Fields post their value to forms: `name`, hidden inputs, `formValue` | M | 01 |
| 05 | Fields behave in forms: reset, blur, focus, `invalid`, one name | M | 01 |
| 06 | NumberInput reads, steps, rounds and pastes right in every locale | M | 01 |
| 07 | Combobox, MultiSelect, Select and search | M | 01 |
| 08 | The date pickers keep focus, say what was picked, read what is typed | M | 01 |
| 09 | Dialogs: a nested one closes alone, focus returns, confirm fires once | M | - |
| 10 | Overlays in foreign dialogs, shadow roots, iframes and a pinch-zoomed page | M | - |
| 11 | Smaller core components: Slider, TreeView, Button, radios, Badge, Menu, Alert | M | 01 |
| 12 | Tokens and looks: muted contrast, rings, gaps, touch | S | - |
| 13 | Toast and the announcer | S | - |
| 14 | Core's docs and types | S | 04, 05 |
| 15 | Numeric ids in the table and the choice fields | M | 01, 03 |
| 16 | Table selection: what is selected is what the app hears | M | - |
| 17 | Table paging: a fitted page holds still, a server's empty answer pages right | M | - |
| 18 | Table model: weeks, aggregates, sort, widths, filters, the view | M | - |
| 19 | Table grid: keyboard and editing keep focus and input | M | - |
| 20 | Table export and copy write what the screen shows | M | - |
| 21 | Table names, announcements and looks | M | - |
| 22 | Charts | M | - |
| 23 | Schedule, with a lane change by keyboard | M | - |
| 24 | Calculation | S | - |
| 25 | Dashboard | M | - |
| 26 | Alarms: the priority at 375 px | S | - |
| 27 | Print: core and the table | M | - |
| 28 | Print: calculation, schedule, dashboard, alarms and charts | M | 27 |
| 29 | Agent docs and packaging | M | - |
| 30 | Security: link targets and export file names | S | - |
| 31 | Table: date-time and boolean editors | M | 01, 08 |
| 32 | Table: `disabled` and `hidden` per row on `Action` | S | - |
| 33 | Table: a sticky footer row | S | - |
| 34 | Core: Avatar | S | - |
| 35 | Core: start and end slots on Input | S | 01 |
| 36 | Core: a creatable Combobox | S | 07 |
| 37 | Core: RangeSlider and TimeInput | M | 01, 11 |
| 38 | Server mode groups: the request carries the grouping, the answer the group lines (ADR) | L | 17 |
| 39 | Server mode groups: fold, select, export and keyboard | M | 38 |
| 40 | Tree rows: branches whose children load on opening | M | - |
| 41 | The sweep: what no host covered, on the finished code | M | 01-40 |
| 42 | The field contract: the old names go (contract step) | S | 41 and the release |

## Comments

**Run report (2026-10-31, coordinator - the unattended run of `run.md`).**

*Delivered.* All 42 tickets, each merged into `shakedown-2026-10-31` after its diff was read, its checks
rerun and every visible change looked at in Chromium (both themes where colour changed, 375 px where
layout did); each ticket's `## Comments` says what it delivered and what was decided there. Ticket 41
(the sweep) found and fixed three WebKit defects; CSP, an 8-hour tab, trees under live data and XLSX
edge cases were green. Ticket 42 went to `main` after the release.

*Decisions taken alone (details in the tickets).* ADR numbers 0081 (field contract) and 0082 (server
groups and lazy branches, one ADR); the range pickers keep `DateRange { from, to }` (spec said
`{ start, end }`); a Modal without `autoFocus` focuses its first tab stop other than the header's cross
(a footer button counts); `formats` writes the Gregorian calendar for every locale (`fa` changes);
server mode clears the selection on a new search (an "all that match" belongs to its query); the
selection count is announced in grid mode only (the toolbar's status says it otherwise); a plot with
its own zoom keeps the pinch (charts with zoom, the schedule), page pinch elsewhere; the schedule's lane
gutter is `max(120px, 28%)`, not narrower, so ten-letter group names stay readable; the stacked-FormField
margin of ticket 12 was taken back (it doubled every app's flex gap - seen in a consumer application); a chosen
server group works like "all that match" scoped to it (`except`); `matchCount` as a new server option;
the MultiSelect panel is a listbox; Cmd+Arrow is not gated to macOS. Existing tests were changed in
tickets 07, 11, 13, 16, 17, 20, 21, 22, 25, 29, 38 and in the visual fix pass, each only where the
ticket reversed the rule the test pinned - the spec allowed that in 02 and 03 only, so the maintainer may
want to look at them (each ticket names them).

*Review.* `code-review` against `main` on three axes (standards, spec, and - at the maintainer's
request - consumer regressions, with a consumer application as the test bench). One fix pass: selection kept while
`loading`; `value={undefined}` with a `defaultValue` is uncontrolled; ConfirmDialog retries after a
settled promise; the scroll lock respects `scrollbar-gutter`; the wording type of `dashboardSizeEntry`
kept; the browser cases of 09 and 19 written and run; "0 5" refused under fr/sv; a fitted column no
longer grows by 1 px; NumberInput keeps a caller's `aria-describedby`; the deprecation note defined once;
13 `Migration:` lines. A checkbox audit unticked items only partly delivered (each with a note).
A consumer application (core ^0.48) ran against the candidate in copies: no library regression; it
follows two renames and one test; its migration guides are with the maintainer.

*The release.* Lint, types, 6,338 unit tests, build, `check:site`, `pnpm semgrep` (0 findings), the full
visual suite (4,546 tests in both themes; every changed screenshot reviewed in contact sheets before the
update; 28 behaviour failures fixed first), `pnpm -r check:dist` (all seven) and `pnpm build:site` - then
0.52.0 of all seven packages, `main` fast-forwarded and pushed. The first CI on `main` failed: the new
field-contract tests of table and alarms render the whole demo and needed `demo/.generated`, which a
fresh clone lacks - fixed (they join `typecheck:demo`) and pushed; CI green. Publish run 41245894841
(`ea315625`, 0.52.0) waits for the npm environment's approval. A later Publish run (`1eaff48b`, ticket
42) is queued behind it; once 0.52.0 is on npm it publishes nothing - approve the earlier one, not only
the latest. Still the maintainer's: the XLSX writer changed (date columns), so open one file of the "An
Excel file" example in Excel, Numbers, LibreOffice and Google Sheets before approving (`docs/releasing.md`).

*Left, and why.* Real devices and screen readers (the spec's Out of Scope; ticket 41 lists what only a
device can settle); the H11 host drivers (need packed hosts - unit tests cover it); a shadow-root browser
case (the demo cannot host one); Tab order before a chart's plot only where `reading-flow` exists; DOM
comparisons by text when a table holds both `1` and `"1"`; the alarm list is wider than portrait A4
(print it landscape). After the release the maintainer asked to make the remaining components consistent
with ADR-0081 (Tabs, Accordion, Splitter still take `onChange(value)`): a follow-up pass, merged into
local `main` and pushed only after 0.52.0 is on npm (a push now would queue another Publish run).
