# Shakedown 2026-10-31: core and table at 0.51.0

Status: needs-triage

Procedure: `docs/agents/shakedown/`. Core and table packed at 0.51.0; ten subagents on Sonnet, each in its
own host (or, for the two bug hunters, an export of the repo): H7 table host, H8 export oracle, H4+H6
overlays and lifecycles, H5 forms, P10+P11 keyboard and screen reader, P2 Kai (orders screen, live data),
P9 ten everyday screens, P22 grid specialist, and two new reviewers, **P28 table bug hunter** and **P29 core
bug hunter** (read the source, prove each suspicion with a red vitest). The hosts were throwaway (session
scratch). ✓ = reproduced by the coordinating session (rerun of the host's red test or script) or confirmed
in the source; unmarked = a lead with a red in the host, not rerun.

Focus asked for: first bugs and behaviour a user would not expect, then what is missing to stand beside
AG Grid / MUI X / Mantine.

## 1. Defects, ranked by harm

### Break - wrong result, lost work, crash

1. ✓ **A dialog inside a dialog closes both.** A `ConfirmDialog`, `Modal` or `CommandPalette` rendered as a
   React child of a `Modal`/`Drawer`: Cancel, Escape, backdrop, Confirm and a palette choice all call the
   outer `onClose` too (log `confirm-ok, outer-close`). React's synthetic `close`/`cancel` bubble through the
   React tree; `onDialogClose`/`onDialogCancel` (`core/src/lib/dialogChoreography.ts:76,84`) do not check
   `event.target === event.currentTarget`. Every "edit dialog with a delete confirm" (H4, P2 independently).
2. ✓ **ISO week numbers wrong on ~64 % of days.** `isoWeek` (`table/src/model/grouping.ts:239`) has the sign
   of the 4-January weekday term flipped: 2026-10-14 → week 41 (is 42), 2024-12-30 → "Week 0", 2026-12-31
   → 52 (is 53); 2559 of 4015 days 2020-2030 wrong. Every `GroupBy` by week and `periodText("week")`. No
   test names `isoWeek` (P28, H7 independently).
3. ✓ **`onSelectionChange` / `selection.count` disagree with the toolbar.** Select all 60, search: toolbar
   "11 selected", callback and count 60 - a "Delete selected" built on the callback deletes 49 hidden rows.
   Rows removed from `rows` stay as keys (count 4 after deleting 3 of 4; never reported), and an id that
   comes back (refetch, undo) is selected again. `model/useTableSelection.ts:130`, the effect in
   `useTable.tsx:~636`. Server mode clears the selection on a search, client mode keeps it (P28, H7, P2, P22).
4. ✓ **Fitted server page + "select all" oscillates** (new in 0.51.0). The "Select all N that match" line
   costs a row: the fitted page drops 8 → 7, a new request goes out, the ticked 8th row vanishes, toolbar
   "8 selected" beside "All 7 on this page are selected"; Next can land back on page 1 (`matchOffer.tsx`
   and the fit) (H7, P2).
5. ✓ **`<Combobox value={undefined}>` crashes the whole tree** (`Cannot read properties of null (reading
   'label')`), `Combobox.tsx:132`: `kept?.value === value` is true for `undefined`. A form reset to `{}`, an
   RHF `Controller` without default. Every other field shrugs. Also (lead): `DatePicker` with an Invalid
   Date throws `RangeError: Invalid time value` (H5, P9).
6. ✓ **NumberInput wipes its value in es, sv, nb, hr, fi.** `separatorsOf` (`core/src/lib/language/
   formats.ts:266`) measures 1234.5, which Spanish does not group → no group separator known, then
   "12.345,6" reads back as `null`, focus+blur emits `onChange(null)`. sv/nb/hr/fi write negatives with
   U+2212, `Number("−5")` is NaN (P29).
7. ✓ **ConfirmDialog `onConfirm` fires twice on a double-click** - the buttons stay live during the exit
   animation; the app's second call threw `TypeError` (P2). And `loading` ("locks the actions") does not lock
   Escape; focus drops to BODY when Confirm turns disabled (H4, `ConfirmDialog.tsx:51-59`).
8. ✓ **DatePicker / DateRangePicker: focus falls to `<body>`** when PageUp/arrows leave the month and the old
   day is not in the new view (today: Oct 31 → PageUp). The keys are dead until Tab. `Calendar.tsx:114`
   refocuses only if the grid still `contains(activeElement)` - the button was unmounted (P10/11).
9. ✓ **`autoSizeColumns()`, "Fit all columns" and the grip double-click never shrink** a column that has a
   `width` or `flex` - it grows by 1 px (300 → 301); the table overflows its frame. `flexWidths.ts:96-118`
   clears the head's width but measures the body `.value` box at `--_table-width` (P22).
10. ✓ **Editing a cell whose row a live update removes**: the typed value is dropped without `onCellEdit` or a
    word, focus falls to BODY, arrows dead (H7).
11. ✓ **A clamped page springs back.** Page 10 of 10, rows shrink to 75 → shown page 8; 100 rows return →
    page 9. The requested page is clamped only for display (H7).
12. **An open Modal under `<Activity mode="hidden">` or a re-suspending Suspense** stays `:modal` with
    `display:none`: the whole page is inert and blank. No cleanup closes the dialog (H4).
13. ✓ **Forms: Combobox, MultiSelect and the four pickers do not reach `FormData`** (known B1 of 2026-10-24,
    never decided): `name` lands on a button, or on the Combobox's text input - which posts the *label*
    ("Beta"), not the value. No hidden input anywhere in core (H5).
14. ✓ **Slider snaps off its grid** when `min` has decimals (`min=0.5, step=1`: ArrowRight 0.5 → 3), and
    `step=1e-7` rounds to integers; `decimalsOf` reads only the step (`Slider.tsx:41`) (P29).

### Trap - silently wrong, no word

15. ✓ **Aggregates and sort over numbers-as-strings**: a qty column with `3` and `"3"` sums only the numbers
    (143 instead of 220) and sorts as text (1, 1, 10, 10, 2); the dev warning checks only the first value
    of a formatted column (P2, P28).
16. ✓ **A `TextCondition` with `join: undefined` is dropped** - all rows stay, no warning; `{terms, join:
    state.join}` is the natural way to write it (`columnFilter.tsx:597`, `"join" in condition`) (H8).
17. ✓ **Ctrl+C copies nothing after clicking a cell** of a selectable (non-grid) table: focus is on BODY, the
    handler sits on the frame (`frame.tsx:246`). The docs name no focus condition (H8).
18. ✓ **A cleared sort comes back** after `view` → `initialView` when `defaultSort` is set: an empty sort is
    omitted from the view (`tableState.ts:425`) and the default is restored (P28).
19. **The date editor drops the time** of a date-time column (01:30 → 00:00); `EditFor` has no date-time
    editor (P22).
20. **NumberInput: a parent value set while the field is focused is ignored, and the stale text overwrites
    it on blur** (77 → 12); pasting "1.234,56" under fr-CH empties the field; "0,5" under en gives 5 (H5).
21. **DateTimePicker time fields mangle a paste** ("30" → 0, "14:30" → 23) (H5).
22. **`form.reset()`**: an uncontrolled Slider keeps its value; FileInput still lists the file the form
    emptied (H5).
22a. ✓ **react-hook-form `setFocus` does nothing on RadioGroup and SegmentedControl**: the ref is the
    `radiogroup` element (ADR-0068), which is not focusable, so a library's `ref.focus()` - focus on the
    first invalid field - goes nowhere (`RadioGroup.tsx:91`, `SegmentedControl.tsx:108`). The group could
    pass focus on to the checked (or first) option (H5).
23. ✓ **Docs drift**: `table/docs/llms-full.md:540` promises the export "with its groups" - grouped tables
    export ungrouped (H8); llms-full "Known limits" still says "No text filter per column" (P22).
24. **A date-time column changes export format with the filter** (ISO instant in the full export, a plain day
    when a search leaves only midnight rows) - decided by the data, not the column (H8).

### Misfit - works, but not as expected

25. ✓ Server mode with `rowCount: 0` keeps "page 4 of 1" and requests page 4 (`tableModel.ts:353`) (P28).
26. ✓ `flexShares` gives `NaNpx` for `flex: 0` (`flexWidths.ts:17`) (P28).
27. ✓ Ctrl+Home in a virtual grid without `stickyHeader` focuses the header but leaves the body scrolled to
    the end; focus is lost when the focused row scrolls out of the window (P10/11, H7).
28. ✓ Search and `filterOptions` fold no diacritics ("cafe" ≠ "Café", "strasse" ≠ "Straße"); "İstanbul" is
    not found at all (lower-casing changes its length) (`lib/search.ts`, `lib/options.ts`) (P29).
29. ✓ TreeView: checking while a filter is active also checks the hidden nodes (`treeModel.ts`) (P29).
30. ✓ NumberInput: ArrowUp from 0.2 by 0.1 emits 0.30000000000000004; `clampNumber` rounds -2.5 to -2 (P29).
31. ✓ `Button loading` sets `disabled`, so a focused submit drops focus to BODY (still open from 10-24) (P9).
32. ✓ Checkbox has no `invalid`: in a `FormField` with an error it stays grey, no `aria-invalid` (still open);
    Checkbox/Switch in a FormField get two labels in their name (P9).
33. `{open && <Modal open>}` loses focus return (focus BODY) (H4).
34. Modal scroll lock claimed in the comments does not exist - the page scrolls behind (B6, still open);
    a Popover inside a foreign (Radix) modal is unclickable (B2, still open) (H4).
35. ✓ The closed CommandPalette keeps its `<dialog>` and a second `aria-label="Search"` in the DOM (P9);
    `useCommandPaletteShortcut` fires on "/" typed in a shadow-root input (H4).
36. Accessibility: a picked date is not in the trigger's name (P10-3 of 10-24, still); sort, fold, selection
    and cell validation are silent; Menu/RowActions do not open on ArrowDown; the text filter's two terms
    are both "Operator"/"Value"; MultiSelect's panel buttons throw focus to the search box; the group header
    row is unreachable by arrows (P10/11).
37. Look: muted text `#8b8b8b` is 3.26:1 (FormField hint, placeholders, weekday heads), 4.06:1 in dark; a
    disabled primary in dark is the brightest thing on the bar; an unchecked radio draws as a rounded square
    (still open) (P10/11, P9).
38. Smaller: one click opens the editor with the caret at the end, so typing appends (49 + 0 = 490); the
    pager's `role=status` keeps the old range after a shrink; a fitted page does not refit while focus is in
    the grid (0.51.0 rule); the Σ footer scrolls away; `editOptions` as an object crashes the page; Space on
    a grid header scrolls; no Cmd+Arrow on macOS; typed dates in ar-EG/fa and Lord Howe's 30-minute DST
    (P22, P2, H7, P10/11, P29).

### Added after the first write-up

A second wave: **H11 form libraries** (the same 15 fields in TanStack Form, react-hook-form, Formik and
Conform; matrix `form-libraries-matrix.md`), and the open defects of the earlier runs, checked against 0.51.0
and settled in Chromium (`earlier-runs-open.md`).

39. ✓ **MultiSelect and the three pickers call `onBlur` when their panel opens** - focus moves into the
    panel, `onBlur` rides `...rest` on the trigger. Every blur/touched validation (TanStack, RHF `onBlur`,
    Formik, Conform) shows "required" while the user is picking, and keeps it after a valid pick (H11).
40. ✓ **The types forbid `name` on Combobox, MultiSelect and the pickers** (props on `HTMLAttributes`, which
    has no `name`), so spreading Formik's `field` does not compile; untyped, Formik's `handleBlur` falls back
    to the FormField id and those fields never become touched (H11).
41. **NumberInput posts its display text** ("1,234.5", "1.234,5") to `FormData`; `Number()` gives NaN (H11).
42. ✓ **An unchecked radio draws as a rounded square** - the build's `ownStyles()` adds `corner-shape:
    squircle` to every radius, and `RadioGroup.module.css` does not set `round` as Badge and Stepper do
    (settled; two hosts saw it).
43. ✓ **Schedule: a wrong-typed `domain` (Dates, strings) or `subtasks` as an object** crashes the whole tree
    with `instant.getTime is not a function` / `layer.data is not iterable`, no dev warning (settled).

H11's verdict: value types are right on all 15 fields in all four libraries; TanStack validators,
`mode="array"` and `form.Subscribe` work; `form.reset()` restores every field; the glue is about 8 lines per
library, 60 for Conform (form participation missing).

## 2. Wishes - what is missing for the top tier

Ranked by how often real apps reach for it. All three proofs stand in the agents' reports (session scratch).

**Table** (matrix: `table-feature-matrix.md`, updated to 0.51.0):

1. **Wrapped text / auto row height** - a comments or address column of three lines. AG `wrapText` +
   `autoHeight`, MUI `getRowHeight: 'auto'`. Unlisted (llms-full states "nothing in a cell wraps" as a fact).
2. **Date-time and boolean editors** - MUI `dateTime`/`boolean` column types, AG `agCheckboxCellEditor`.
3. **Server-side grouping and lazy tree branches** - AG SSRM, MUI Premium. Not yet (README).
4. **Custom header content and a per-column header menu** - AG `headerComponent`, MUI `renderHeader`.
5. **A per-row `disabled`/`hidden` on `Action`** - MUI `GridActionsCellItem`.
6. **A live announcer for sort, fold and selection** - AG `ariaLiveRegion`.
7. **More than two AND/OR terms; conditions on range filters** - AG, MUI filter builder.
8. Pinned footer (the Σ row scrolls away at 50 rows) - new evidence on the decided "pinned rows".
9. Tab through grid cells for switch users - AG `tabToNextCell` (ADR-0034 decided "grid on request").

Re-verified, still on the decided "not taken now" list without new evidence: range selection, paste and
Delete, fill handle, header drag, context menu, infinite scroll, column virtualisation, styled Excel, pivot.
P22's verdict: enough for monitoring, ops, back-office CRUD, report grids with groups and totals,
server-paged lists; not for spreadsheet-style finance work or BI grids.

**Core** (coverage diff against MUI, Mantine, Radix: `core-coverage-diff.md`):

1. **Native form participation** - hidden inputs so Combobox, MultiSelect and the pickers post their value
   (defect 13; React 19 actions and server actions depend on it).
2. **Input start/end adornments and a PasswordInput** - Mantine `PasswordInput`, MUI `InputAdornment`.
3. **Avatar and a List/ListItem row** - MUI, Mantine, Radix.
4. **AppShell/NavLink and `useMediaQuery`** - Mantine.
5. **Pagination as a core component** (the table's cannot serve a plain list).
6. **An icon set** (eye, search, bell, user, upload, trash).
7. **TimeInput, typed DateInput, RangeSlider, PinInput, TagsInput, Chip** - Mantine.
8. **A creatable Combobox** (free text as a value) - MUI Autocomplete `freeSolo`.
9. **A clickable Stepper; FileInput with per-file progress (Dropzone)** - MUI `StepButton`, Mantine Dropzone.

## 3. What held up

- Overlays: Menu in Modal in Drawer, Popover with a DatePicker, palette and confirm as siblings - Escape
  peels one layer, focus returns; Modal `autoFocus` (0.50.0) works, also in StrictMode; no leaks after 100
  mount/unmount cycles; shadow root and iframe work with `portalTarget`; Popover clean in overflow,
  transformed, sticky and scrolling containers.
- Forms: react-hook-form `register`/`Controller`/`reset`/errors; DST and Feb 29 in the date-time pickers; a
  backwards range swaps; MultiSelect with 10k options (98 ms, select-all-while-filtered exact); Playwright
  `.check()` without `force`.
- Number round trip in en-GB, de, fr-CH, de-CH, pl, pt-PT; typed dates in ten locale orders and three zones.
- Table: 100k rows (first paint 350 ms, sort 136-190 ms prod, CSV 144 ms); server mode's stale-answer
  guard, retry, debounce, one request per resize; column groups, pinning, flex, hide and resize stay aligned;
  text filter operators on null/""/Unicode; the CSV oracle matched byte for byte in 13 view modes and both
  languages; XLSX opens in exceljs and SheetJS with types intact and no formula; `aria-rowcount`/`rowindex`
  right when paged, searched, grouped and virtual; German complete everywhere; edit drafts survive live
  ticks; `pageLines` property test (fast-check) holds.

## 4. Not covered

WebKit (cached build mismatched), Firefox, touch, real screen readers, strict CSP, a long-lived tab, print,
tree rows in H7, xlsx edge cases beyond types. No global download was made; the hosts' `node_modules` were
removed after the run.
