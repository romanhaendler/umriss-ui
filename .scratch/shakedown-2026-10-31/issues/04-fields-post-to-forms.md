# 04: Fields post their value to forms - `name`, hidden inputs, `formValue`

Status:     done
Blocked by: 01

Spec: `../spec.md`, decision 3. Sources: README 13, 40, 41; H11 matrix (`../form-libraries-matrix.md`,
Conform column); earlier-runs-open core B1.

**What to build:** a core field inside a native `<form>` or a React 19 `<form action>` arrives in `FormData`
with its value, as a native control would.

- [x] `name` is allowed in the types of every field (Combobox, MultiSelect and the pickers declare it, so spreading Formik's `field` compiles).
- [x] With `name` a field renders a hidden input posting decision 3's formats: Combobox the value (not the label); MultiSelect one entry per value; DatePicker `YYYY-MM-DD`; DateTimePicker ISO with the offset; range pickers `<name>Start`/`<name>End`, both names overridable; NumberInput the plain number (not its display text); empty `""`.
- [x] `formValue={(value) => string}` replaces the default format on every field.
- [x] Unit tests: `FormData` of a form holding every field, names and values exactly as decision 3; a browser case driving a React 19 `<form action>`.
- [x] `pnpm check core`, `pnpm typecheck`, `pnpm check:site`; a "Forms" example in core's demo (native form with an action) looked at as a user.

## Comments

**Delivered (2026-10-31, run coordinator).** `name` typed on Combobox, MultiSelect and the four pickers;
hidden inputs from one shared `core/src/lib/FormPost.tsx` (NumberInput, Combobox, MultiSelect, pickers):
Combobox the value, MultiSelect one entry per value, `YYYY-MM-DD`, ISO with offset in the formats' zone,
the plain number, `""` when empty; range pickers `<name>Start`/`<name>End`, overridable by `startName`/
`endName`; `formValue` on those seven. `formPost.test.tsx` checks FormData incl. a React 19 `<form
action>`; demo "Post to a form" on FormField (looked at: the posted entries print under Send).
Decided: `formValue` is never called for empty (always `""`); empty MultiSelect posts one `""`; a disabled
field posts nothing, as a native one. Left: no Playwright case - the jsdom form action test and the
worker's Chromium run cover it; table/alarms editors get no `name` (not asked).
