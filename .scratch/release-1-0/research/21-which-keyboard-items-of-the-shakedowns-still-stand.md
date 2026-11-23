# Which keyboard items of the shakedowns still stand

Read only; nothing run. Sources of the items: `.scratch/shakedown-2026-10-31/earlier-runs-open.md` (status at 0.51.0), `shakedown-2026-10-31/README.md` (items 33, 36, 38), `spec.md` (decisions 5-8, "Decided and kept", "Kept as they are, by judgement", "Wishes not taken"), section 3.4 / 5 of `12-accessibility-and-browsers-claimed-and-checked.md`. Paths below are under `packages/`.

Tally: **fixed 21, stands 5, cannot be told without running it 4.**

## Fixed

| # | Record | Source now | Shown by |
|---|---|---|---|
| 1 | Dashboard Edit/Done/Cancel/Reset drop focus (P10-1, dashboard.md 9, audit-family 7) | `dashboard/src/Dashboard.tsx:167-174` (successor ref hands focus to "Add widget" / "Edit"); Reset at `:303` | `dashboard/tests-unit/shakedown25.test.tsx:44` "keeps the focus through Edit, Cancel and Done, and says that the mode began" |
| 2 | Escape does not leave edit mode | `Dashboard.tsx:290-291` | `shakedown25.test.tsx:56` |
| 3 | No arrow hint; ArrowUp/Down move one place, not one row | `Dashboard.tsx:196-205` (`rowStep`), hint `:313` | `shakedown25.test.tsx:95` |
| 4 | Tab out of an open DatePicker leaves the panel open (P11-2) | `core/src/components/Popover/Popover.tsx:376-387` (`closeOnTabOut`, reason `"tab"`) | `core/tests-unit/datePickerKeyboard.test.tsx:70` "Tab out of an open panel"; `popover.test.tsx:282` |
| 5 | Every MultiSelect option its own Tab stop (P10-7) | `core/src/components/MultiSelect/MultiSelect.tsx:321-341` (one stop, roving) | `core/tests-unit/multiSelectListbox.test.tsx:31` "has one Tab stop, which roves" |
| 6 | MultiSelect panel buttons throw focus to the search box (README 36) | `MultiSelect.tsx:270,612-635` (`onMouseDown={keepFocus}`) | no named test read; the code keeps focus |
| 7 | DateTimePicker hour/minute is a textbox, not a spinbutton (P10-5) | `core/src/components/DatePicker/TimeField.tsx` | `datePickerKeyboard.test.tsx:2` header: "the time fields are spinbuttons" |
| 8 | Toast Alt+T not visible (P11-4, decision 6) | `core/src/lib/language/wording.ts:1130-1131`, shown at `Toast.tsx:489` | `core/tests-unit/toast.test.tsx:637` (Alt+T moves focus in, Escape gives it back) |
| 9 | `Button loading` drops focus (core-screens 2, README 31) | `core/src/components/Button/Button.tsx:51-55` (`aria-disabled`, not `disabled`) | the code comment at `:52` |
| 10 | Typing into a valued Combobox appends | `core/src/components/Combobox/Combobox.tsx:324-331` (select on focus) | `core/tests-unit/comboboxReplaceLabel.test.tsx:18` |
| 11 | Cypress `{esc}` does not close a Modal (qa 6) | `core/src/lib/dialogChoreography.ts:159`, wired at `Modal.tsx:167-173` | the code (synthetic Escape handled) |
| 12 | WebKit mouse-opened Modal has no focus return (qa 7) | `dialogChoreography.ts:18-30,118` (`openerToRestore`) | `core/tests-unit/dialogOpenerPressed.test.tsx:30,60,74` |
| 13 | `{open && <Modal open>}` loses focus return (README 33) | `dialogChoreography.ts:104-118` | `core/tests-unit/dialogs.test.tsx:94` "returns to the opener when the open Modal unmounts" |
| 14 | Escape closes a popover and the foreign dialog together (B2) | `core/src/lib/portalTarget.ts`, `Popover.tsx` | `core/tests-unit/overlaysInForeignPlaces.test.tsx:63` "lets Escape close the top layer and not the dialog" |
| 15 | No Ctrl+A in the grid | `table/src/gridKeys.ts:177-183` | code; select-all call guarded by `input.selectAll` |
| 16 | No `aria-colcount` | `table/src/frame.tsx:290` | `table/tests-unit/gridKeepsFocus.test.tsx:148` "counts the columns of the grid" |
| 17 | Group header row unreachable by arrows (README 36) | `gridKeys.ts:12-14,52-57,124-125,192-193` | `gridKeepsFocus.test.tsx:93` |
| 18 | Space on a grid header scrolls; no Cmd+Arrow | `gridKeys.ts:185-188,198-202` | `gridKeepsFocus.test.tsx:109,116` |
| 19 | Menu / RowActions do not open on ArrowDown (README 36) | `core/src/components/Menu/Menu.tsx:107,146` | code |
| 20 | Ctrl+Home in a virtual grid; focused row scrolled out of the window (README 27) | `table/src/virtualBody.tsx:56-82` | `table/tests-visual/virtual-grid-focus.spec.ts:22,31` (both `@quick`) |
| 21 | Schedule: keyboard lane change (schedule.md 5), taken into the spec | `schedule/src/sceneKeys.ts:183-210` (Alt+Up/Down proposes `kind: "lane"`) | no test read |

