# 07: Combobox, MultiSelect, Select and search

Status:     ready-for-agent
Blocked by: 01

Spec: `../spec.md`. Sources: README 28, 36 (MultiSelect), P29 3-4; earlier-runs-open core C (Combobox
appends), qa 8 (names), P10-7, P12-6, settle 12a.

- [ ] Search and `filterOptions` fold case and diacritics on both sides ("cafe" finds "Café", "strasse" finds "Straße", "muller" finds "Müller"); spans index the original name even where folding changes its length ("İstanbul"). One folding helper in `core/src/lib/search.ts`, used by `lib/options.ts`.
- [ ] Typing into a Combobox that has a value replaces the label (the text is selected on focus and on the first keystroke), not "zBeta".
- [ ] MultiSelect: the panel's buttons (view all, selected, all, none, invert) keep focus where it was and announce what they did; "view all" and "select all" have different names; the panel is named by the field's label, not its placeholder; options are a listbox of `option`s with `aria-selected` (not a group of checkboxes) and one Tab stop with roving focus; one scroll container at 320×256.
- [ ] DatePicker and MultiSelect dialogs are named after their field ("Due date", "Cities"), not "Select date"/"Select".
- [ ] Select's panel is as wide as its field.
- [ ] `pnpm check core`; looked at as a user, light and dark, 375 px.

## Comments
