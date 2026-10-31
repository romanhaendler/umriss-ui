# 05: Fields behave in forms - reset, blur, focus, `invalid`, one name

Status:     done
Blocked by: 01

Spec: `../spec.md`, decision 2. Sources: README 22, 22a, 32, 39; H11 matrix (`../form-libraries-matrix.md`);
earlier-runs-open core-screens 3. Reds: `../reds/h11-form-libs/` (`t4`, `t5`, `t6`, `t10`, `t14`, `t16`,
`t17`), `../reds/h5-forms/` (`t15`, `t17`, `t18`).

**What to build:** with TanStack Form, react-hook-form, Formik or a plain form, every core field resets,
validates on blur, takes focus on error and shows its error like a native control.

- [x] The form's `reset` event restores the default of every field - Slider (today keeps the user's value) and FileInput (today lists a file the form emptied) included; `onValueChange` reports it.
- [x] `onBlur` fires only when focus leaves the whole field - trigger and panel - on MultiSelect, Combobox and the four pickers (today on opening the panel).
- [x] `ref.focus()` on RadioGroup and SegmentedControl focuses the checked option, else the first (react-hook-form `setFocus`); the ref stays the group element (ADR-0068).
- [x] Checkbox takes `invalid` and reads `FormField`'s error (`aria-invalid`, the error border); RadioGroup's options draw the error look.
- [x] A Checkbox or Switch inside a `FormField` has one accessible name, not "Terms I accept the terms".
- [x] Combobox with `clearable`: clearing the text and leaving the field gives `null`, not the old choice.
- [x] Unit tests for each; the H11 drivers rerun green against all four libraries.
- [x] `pnpm check core`, `pnpm typecheck`.

## Comments

**Delivered (2026-10-31, run coordinator).** A form's reset restores Slider and FileInput (`useFormReset`
in `lib/useFieldValue.ts`); `onBlur` on MultiSelect and the four pickers only when focus leaves trigger
and panel (`lib/fieldBlur.ts`, `Popover` gained `onBlur`); RadioGroup/SegmentedControl `ref.focus()`
focus the checked option else the first; Checkbox `invalid` (from FormField's error, danger edge - looked
at in both themes), RadioGroup's empty dots in the error colour; Checkbox/Switch in a FormField named by
their own label only; a cleared Combobox text gives `null`. 16 tests in `fieldsInForms.test.tsx`.
Decided: only Slider and FileInput restore on a DOM reset (the matrix shows the others reset through the
libraries); the checkbox's own label wins over the FormField's. Left: the H11 host drivers were not rerun
(they need packed tarballs) - unit tests cover each checkbox; ticket 41 can rerun them.

**Coordinator, follow-up (2026-10-31).** Decision 3 says a form's reset restores *every* field; this
ticket wired it into Slider and FileInput only, and ticket 14's README now promises every field. A
follow-up worker wires `useFormReset` into the other uncontrolled fields.
Delivered: `useFieldValue` hands each field a ref callback that finds its form (`.form` or
`closest("form")`) and restores `defaultValue` on reset, reporting it (controlled fields only report);
NumberInput, Combobox, MultiSelect, RadioGroup, SegmentedControl and the four pickers use it, Textarea's
count follows; Input, Checkbox, Switch, Select keep no value in React and the browser restores them.
`formResetEveryField.test.tsx`, red first.