Focus-ring items also changed in source: the sort-header ring is now inset with a comment about the clipping (`table/src/Table.module.css:557-561`); the danger button's ring now uses the accent colour (`core/src/components/Button/Button.module.css:61-65`). Whether the ring looks right is only seen in a screenshot, so those two lines are code-fixed, visually not confirmed.

## Stands

| # | Record | Source now | Smallest change | Breaks a caller? |
|---|---|---|---|---|
| S1 | Chart legend after the plot in Tab order though drawn above (P11-8) | `charts/src/styles/charts.css:373-411` places `.uc-legend-top/left` with `order: -1`; `charts/src/Chart.tsx:10` says "placed ... through CSS order" | Render the legend before the plot in the DOM when its placement is top or left, drop the CSS order. One component, about 5 lines. | No for the API; a caller's own CSS or test selector on child order could shift. |
| S2 | Tab+Enter alone cannot change RadioGroup, SegmentedControl, Tabs, Slider (P11-3) | Arrow-only by design; `spec.md` decision 6 "not built" | Declined expressly (APG pattern). If reversed: a mode where focus selects (Tabs `activation="auto"` is the usual), per widget. | Yes, if focus-selects became the default; no as an opt-in prop. |
| S3 | Toast action (Undo) far in the Tab order (P11-4) | Region is one tab stop reached by Alt+T (`useRegionFocus.ts:26-27`); action sits inside the deck | Declined in `spec.md` decision 6 ("a toast near its trigger is not built"); Alt+T and its visible hint are the remedy. | n/a (declined) |
| S4 | Schedule keyboard: no lead-in / lead-out change | `sceneKeys.ts:183-210` knows move, end, lane only | A new Alt-chord and intent kind in the same function, about 20 lines plus a test. Only if the drag already reports such an intent; otherwise a wish. | Adds an intent kind to `onIntent`; callers with an exhaustive `switch` on `kind` would fail typecheck. |
| S5 | Shift+Space / range selection in the grid (audit-family 6, rest) | Space selects the row, Ctrl+A all (`gridKeys.ts:177,198-202`); no Shift range | Declined: range selection is in "Decided and kept" (ADR-0032). | n/a (declined) |

## Cannot be told without running it

- **Virtual grid under a live re-sort drops focus to body** (audit-family 2, README 27 part): `virtualBody.tsx:56-94` focuses by `data-row` index only on a key; the `gridKeepsFocus` test at `:42,57` covers a removed row, not a re-sort. Whether the focused element survives a re-sort depends on keyed remount in the browser.
- **Focus rings as two systems** (P11-7, decision): the sources show two `box-shadow` forms (outset and inset, e.g. `Table.module.css:244,561`); whether that reads as one system is a screenshot judgement.
- **Skip link's browser blue ring** (Chromium-confirmed 9b): no skip link exists in `core/src`; it belongs to the demo shell or the host page, outside the library surface.
- **Popover with a focused input kept above the on-screen keyboard** (mobile-touch 3): device only, listed so in `spec.md`.

## Notes

- `MultiSelect.tsx` panel items 5 and 6 are the same change set (the panel is now a listbox, per `spec.md` "Decisions taken alone").
- Items marked "code" in the last column have no named test found by grep; the claim rests on the source line.
- Out of scope here (not keyboard or focus): sort/export silence, picked-date announcement, muted-text contrast.
