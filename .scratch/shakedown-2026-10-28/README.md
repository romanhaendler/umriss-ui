# Shakedown 2026-10-28: 0.48.0, eight personas

Status: needs-triage

Procedure: `docs/agents/shakedown/`. The seven packages packed at 0.48.0, eight personas on Sonnet, each in
its own Vite host: P1 beginner, P3 staff engineer, P4 vibe coder, P6 operator screens, P7 field service
(touch), P13 third language (first run), P16 migration from MUI/AG Grid/Highcharts (first run), P22 data-grid
specialist (new). The reports are in `personas/`, the table feature matrix in `table-feature-matrix.md`.
✓ = confirmed by the coordinating session in the source or by rerunning the host's repro. The hosts were
throwaway (session scratch).

## Decided (maintainer, 2026-10-28)

- **Defects:** all ten in section 1 are fixed.
- **Table wishes taken:** undo/redo as a recipe (the app's history over `onCellEdit`, no API); a text filter
  with operators; `onSelectionChange`; column groups; auto-size and flex widths.
- **Table wishes not taken now:** range selection, paste and Delete, fill handle, infinite scroll, column
  virtualisation, export of formatted values, styled Excel, header drag, context menu, pinned rows, status
  bar, side panel, runtime pivot, the rarer ones. ADR-0032's "never" stands.
- Decision 2 below is answered by the two lines above.
- **Decision 1:** `touch-scale.css` raises `sm` too.
- **Decision 3:** DEV warnings where a prop crashes or renders empty today (`rowKey` missing or not a
  function, a string `value` on date and multi fields, string `options`); misspelt variants stay with
  TypeScript.
- **Decision 4:** export `formatsFor`, add `weekStart`; `hourCycle` later.
- **Decision 5:** charts get a wording provider of their own; charts keep depending on nothing.
- **Decision 6:** no - the rename window stays one minor for now.
- **Decision 7:** the dashboard is flush with its neighbours while not editing.
- **Decision 8:** the header stays as it is for now (only the button sorts).
- **NumberInput:** where "." is not the group separator, a typed "." is the decimal; in German it stays
  the group separator.
- **Schedule name:** the plot is named "<label>, plot" (ADR-0068 does not name figure and plot; a fix).
- The whole of it is specified in `spec.md`.
- **Still open from the last run:** all three are taken - Playwright `.check()` on Checkbox, Switch and
  the table's boxes; buttons that do not grow on a wall display at root 32 px; the `light-dark()` lowering
  in production builds without `cssTarget`.

## 1. Defects to fix

Ranked by harm. Each is ✓ unless marked otherwise.

1. ✓ **[Break] A virtual list goes blank when it shrinks while scrolled deep.** `visibleWindow`
   (`core/src/lib/virtual.ts:69-80`) does not clamp `firstVisible` to `count`: a stale `scrollTop` beyond the
   shorter list gives `from > to` (no rows), and `before = from * rowHeight` keeps the old scroll height
   alive, so the browser never clamps the position. Repro: 100k-row virtual table, scroll to the end, search
   "Item 99" → 0 rows, scrollHeight ~190k instead of ~40k (P22, rerun on the production build). Shared
   `useVirtual`: table, TreeView, MultiSelect, the listbox. Fix in the one function.
2. ✓ **[Break] `AlarmList` is not virtual.** `AlarmList.tsx:294/520` passes no `virtual` to the table, so
   5,000 standing alarms are 97k-150k nodes and ~2.4 s to first paint (P3, P6, independently); 100k table
   rows virtual take 126 ms. The requirements asked for "virtual rows at flood volume"
   (`.scratch/alarm-management/requirements.md:47`); the flood is the package's own case.
3. ✓ **[Trap] `NumberInput` silently drops a typed character that is neither digit nor separator.**
   `filterInput` (`NumberInput/number.ts:59-68`): under fr-CH "1234.5" becomes 12345, ten times the value,
   without a word (P13). At least reject visibly; for locales whose group is not "." read "." as the decimal.
4. ✓ **[Trap] `touch-scale.css` does nothing when imported before core.** Both it and `tokens.css:172` set
   `--u-control-height` on `:root` in `umriss.tokens`; core's CSS arrives later with `dist/core.js` and wins.
   Entry files put CSS imports first (P7, dev and production build). Fix: a higher specificity in
   `touch-scale.css` (`:root:root`), and the README says nothing about order today.
5. ✓ **[Trap] `autoFocus` in a `Modal` is ignored; focus lands on Close.** `showModal()` runs in an effect
   (`lib/dialogChoreography.ts:90`) after React's `autoFocus` has focused the field; React writes no
   `autofocus` attribute, so the dialog's focusing steps take the first tab stop (P4). Every edit and login
   dialog.
6. ✓ **[Trap] False schedule warning for the README's own example.** The unknown-dependency check
   (`schedule/src/sceneData.ts:189-191`) runs before `Subtasks` has registered when `Dependencies` stands
   first, and warns "the dependency is left out" though it is drawn. The lane check right below has the
   "still registering" exemption; this one lacks it (P1, P13).
7. ✓ **[Misfit] `AlarmList`'s `aria-label` cannot name its table.** `AlarmList.tsx:522` hard-codes
   `aria-label={wording.alarmList}`; the caller's goes to a role-less root. Two lists both read "Alarms"
   (P3). The root contract (ADR-0068) routes the name to the element with the role elsewhere.
8. ✓ **[Docs] Dead links in the published READMEs.** alarms README → `API.md`, `../../docs/standards.md`;
   charts README → `docs/capabilities.md`. `files` ships only `dist`, `llms-full.md`, `CHANGELOG.md` (P4).
9. **[Docs] `llms-full.md` misses two traps the README names:** dark mode set from JS reverts to light in a
   production build (only core README "Styles"), and `touch-scale.css` (0 mentions in any llms-full) (P4,
   P7). Also one sentence that dev mode is ~10× slower than the capabilities figures (100k sort 3.5 s dev,
   0.33 s prod) (P22).
10. ✓ **[Trap, JS only] `<Modal open>` without `onClose`** throws on Escape and leaves `open` true (P1).
    `onClose` is required in the types; a guard costs one line.
11. **Smaller looks, not verified:** DatePicker placeholder ~3.4:1 (axe, P3); AlarmList state cell clips
    long words without an ellipsis (P13); AlarmBanner time wraps "AM" at 375 px (P13); bar chart y axis ends
    at the data maximum (P16); the `pageSize` warning fires once per render, three times (P22); Schedule
    names figure and plot alike (P3, as ADR-0068 says).

**Still open from the last run:** Playwright `.check()`/`.uncheck()` on Checkbox, Switch and the table's
selection boxes times out (input 1×1, the box intercepts) - `qa.md` 1, `core-screens.md` 1 (P6, P16). Wall
display at root 32 px keeps buttons at 26 px - `operator-screens.md` 2 (P6). The `light-dark()` lowering in
production builds without `cssTarget` (P4, P16).

## 2. Wishes

Each with the persona's three proofs in its report. "never" = ruled out by an ADR; "Instead" = the ADR's
replacement, built in the host.

**Table** (P22's ranking by how often real apps need it; P16):
- Cell range selection and copying a block - never (ADR-0032); Instead (rows + `selectionAsText`) fails
  for a block of columns.
- Paste from Excel, Delete to clear, fill handle - paste open, Delete and fill unlisted. Paste and Delete
  could report through `onCellEdit` and keep "report, don't apply".
- Text filter with operators (contains, starts with, equals, two conditions) - unlisted.
- Infinite scroll / block cache for server rows - unlisted.
- Column groups (two-level header) - unlisted.
- Auto-size and flex column widths - unlisted.
- Column virtualisation (150 columns = 150 cells per row) - unlisted.
- `onSelectionChange` (AG Grid `onSelectionChanged`) - unlisted (P16; lifting `selection` invited a render loop).
- Export with formatted values (€, locale dates) - unlisted; `exportValue` per column exists.
- Context menu on row and cell - unlisted.
- Pinned top and bottom rows, status bar, side panel - unlisted.
- Styled Excel (header styles, group rows, several sheets), print - not yet (ADR-0073).
- Header drag to reorder - never; Instead (ColumnMenu) holds, but a drag in the head does nothing.
- Pivot on a dimension chosen at runtime - never; Instead holds for known keys only.
- Undo/redo - never; Instead (the app's history over `onCellEdit`) holds.
- Rarer: row drag, cell merge, formulas, charts from a selection, RTL (never; Instead fails).

**Language and formats** (P13, P4):
- Export `formatsFor(locale, timeZone)`; a third language hand-writes ~20 functions today (and a full
  custom set is not re-zoned - `language/index.tsx:70-80`).
- `weekStart` for calendar, range picker and schedule weeks; a Sunday-first `weekdays` array mislabels the
  Monday-first grid without a warning.
- `hourCycle` reaching the DateTimePicker panel and the charts (ADR-0024: 24-hour).
- Charts following core's language, or one charts wording provider (ADR-0031: per chart).

**Alarms** (P6): an annunciator-size / loud banner variant for walls; horn with silence and repeat (not
yet); latched alarms and statistics views (not yet).

**Core** (P16, P4): initial focus on Modal and Drawer (see defect 5); an app bar; a chart `title`;
a page reset (never, ADR-0021; Instead holds in one rule).

## 3. Decisions for the maintainer

1. **How far does `touch-scale.css` reach?** It grows only `md` (ADR-0079). Under it stay small: every
   button of alarms and the table toolbar, pagination, row actions (`sm`, 24-26 px), Tabs (32, though
   `md`), menu rows, calendar days, checkboxes, switches (P7, P6). The Acknowledge button is the one a
   gloved hand needs. Options: (a) keep and document the limit; (b) the opt-in also raises `sm` (a second
   token); (c) alarms and the table's toolbar use `md` under the opt-in.
2. **The table's direction.** P22: "enough for read-heavy screens, not for spreadsheet-like tools". Which
   of the table wishes are in scope - none, the cheap ones that fit "report, don't apply" (paste, Delete,
   text-filter operators, `onSelectionChange`, column groups, auto-size), or reopening ADR-0032 for ranges?
3. **Dev warnings for component props.** Ticket 18 covered data shapes; P1 still white-screens on
   `useTable` without `rowKey` and gets raw messages for a string `value` on DatePicker/MultiSelect, string
   `options`, a misspelt `variant`. Warn for these, or leave them to TypeScript?
4. **A third language.** ADR-0019 makes it the application's business, ADR-0024 fixes Monday and 24 hours.
   Export `formatsFor`, add `weekStart`, add `hourCycle` - all, some, none?
5. **Charts and the language provider** (ADR-0031). Two personas hit an English chart in a German screen.
   Charts read core's language when present, a charts-own provider, or stay per chart?
6. **The rename window.** P3 judged upgrade risk from five minors: `md` 32 → 44 → 32, Dock removed, one
   minor between a rename and its removal (ADR-0066). Keep, or two minors from now on?
7. **Dashboard inset.** The root's `padding: 0 var(--u-space-4)` (`dashboard.module.css:20`) puts the cards
   16 px inside a table or chart above them (P4). Deliberate for the edit outline, or flush?
8. **Sorting by a click on the whole header cell.** Only the button inside sorts (`headerCell.tsx:166`),
   as the APG pattern has it; AG Grid migrants and tests click the cell (P16). Keep?

## What held up

Root contract on all seven packages; `ariaLabel` is a type error with a hint; strict types on TypeScript 7
with `skipLibCheck: false`; no English left in a 302-key third wording across seven screens; 100k rows sort
in 183-332 ms (production), 20 rows in the DOM; multi-sort, grouping, tree, `RowDetail`, view restore; grid
keyboard; alarm lifecycle, shelve with reason, first-out, flood marked not hidden, focus kept on re-sort,
stale and lost connection; dev warnings now fire in Vite, and the schedule's name the fix; README snippets
run first time; production builds without `cssTarget` for the plain case; migration from MUI/AG Grid/
Highcharts at 119 lines against 112.
