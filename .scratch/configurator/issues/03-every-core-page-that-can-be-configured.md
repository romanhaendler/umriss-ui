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

### Batch A

Forms. Four pages qualify and now open with a configurator. Each is a declaration in `packages/core/demo/configurators/`, named after its page, with no change to the machinery:
- **Textarea:** `size`, `placeholder`, `chars`, `resize`, `autoGrow`, `invalid`, `disabled`, and the required name `aria-label="Incident summary"`.
- **NumberInput:** `size`, `chars`, `invalid`, `disabled`. The field is controlled (`value` and `onChange` are required), so the declaration's `component` is a small wrapper that holds the number. Through `{ node, code }` the code always writes the pair as state: `<NumberInput aria-label="Parcel weight" value={weight} onChange={setWeight} />`.
- **Slider:** `min`, `max`, `showValue`, `disabled`, with a required name and `defaultValue={40}`. At `min` the track would stand empty.
- **RadioGroup:** `orientation`, `size`, `disabled`, with a required name, `defaultValue="neighbour"` and `options` as `{ node, code }`. The code writes the three options as a literal, so the copied line runs as it stands.

Does not reach three:
- **FileInput:** only `invalid` and `disabled` are value props. `value` and `onChange` need wiring. `multiple` and `accept` are inherited attributes outside the two a configurator may name.

Tests:
- The smoke test's list now has fourteen names and is no longer called closed. Every configurator renders at rest with only its required attributes.
- `features-page.spec.ts`, "The other configurators", has two new cases. NumberInput: "sm" gives exactly `… size="sm" />`, and ArrowUp moves the staged field from 18.5 to 19.5. RadioGroup: the options literal stands in the code, and the starting choice is checked.
- `features-basics`' Slider test now scopes to its example, because the configurator's slider carries the same name. Switch did the same in ticket 02.
- A one-off axe run over the four configurators passed. It was not checked in, because batch C adds the axe test over every configurator.

Results: lint, typecheck and test:unit are green. Playwright ui-light/ui-dark ran screenshots, forced-colours, accessibility, features-page and features-basics, filtered to the four pages and every configurator test: green.

Baselines (light and dark each):
- New: `configurator-{textarea,numberinput,slider,radiogroup}`.
- Renewed for the title: `example-` and `forced-` of `textarea--text-area`, `numberinput--number-field`, `slider--canary-traffic` and `radiogroup--radio-group`.
- Renewed for the one-pixel shift: `textarea--{states,with-an-error,grow-with-the-text,count-the-characters}`, `numberinput--{units-and-decimals,states,keep-a-value-in-range}`, `radiogroup--{descriptions,side-by-side,states}` and `slider--units-and-marks`. Their content is unchanged; I looked at them.

Deviations:
- `unshown.json` is unchanged. The coverage gate (`shownIn.ts`) counts example files only, and a configurator names its props as strings. Removing `TextareaProps.chars` and `TextareaProps.resize` would fail the gate. As agreed with the coordinator, counting configurator controls comes once, after the three batches, as the first step of props-to-examples 06.
- Textarea's `resize` `@default` now reads `"none"` while the field grows by itself, else `"vertical"`. Before, it named `"vertical"` first. The configurator takes the last named value as the effective default, and with the old order it took "none". The meaning is the same.
- Left out on purpose:
  - NumberInput's `decimals`, `min`, `max` and `step`, and Slider's `step`: unbounded number fields would let a reader type a value that breaks the component (`decimals={-1}`, `step={0}`). Batch C's step as a third `bounds` entry can add them.
  - RadioGroup's `name`: a string that is neither `placeholder` nor the children text.
- `packages/core/README.md` still says "ten pages open with a configurator". All three batches would change that line, so it is left for after the merge.

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

### Batch C

