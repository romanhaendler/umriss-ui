# 01: The field contract - the ADR, and the new names beside the old

Status:     done
Blocked by: None (can start immediately)

Spec: `../spec.md`, decisions 1 and 2. Sources: README 5, 22a (react-hook-form), H11 matrix
(`../form-libraries-matrix.md`); earlier-runs-open core B12, "core onChange events vs values".

**What to build:** every core field follows one rule - the state prop names its callback, and the callback
hands over the finished value - while every existing caller keeps working. This is the *expand* step of a
wide rename: the new names stand beside the old; tickets 02 and 03 migrate the callers; removing the old
names is the minor after the release (ADR-0066), not this run.

- [x] ADR "a field's state names its callback": the table of fields and value types of decision 1, `onChange(event)` only on native-backed fields, `undefined` reads as empty, the one-minor rename. Listed in `docs/adr/README.md`.
- [x] `onValueChange` on Input, Textarea, NumberInput, Select, Combobox, MultiSelect, SegmentedControl, RadioGroup, Slider, DatePicker, DateRangePicker, DateTimePicker, DateTimeRangePicker, FileInput; `onCheckedChange` on Checkbox and Switch. Input, Textarea, Checkbox, Switch and Slider keep `onChange(event)` as well.
- [x] Where `onChange(value)` exists today it still works and warns once in DEV, naming `onValueChange`.
- [x] `defaultValue` (or `defaultChecked`) on every field, NumberInput and the four pickers included.
- [x] `value={undefined}` is "empty" on every field: no crash (the Combobox's kept label: `value != null`), no uncontrolled-to-controlled warning (RadioGroup); a DEV warning where a field is switched between controlled and uncontrolled.
- [x] New unit tests per field: controlled, uncontrolled, `undefined`, the old name warns once and still works.
- [x] `pnpm check core`, `pnpm check table`, `pnpm check alarms` (still green on the old names), `pnpm typecheck`, `pnpm check:site` (API.md regenerated). `Changelog core Added:`/`Changed:` and `Migration:` lines in the commit body.

## Comments

**Delivered (2026-10-31, run coordinator).** ADR-0081 "A field's state names its callback"; shared hook
`core/src/lib/useFieldValue.ts` (controlled by the presence of `value`, fixed at first render, a later
switch warns); `onValueChange`/`onCheckedChange` and `defaultValue` on every field; the old
`onChange(value)` works and warns once; `value={undefined}` is empty everywhere; 57 tests in
`fieldContract.test.tsx`. 27 new props listed in `unshown.json` until 02/03 show them.
Decided: ADR-0081 is this one (the next free number), so the server-groups ADR of ticket 38 is 0082;
the range pickers keep `DateRange { from, to }` (renaming the keys to start/end would break every stored
range and the table's range filter for no gain - written into the ADR); Slider's `onChange` keeps the
number with the warning and becomes the native event only in ticket 42; Select's native `onChange(event)`
stays, `onValueChange` gives `string | null`; Input/Textarea with `value={undefined}` are controlled-empty.
