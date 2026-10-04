# 03: Every core page that can be configured opens with a configurator

Status: ready-for-agent
Blocked by: 02 (Nine more configurators)
Spec: `.scratch/configurator/spec.md`

**What to build:** The owner found the ten configurators uneven: Button has one, Textarea and DatePicker do not. The rule that replaces the spec's fixed list of ten: **every core page whose component has at least three props that a control can set and whose effect shows without state of the reader's own opens with a configurator.** Value props that need wiring (`value`/`onChange` pairs, option lists, callbacks, nodes beyond a short text) do not count towards the three; `size`, variants, tones, booleans (`disabled`, `clearable`, `required` …), bounded numbers, short strings (`placeholder`, a label) do. Pages whose component does not reach three (layout primitives such as Stack and Grid, Dock, TreeView, Toast, CommandPalette, Modal/Drawer whose effect needs opening) stay without one — no placeholder, no empty slot.

Expected to qualify (the implementing agent confirms each against the rule and its props table): Textarea, NumberInput, Slider, RadioGroup, FileInput, Select, Combobox, MultiSelect, DatePicker, DateTimePicker, DateRangePicker, DateTimeRangePicker, Spinner, Skeleton, Divider, Card, Typography, Tooltip, Tabs, Stepper, EmptyState, Stat, Sparkline, Breadcrumb, Accordion. Charts, table and schedule stay without configurators (the spec's decision holds there).

Where a control needs a value to show anything (a picker needs a value to show `clearable`), the declaration gives a fixed starting value, as the existing nine do for their children text.

**Batches** (each its own worktree, run in parallel): A — Forms (Textarea, NumberInput, Slider, RadioGroup, FileInput); B — Choosing and Dates and times (Select, Combobox, MultiSelect, the four pickers); C — the rest of core (Spinner, Skeleton, Divider, Card, Typography, Tooltip, Tabs, Stepper, EmptyState, Stat, Sparkline, Breadcrumb, Accordion).

- [ ] Every qualifying core page opens with a configurator; every non-qualifying page is named in this ticket's report with the reason it does not reach three.
- [ ] Each configurator's code under the stage omits defaults and matches the props table; axe passes with each configurator; the jsdom smoke test lists every configurator.
- [ ] The coverage gate stays green; entries a configurator now shows are removed from `packages/core/demo/unshown.json`.
- [ ] New `configurator-*` pictures (light and dark) checked in and looked at; the former first examples are titled and their pictures renewed.
- [ ] lint, typecheck, `pnpm test:unit` and the core visual suites green.
