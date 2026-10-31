# 42: The field contract - the old names go (contract step)

Status:     done
Blocked by: 41, and the release that ships 01-03 (see `../run.md`, "The release")

Spec: `../spec.md`, decision 1; ADR-0066 (a renamed name lives one minor and warns).

**What to build:** the last step of the wide rename. Once a release has shipped `onValueChange` beside the
deprecated `onChange(value)`, the deprecated names leave in the next minor.

- [x] The deprecated `onChange(value)` on NumberInput, the pickers, Combobox, MultiSelect, Select, Slider (value form), SegmentedControl, RadioGroup and FileInput is removed with its DEV warning; `onChange(event)` stays on native-backed fields.
- [x] `grep` finds no deprecated name in the workspace; the tests that asserted the deprecation go with it.
- [x] `Changelog core Changed:` with a `Migration:` line ("rename `onChange` to `onValueChange`"); the ADR of 01 notes the step taken.
- [x] `pnpm check`, `pnpm typecheck`, `pnpm check:site`. Merged to `main`; it ships with the next release, not this run's.

## Comments

**Delivered (2026-10-31, run coordinator, after the 0.52.0 release).** The deprecated `onChange(value)`
is gone from NumberInput, the four pickers, Combobox, MultiSelect, SegmentedControl, RadioGroup and
FileInput, with its DEV warning and the shared `DeprecatedOnChange` type; Slider's `onChange` is now the
native input event (the number still comes through `onValueChange`); `onChange(event)` stays on Input,
Textarea, Checkbox, Switch, Slider and Select. The deprecation test case went; five tests that passed
the value form moved to `onValueChange`; ADR-0081 notes the step. Merged to `main` and pushed; ships
with the next minor. Not in this ticket: Tabs, Accordion and Splitter still take `onChange(value)` -
the maintainer asked (2026-10-31) to make them consistent too, as a follow-up.
