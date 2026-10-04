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

## Comments

### Batch B

Delivered: all seven pages qualify and open with a configurator. Each one is a declaration file in `packages/core/demo/configurators/`, and `configurator.ts` is unchanged.
- **Select**: `size`, `chars`, `invalid`, `disabled`. It starts with `aria-label="Cost centre"` and three `<option>`s, declared as a required `{ node, code }` for `children`. The code writes them one per line. A native select keeps its own choice, so the code needs no state.
- **Combobox, MultiSelect**: `size`, `chars`, `clearable`, `invalid`, `disabled`.
- **DatePicker, DateRangePicker**: `size`, `chars`, `clearable`, `invalid`, `disabled`.
- **DateTimePicker, DateTimeRangePicker**: the same five, with `withSeconds` first.
- Each of these six starts with a fixed value (Nadia Petrova; two people; 14 Oct 2026; 12–16 Oct; 14 Oct 09:42:15; 14 Oct 22:00 – 15 Oct 02:30), so `clearable` and `withSeconds` show at once.

The code always shows the wiring as the reader's own state, for example `<DatePicker aria-label="Delivery date" value={delivery} onChange={setDelivery} />` and `options={drivers}`. These are required `{ node, code }` entries.

On the stage, `configurators/keep.ts` (`keep(Component)`) holds the value itself, starting from the declared one. A choice or the cross therefore does something instead of being a dead click. It is a `.ts` file, so the `*.tsx` glob does not read it as a configurator. Reset returns the controls to their defaults but not the stage's value.

Left out:
- `placeholder`, `emptyText` and `searchPlaceholder`. They are table rows typed `string`, which `controlsOf` refuses; the placeholder would not show anyway beside a starting value. Batch C's text controls can add `placeholder` after the merge.
- Select's `clearable`, which needs a controlled value and `onClear`, as with Input.
- `presets`, which is an array.

Tests:
- The smoke test's list holds the seven, and each renders at rest with only its required attributes.
- Two probes counted on Select's first example standing first, and both moved to TreeView, which has no configurator. They are `checkFirstExample` in `features-page.spec.ts` ("A tree") and the shell's `contents` in `features-shell.spec.ts` ("Tick a selection").
- Select's configurator is named "Charge to" rather than the first example's "Cost centre". The `features-basics` test for Select therefore still finds exactly one field.
- unshown.json is untouched, as the coordinator directed: the gate does not count configurators yet.

Results:
- lint, typecheck and test:unit are green.
- Playwright in ui-light and ui-dark: the screenshot and forced-colours suites, filtered to the seven pages, gave 112 passed.
- The accessibility, features-page, features-shell, features-basics and features-sizes suites passed after the two probes moved.

Baselines (light and dark):
- New: `configurator-{select,combobox,multiselect,datepicker,datetimepicker,daterangepicker,datetimerangepicker}`.
- Renewed for the title: `example-` and `forced-` pictures of `select--select`, `combobox--pick-a-driver`, `multiselect--chips-in-the-field`, `datepicker--pick-a-day`, `datetimepicker--set-an-instant`, `daterangepicker--a-span-of-days` and `datetimerangepicker--a-downtime-window`.
- Renewed for the shift: `example-{select,multiselect}--states` and `example-datetimepicker--{with-seconds,states,with-an-error}`. Also `example-datetimerangepicker--{with-seconds,states,with-an-error}`, `forced-combobox-cursor` and `forced-range`. Their content is unchanged; the viewport pictures scrolled with the page.
