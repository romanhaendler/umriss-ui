# 04: Every table page with a control says its keys

Status: done
Blocked by: 02 (The silent-page check, with charts and calculation filled)
Spec: `.scratch/a11y-and-finish/spec.md`

**What to build:** The check wired into the table demo. First table, Column, Formats, Presets, Search, Filter, Pre-filter, Pagination, Aggregate, Selection, Row appearance, Toolbar, Toolbar controls, Export, View, Manual mode and VerdictColumn get a Keyboard section: own rows where the table binds a key itself (First table: Enter and Space on a sortable header, Escape closing a cut value's tip), otherwise `keysOf` the core control (Input, Select, Popover, Menu, Checkbox, Button). First table and AlarmList get Accessibility sections.

- [x] The check passes on every table page, exceptions reasoned (Installation and Provider have no tabbable stage)
- [x] Every `keysOf` to core resolves to core's page and its Keyboard anchor
- [x] Screenshot baselines renewed for the pages that gained sections

## Comments

Delivered.

- `packages/table/tests-visual/silent-pages.spec.ts` calls `checkSilentPages` with every page but the scenarios page, as charts and calculation do.
- Keyboard: First table has its own rows (Enter / Space on a sortable header: ascending, then descending; Escape closing a cut value's tip). Every other page the check found tabbable links `keysOf`: First table's keys (its sortable headers stand in every table), the local ColumnMenu and RowActions tables where those parts stand in the examples, and core's controls in the `{ name, page }` form through a small `core("Input")` helper in the outline: Input (search), Select and Button (pagination), Popover and Checkbox (filters), Checkbox (selection), MultiSelect, Combobox, DatePicker where the examples use them. Export is a plain Button, not a Menu, so it links Button.
- Accessibility: First table and AlarmList as the ticket says, and - because the check found live regions there - Column, Formats, Row appearance, RowActions and Toolbar (an example's own `role="status"` echo, a `Meter` in a presentation, core's `Alert` in `empty`, and the toolbar's count).
- One new exception in `UNANNOUNCED`: the table toolbar's count of matches (`[role="status"][class*="filteredCount"]`), which stands on every page with a toolbar; Toolbar's Accessibility section describes it, and a section on each page would repeat it word for word.
- Deviation: Installation and Provider are not silent - Installation's first table has sortable headers, Provider's stage holds a search, the column menu, export and a date picker - so both got `keysOf`. The check is the arbiter (spec).
- "Every `keysOf` to core resolves": `llmsGuard.test.ts` now checks, on all five demos, that a neighbour's page named in `keysOf` is a page of that demo's outline and that the link carries its `#keyboard-<id>` anchor. It does not yet require that page to have a keyboard table: core's Button and Input get theirs in ticket 05. Once 05 is merged the assertion can require `keys`.
- Tests: `packages/table/tests-unit/demo-smoke.test.tsx` (Search links `/first-table/#keyboard-first-table` and `/core/input/#keyboard-input`; First table puts Accessibility right after Keyboard). Proof the check bites: with Aggregate's `keysOf` and Column's Accessibility removed it failed with "aggregate: sum-and-average › input \"Search table\" takes Tab, and the page has no Keyboard section" and "column: row-header › p[role=status] announces, and the page has no Accessibility section"; restored, it passes.
- Runs: lint, typecheck, test:unit green. Playwright under the lock, `table-light` × silent-pages and accessibility: 62 passed, 1 failed (axe on manual-mode, a stale row's dimmed text in "loading and late answers" caught mid-transition); rerun on its own it passed - timing, not this change.
- Baselines: none moved. The page-head pictures end with the head (`.pageHead`), and the new sections stand below it; no example changed.
