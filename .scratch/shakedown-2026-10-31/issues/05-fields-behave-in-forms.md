# 05: Fields behave in forms - reset, blur, focus, `invalid`, one name

Status:     ready-for-agent
Blocked by: 01

Spec: `../spec.md`, decision 2. Sources: README 22, 22a, 32, 39; H11 matrix (`../form-libraries-matrix.md`);
earlier-runs-open core-screens 3. Reds: `../reds/h11-form-libs/` (`t4`, `t5`, `t6`, `t10`, `t14`, `t16`,
`t17`), `../reds/h5-forms/` (`t15`, `t17`, `t18`).

**What to build:** with TanStack Form, react-hook-form, Formik or a plain form, every core field resets,
validates on blur, takes focus on error and shows its error like a native control.

- [ ] The form's `reset` event restores the default of every field - Slider (today keeps the user's value) and FileInput (today lists a file the form emptied) included; `onValueChange` reports it.
- [ ] `onBlur` fires only when focus leaves the whole field - trigger and panel - on MultiSelect, Combobox and the four pickers (today on opening the panel).
- [ ] `ref.focus()` on RadioGroup and SegmentedControl focuses the checked option, else the first (react-hook-form `setFocus`); the ref stays the group element (ADR-0068).
- [ ] Checkbox takes `invalid` and reads `FormField`'s error (`aria-invalid`, the error border); RadioGroup's options draw the error look.
- [ ] A Checkbox or Switch inside a `FormField` has one accessible name, not "Terms I accept the terms".
- [ ] Combobox with `clearable`: clearing the text and leaving the field gives `null`, not the old choice.
- [ ] Unit tests for each; the H11 drivers rerun green against all four libraries.
- [ ] `pnpm check core`, `pnpm typecheck`.

## Comments
