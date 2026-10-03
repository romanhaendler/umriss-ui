# 04: `invalid` shown on every form control

Status: ready-for-agent
Blocked by: 03 (A prop without an example fails the build)
Spec: `.scratch/props-to-examples/spec.md`

**What to build:** One example "With an error" on each of the 13 pages whose control takes `invalid` — Input, Textarea, NumberInput, Switch, FileInput, Select, Combobox, MultiSelect, DatePicker, DateTimePicker, DateRangePicker, DateTimeRangePicker and the TreeView page for `TreeSearch` — each showing the control invalid inside a FormField with its message. The 13 entries leave core's exception list.

- [ ] 13 new examples, each one file with its own data, a title and a lead, runnable as copied (own-data check green)
- [ ] Each `invalid` row's "Shown in" names its page's new example first
- [ ] Core's exception list no longer holds any `invalid` entry, and the gate passes
- [ ] Screenshot baselines exist for the new examples, light and dark
