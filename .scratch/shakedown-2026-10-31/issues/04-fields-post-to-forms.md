# 04: Fields post their value to forms - `name`, hidden inputs, `formValue`

Status:     ready-for-agent
Blocked by: 01

Spec: `../spec.md`, decision 3. Sources: README 13, 40, 41; H11 matrix (`../form-libraries-matrix.md`,
Conform column); earlier-runs-open core B1.

**What to build:** a core field inside a native `<form>` or a React 19 `<form action>` arrives in `FormData`
with its value, as a native control would.

- [ ] `name` is allowed in the types of every field (Combobox, MultiSelect and the pickers declare it, so spreading Formik's `field` compiles).
- [ ] With `name` a field renders a hidden input posting decision 3's formats: Combobox the value (not the label); MultiSelect one entry per value; DatePicker `YYYY-MM-DD`; DateTimePicker ISO with the offset; range pickers `<name>Start`/`<name>End`, both names overridable; NumberInput the plain number (not its display text); empty `""`.
- [ ] `formValue={(value) => string}` replaces the default format on every field.
- [ ] Unit tests: `FormData` of a form holding every field, names and values exactly as decision 3; a browser case driving a React 19 `<form action>`.
- [ ] `pnpm check core`, `pnpm typecheck`, `pnpm check:site`; a "Forms" example in core's demo (native form with an action) looked at as a user.

## Comments
