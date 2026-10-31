# 07: Combobox, MultiSelect, Select and search

Status:     done
Blocked by: 01

Spec: `../spec.md`. Sources: README 28, 36 (MultiSelect), P29 3-4; earlier-runs-open core C (Combobox
appends), qa 8 (names), P10-7, P12-6, settle 12a.

- [x] Search and `filterOptions` fold case and diacritics on both sides ("cafe" finds "Café", "strasse" finds "Straße", "muller" finds "Müller"); spans index the original name even where folding changes its length ("İstanbul"). One folding helper in `core/src/lib/search.ts`, used by `lib/options.ts`.
- [x] Typing into a Combobox that has a value replaces the label (the text is selected on focus and on the first keystroke), not "zBeta".
- [x] MultiSelect: the panel's buttons (view all, selected, all, none, invert) keep focus where it was and announce what they did; "view all" and "select all" have different names; the panel is named by the field's label, not its placeholder; options are a listbox of `option`s with `aria-selected` (not a group of checkboxes) and one Tab stop with roving focus; one scroll container at 320×256.
- [x] DatePicker and MultiSelect dialogs are named after their field ("Due date", "Cities"), not "Select date"/"Select".
- [x] Select's panel is as wide as its field.
- [x] `pnpm check core`; looked at as a user, light and dark, 375 px.

## Comments

**Delivered (2026-10-31, run coordinator).** One `fold()` in `lib/search.ts` for search and
`filterOptions` (case, diacritics, ß, İ; spans index the name as written); Combobox selects its label on
focus, click and first key; MultiSelect panel: buttons keep focus and announce "N selected", scope button
"View all", named by the field, one scroller at 320×256, options a listbox (`option`, `aria-selected`,
one Tab stop, roving focus - checked by keyboard in Chromium, looked at in dark and at 375 px); the date
pickers' dialogs named by their field; Select's panel as wide as the field. Decided: the listbox reverses
the checkbox design, so three tests moved their queries to `option`/`aria-selected` (coordinator's call);
Select's panel min-width 0.
