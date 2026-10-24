# Shakedown: a staff engineer's audit of the five packages on core (0.40.4)

Status: needs-triage

Every README and capability claim measured, a keyboard and accessibility-tree audit against the WAI-ARIA APG
patterns, API consistency across the family, escape hatches, upgrade risk. Vite 8 with `cssTarget`, a
production build for timings, Chromium, axe, 2026-10-24. Not covered: Firefox, WebKit, touch, the
ColumnMenu's pin and reorder buttons beyond tabbing. Verdict: pilot for read-mostly operator screens; not a
five-year commitment yet on two months of releases without a deprecation policy.

## Findings

1. ✓ ~~**[Break, a11y] Opening the table's ColumnMenu by keyboard leaves focus on the trigger:**~~ the panel is
   portalled to the end of `<body>`, and core's `Popover` returns focus on close (`Popover.tsx:107`) but
   never moves it in on open; "Move Id backward" is the sixth Tab after Export, the grid, the pager. Likely
   every `Popover` with a dialog role. Idea: move focus into a dialog-role panel on open. **Fixed 2026-10-24** (spec `.scratch/shakedown-defects/`).
2. **[Break, a11y] A virtualised grid under live rows drops focus to `<body>`** when the active row is
   re-sorted out of the window (rows re-sorted every 250 ms); paged keeps focus. Partly documented ("real
   scroll and focus under the row motion are not proved"). Idea: when the active row unmounts, focus the
   grid container and keep the roving stop.
3. **[Trap] Inline accessors go stale when they close over state** - Column `value`, `sortValue`,
   `groupValue`, `rowKey`, chart `tickFormat` are compared by source text (since table 0.35): after a unit
   toggle `value={(r) => r.duration * f}` keeps showing the old numbers while a children renderer updates.
   Documented in `llms-full.md` and the capability record, not in the READMEs. Idea: a DEV warning when the
   text matches but captured values differ. Same as `composed-app.md` 1.
4. **[Trap] The seventh chart series silently repeats the first series' colour** (and 8 the second, …); no
   warning, no `encoding="marks"` hint.
5. **[Misfit] Root props differ in every package:** Table, Chart and Schedule reject `id`; Table and Chart
   reject `ref`; Table rejects `style`; Schedule's `ref` is a handle, not an element; Dashboard and
   Calculation take HTML attributes but no `ref`; Calculation puts `className` on the outer surface and the
   rest on the inner `<ul>`; Chart silently drops `data-*`. Naming: `ariaLabel` (Table, Chart, Schedule) vs
   `aria-label` (Calculation, Dashboard). Idea: one root contract - rest props plus an element `ref` - as
   core's README principle 1 already states for core.
6. **[Misfit, a11y] Table changes are mostly silent:** search is announced ("11 of 45", no noun); a page
   change, a sort, select-all and export say nothing. Selection is `data-selected` plus a checkbox - no
   `aria-selected`, `aria-multiselectable`, `aria-rowcount`, `aria-colcount`. In grid mode Space,
   Shift+Space and Ctrl+A do nothing on a cell.
7. **[Misfit, a11y] Dashboard:** focus drops to `<body>` also after Reset and Cancel; three untitled Figure
   widgets are three `region "Figure"` landmarks of the same name; size choices are `menuitem "✓ Small, ¼
   wide"` (a check character in the name, not `menuitemradio`); the widget heading is a fixed `h2`; Escape
   does not leave edit mode.
8. **[Misfit] Server mode fires `onRequest` on mount and on every keystroke** (see `table.md` 5).
9. **[Look] Forced colours flatten the schedule:** grid lines and bars in maroon and black; task identity,
   the only encoding of a task, collapses to two tones.
10. **[Misfit] Calculation: no DEV warning for a missing `aria-label`** (Chart has one); uneven decimals
    (see `composed-app.md` 5).

## Upgrade risk

Pre-1.0, about two months public: core 53 releases (35 in September, 28 in October), table 52, charts
similar. Minors 0.34–0.40 with a "Changed" section: core 5, table 3, charts 2, schedule 2, calculation 1,
dashboard 0. No deprecation policy (`docs/releasing.md` names `npm deprecate` for a broken release only); no
statement on 1.0, a support window or a removal period; peers `^0.40.4` force lockstep.

## Wishes (unlisted unless marked)

- **Scroll to a row, focus a cell, select a row from code**, also on a virtual table (the hook exposes
  neither the sorted rows nor a handle). Gave up. Elsewhere: AG Grid `ensureIndexVisible`, TanStack
  Virtual `scrollToIndex`, MUI X `apiRef`.
- **`scrollToLane`, `scrollToSubtask`, `focusSubtask`, `zoomTo`, `fit` on the Schedule handle** (it has
  `positionAt`, `clientPointOf`, `visibleDomain`). Elsewhere: Bryntum.
- **A data-table or list alternative for the Schedule**, as charts have "Show data". Elsewhere: Bryntum
  accessibility mode, Highcharts accessibility data table.
- **Widget chrome: a head slot, `headingLevel`, a repeated-label warning** on the Dashboard.
- **A Search debounce and a cancel token for server mode** (about 12 lines today).
- **Selection accessibility:** `aria-selected`, `aria-multiselectable`, row-level Space, announcements for
  sort, page and selection. Elsewhere: AG Grid, MUI X DataGrid.
- **DEV warnings** for series beyond the palette, repeated widget labels, a Calculation without a label.
- **A deprecation and support policy** (a 1.0 date, how long a removed prop keeps working).
- **Right-to-left.** never: ADR-0032 ("for RTL, a general library"); not built, so the Instead was not
  tested. It hurts any operator tool with Arabic or Hebrew staff.

## Held up, with numbers

Table first render (virtual, production): 10k 12 ms, 50k 35 ms, 200k 131 ms - faster than the capability
record (215 ms) in every set; paged and grouped 129–216 ms at 200k · all 8 column-typing errors rejected, a
typo answered "Did you mean 'qty'" · grid keyboard: one tab stop, arrows, Home/End, Ctrl+Home/End,
PageUp/Down, Enter/F2 edit, Escape reverts, Ctrl+C copies TSV and announces "2 rows copied" · every row 36 px
including CJK/Arabic/emoji, a cut value in a hover tip · calculation's declared failures throw on first render
naming the part; disclosure keys correct · chart zoom keys (`+`, `-`, Shift+arrows, `0`) announce "From 3 to
27"; Enter fires `onSelect` · dashboard move, resize, remove, undo, reset, cancel announced; Home/End · the
schedule's keyboard intents announce overlaps and dependencies; German summary complete ·
`prefers-reduced-motion` leaves 0 running animations · forced colours readable for table, selection,
dashboard, calculation · axe: only the known legend contrast · escape hatches exist: custom cell editor,
`Tooltip render`, schedule `tooltip`, `canMoveTo`, `ScheduleHandle`, server mode, and
`setView`/`setDomain`/`initialView`/`onViewChange` consistent across four packages · credited above the
competition: the calculation (no equivalent), the dashboard's accessible edit mode, `useTable`'s row typing
(stricter than AG Grid's string `field`), the keyboard models of table, schedule and dashboard.