Delivered: six new configurators in `packages/core/demo/configurators/`. They are Typography (configures `Text`), Divider, Skeleton, Stat, Sparkline and FormField. The machinery in `packages/demo/src/tooling/configurator.ts` changed in four small ways, each with a unit case in `configurator.test.ts` (the coordinator gave batch C this file):
- A configurator may export `name`, the component it configures, where that is not the page's. Typography.tsx names `Text` and reads `TextProps`.
- `string`, `ReactNode` and `string | number` become a text field. It starts at the declared value, else the default, else empty, and empty is left out of the code. Before, only the children text and `placeholder` could. This covers Stat's `label`/`unit`, Divider's `label`, Skeleton's `width`/`height` and FormField's texts. A function still fails at load time. The old "a node or a string fails" case is now "a function fails".
- A union of `number` with `null`, `undefined` or literals becomes a number field (Stat's `value`, Sparkline's `width`). Sparkline's `"fill"` is not offered: the examples show it.
- `bounds` takes an optional third entry, the step. Stat's `decimals` is `[0, 6, 1]` and Sparkline's width and height step by a pixel.

The declarations:
- Sparkline's required `data` is a `{ node, code }` value.
- FormField's required field is `<Input />` between the tags.
- Stat's tile is a size container and collapsed on the flex stage. Its `component` wraps it in a 240 px box, the width the first example gives it, and the code still shows `Stat` alone.
- `unshown.json` is untouched, as the coordinator said: configurators do not count for the coverage gate yet.

Tests:
- The jsdom smoke list now holds 16 configurators.
- `accessibility.spec.ts` runs axe on the `[data-configurator]` section of every page in `CONFIGURATOR_PAGES`, so batches A and B are covered with no edit of theirs.
- `features-page.spec.ts` has two new cases. Typography's tone "muted" gives `<Text tone="muted">…</Text>`. A typed Divider label shows on the stage and gives `<Divider label="Returns" />`. Sparkline's required data is written as code, and ArrowUp on width writes `width={97}`.

Results: lint, typecheck and test:unit are green. Playwright ui-light/ui-dark ran the screenshots, forced-colours and accessibility suites filtered to the six pages, every configurator's axe case, the page suite and silent-pages: all passed.

Baselines (light and dark each):
- New: `configurator-{typography,divider,skeleton,stat,sparkline,formfield}`. I looked at all of them.
- Renewed for the title: the six former first examples, `example-` and `forced-` each. They are `typography--text-heading-link`, `divider--a-line`, `skeleton--lines`, `stat--a-figure`, `sparkline--beside-a-value` and `formfield--label-and-hint`.
- Renewed for the shift: the other examples on these pages whose picture moved by one pixel because they now lie lower. Their content is unchanged; I checked `stat--unknown`, which went from 220 to 219 px.

Core pages without a configurator, and why (rule: three settable props whose effect shows without the reader's own state):
- Installation, UmrissProvider, Theming, Sizes, Language: guides, with no component to configure.
- Stack and Grid: layout primitives. Their effect needs children, and the ticket excludes them.
- Card: its own props are fold state (`collapsible`, `defaultCollapsed`, `collapsed`/`onCollapsedChange`) and its content is composition. CardHeader's title, eyebrow and divider show only inside a Card.
- Splitter: `min`/`max`/`step` show only while dragging, `defaultValue` only at mount, and the children are two panes.
- Dock: excluded by the ticket. Its tools are data, and place and mode are state.
- VisuallyHidden: invisible by design.
- ButtonGroup: the group's own visible prop is `size`, one (`aria-label` is not seen). SplitButton on the same page would qualify (variant, size, loading, disabled). Opening the ButtonGroup page with a SplitButton would put the wrong component first, so that is left to the owner.
- Spinner: one prop, `size`.
- Toast: shows only when fired. Its options are a call's arguments.
- EmptyState: two short texts (title, description). `action` and `icon` are nodes.
- Tooltip: shows only on hover or focus. Besides that it has `content` and `delay`.
- Popover, Menu, ContextMenu, Modal, Drawer, ConfirmDialog, CommandPalette: their effect needs opening.
- Breadcrumb: `items` is data and nothing else.
- Tabs: value/defaultValue/onChange are state, and the tabs are composition.
- Accordion: `type` shows only as the reader opens sections, `headingLevel` is not seen, and the open set is state.
- Stepper: two (`current`, `orientation`). `steps` is data.
- TreeView: data and a render function.
