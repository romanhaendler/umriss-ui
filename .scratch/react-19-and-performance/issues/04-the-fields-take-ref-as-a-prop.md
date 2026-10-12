# 04 - The fields take `ref` as a prop

Status: done
Type: task
Size: M

Blocked by: 03
Spec: `.scratch/react-19-and-performance/spec.md`, "The floor"; user stories 3, 4, 5

## What to build

The pattern of ticket 03, applied to core's fields - seventeen wrappers:
`Checkbox`, `Combobox`, `DatePicker`, `DateRangePicker`, `DateTimePicker`,
`DateTimeRangePicker`, `FileInput`, `FormField`, `Input`, `MultiSelect`,
`NumberInput`, `RadioGroup`, `SegmentedControl`, `Select`, `Slider`, `Switch`,
`Textarea`.

`Checkbox` and `Textarea` hand out their ref through `useImperativeHandle`;
that stays and reads the `ref` from the props.

Nothing but the wrapper and the type changes: no effect, hook or ref callback
is rewritten because the floor allows it.

## Acceptance

- [ ] None of the seventeen is a `forwardRef` object; each passes the
      pass-through guard at the root it had.
- [ ] `ref` is in each props table and in `API.md`, in the pattern of 03.
- [ ] The existing tests of `Checkbox` and `Textarea` that use a ref pass
      unchanged.
- [ ] No screenshot moves.
- [ ] `pnpm check core` and `pnpm check:site` pass.
