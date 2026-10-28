# 06: Core's fields warn in DEV when a value or an option has the wrong shape

**What to build:** A beginner who passes the wrong shape gets one sentence naming the prop and the expected shape, not a white screen or an empty control. With core's existing warn-once helper and ticket 18's rule (warn where the package sees the mistake as it happens): a non-`Date` value on DatePicker, DateRangePicker and DateTimePicker; a non-array value on MultiSelect; strings in `options` of Combobox and MultiSelect; a string `value` on NumberInput and Stat. Where a wrong shape crashes today, the control renders as empty instead. Misspelt `variant` and `size` stay with TypeScript. Spec: `../spec.md` ("DEV warnings for props"); repro cases: `../personas/p1-lena.md` 3 and 4 (`dp-string`, `ms-valuestr`, `ms-strings`, `cb-strings`, `num-string`, `stat-string`).

**Blocked by:** 04 (NumberInput)

**Status:** ready-for-agent

- [ ] A component test per case: the warning names the prop and the expected shape, fires once per instance, and nothing throws
- [ ] No warning for the right shapes (existing tests green, no new console output)
- [ ] The warnings are silent in a production build (as the existing helper is)
- [ ] Commit body: `Changelog core Added:` line
