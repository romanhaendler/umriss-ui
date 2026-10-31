# A field's state names its callback

Status: accepted
Date:   2026-10-31

Core's fields answered the same question in four ways. `Input` handed an event to `onChange`,
`Select` an event too, `NumberInput`, `Combobox`, `MultiSelect`, the pickers, `RadioGroup`,
`SegmentedControl`, `Slider` and `FileInput` handed a value to the same name. A host that wires a
form library (react-hook-form's `register` and `Controller`, Formik) had to know, field by field,
which of the two it held; the third shakedown put eleven hosts and a matrix of form libraries
against it (`.scratch/shakedown-2026-10-31/form-libraries-matrix.md`). Some fields were always
controlled, some could not start from a value, and `value={undefined}` crashed the Combobox and
made React complain on the RadioGroup.

## Decision

**The state prop names its callback.** A field has `value`, `defaultValue` and
`onValueChange(value)`; Checkbox and Switch have `checked`, `defaultChecked` and
`onCheckedChange(boolean)`. The callback hands over the finished value, never an event.

| Field | Value | Empty |
|---|---|---|
| Input, Textarea | `string` | `""` |
| NumberInput | `number \| null` | `null` |
| Select, Combobox, SegmentedControl, RadioGroup | `T \| null` | `null` |
| MultiSelect | `T[]` | `[]` |
| Slider | `number` | `min` |
| RangeSlider | `[from, to]` | `[min, max]` |
| TimeInput | `"HH:mm"` or `"HH:mm:ss"` \| `null` | `null` |
| DatePicker, DateTimePicker | `Date \| null` | `null` |
| DateRangePicker, DateTimeRangePicker | `DateRange` (`{ from, to }`) \| `null` | `null` |
| FileInput | `File[]` | `[]` |
| Checkbox, Switch | `boolean` | `false` |

**`onChange(event)` stays only where a native `<input>` or `<textarea>` stands behind the field**:
Input, Textarea, Checkbox, Switch and Slider. It is what `register` and Formik read. Everywhere
else `onChange` is not part of the contract.

**Empty is `null`** (a text field `""`), and an `undefined` from the caller reads as empty: a field
given a `value` key stays controlled when its value goes away, so an application that has no value
yet neither crashes the field nor flips it between controlled and uncontrolled. A field that is
given a `value` after its first render, or loses the key, is warned of in development. The one
exception: `value={undefined}` beside a `defaultValue` is uncontrolled, and the default shows.

**Every field is controlled or uncontrolled**, by `value` or by `defaultValue`.

## The rename lives one minor (ADR-0066)

Where `onChange(value)` exists today it becomes `onValueChange`. This is a wide rename and runs in
three steps: the new names stand beside the old (the old ones work and warn once in development,
naming `onValueChange`); the callers in core, the table and the alarms move over; the old names go
in the minor after the release. `onChange` on Slider is the exception that shows the shape: it hands
a number today, and from the minor that removes the deprecated name it is the native input's
event handler.

The contract step was taken in the minor after 0.52.0: the deprecated `onChange(value)` and its warning are gone.

The range pickers keep `DateRange`'s `{ from, to }`, which the table's `columnFilter` reads too:
renaming the pair's keys would break every range a host stores, for no gain in the contract. A
`Select`'s `onChange` is the native select's event and stays; `onValueChange` reports its option's
value, `null` for the empty option.

## Considered and rejected

- **`onChange(value)` everywhere.** Breaks `register` and Formik on the fields that stand on a native
  element, and makes `onChange` mean an event on `Input` and a value on `Select`.
- **`onChange(event)` everywhere.** A Combobox or a picker has no event that carries its value; a
  synthetic one is a lie the host has to unpick.
- **Controlled only.** Forms with `defaultValues` and plain `FormData` are the common case.
- **Telling "no value" from `undefined`.** A caller who has no value yet would have to write `null`
  and fix a type error for it; `undefined` is what a loading form has.

## Consequences

Every caller of a core field moves from `onChange` to `onValueChange`; the old name warns until it
goes. Hosts get one rule to learn. A field whose application passes `value={undefined}` is controlled
and empty, which differs from React's native inputs: a bare `<Input value={undefined}>` no longer
types freely.
