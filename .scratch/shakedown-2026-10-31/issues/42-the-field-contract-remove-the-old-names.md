# 42: The field contract - the old names go (contract step)

Status:     ready-for-agent
Blocked by: 41, and the release that ships 01-03 (see `../run.md`, "The release")

Spec: `../spec.md`, decision 1; ADR-0066 (a renamed name lives one minor and warns).

**What to build:** the last step of the wide rename. Once a release has shipped `onValueChange` beside the
deprecated `onChange(value)`, the deprecated names leave in the next minor.

- [ ] The deprecated `onChange(value)` on NumberInput, the pickers, Combobox, MultiSelect, Select, Slider (value form), SegmentedControl, RadioGroup and FileInput is removed with its DEV warning; `onChange(event)` stays on native-backed fields.
- [ ] `grep` finds no deprecated name in the workspace; the tests that asserted the deprecation go with it.
- [ ] `Changelog core Changed:` with a `Migration:` line ("rename `onChange` to `onValueChange`"); the ADR of 01 notes the step taken.
- [ ] `pnpm check`, `pnpm typecheck`, `pnpm check:site`. Merged to `main`; it ships with the next release, not this run's.

## Comments
