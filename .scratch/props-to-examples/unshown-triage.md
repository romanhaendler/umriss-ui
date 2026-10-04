# Triage: the props no example shows

Status: proposal (4 Oct 2026). No code changed.

This triage covers the 111 entries in `packages/*/demo/unshown.json` on `main` at `8aff3437`: core 41, charts 44, table 13, schedule 13 and calculation 0. Each entry got one verdict:

- **Missing**: a reader needs to see it working. The row names the page it belongs on and sketches the example. Where the sketch says *extend*, an existing example gains the prop and no new file is needed.
- **Exception**: no example of its own is needed. The row names the category and gives the reason.
- **Shown, uncounted**: an example already uses the prop, but through an untyped `const`/`useMemo` literal. The scan cannot see that (ticket 03 left this gap open on purpose). Annotating the literal's type closes it, and no new example is needed.

| Package | Missing | Exception | Shown, uncounted | Total |
| --- | --- | --- | --- | --- |
| core | 31 | 8 | 2 | 41 |
| charts | 16 | 28 | 0 | 44 |
| table | 8 | 5 | 0 | 13 |
| schedule | 11 | 2 | 0 | 13 |
| **all** | **66** | **43** | **2** | **111** |

Exception categories:

- **(a)** Pass-through to the DOM or standard React (`className`, `style`, `id`, a form `name`). It also covers a prop that only sets an `aria-label` over a wording default, because a demo shows nothing for it.
- **(b)** An escape hatch documented in prose. An example would only repeat the description.
- **(c)** A callback whose firing a sibling prop already demonstrates. *(not used)*
- **(d)** Internal tuning with no visible effect. *(not used)*
- **(e)** A member of an output type, explained by its table. *(not used: the spec holds output types to the same standard (user story 15), so output members are triaged like inputs)*
- **(f)** *(added)* **Twin**: the same prop with the same meaning on a sibling type, where an example already shows it working on that sibling. A second example would repeat the first. This was used only where the kind changes nothing about the effect. Where it does (a stack closing its gap, a matrix whose axis writes the row), the prop is Missing.
- **(g)** *(added)* **Deprecated alias** of a shown prop. An example would teach the old name.

## core

| Prop | Verdict | Page | Example sketch / reason |
| --- | --- | --- | --- |
| ToastConfig.duration | Shown, uncounted | umrissprovider | UmrissProvider/01 and /03 pass `const TOAST = { duration }` untyped. Annotate it `: ToastConfig`. |
| ToastConfig.position | Shown, uncounted | toast | Toast/07 builds `{ position }` in an untyped `useMemo`. Annotate it `useMemo<ToastConfig>`. |
| ToastConfig.limit | Missing | toast | **New:** `limit: 2`. Fire four toasts and the oldest gives way to each new one. |
| SplitterProps.step | Missing | splitter | *Extend* Splitter/03: `step={10}`, and the lead invites the arrow keys. |
| DockProps.label | Exception (a) | dock | Sets only the dock's `aria-label` over the wording's "Tools". Nothing is visible. |
| HeadingProps.weight | Missing | typography | *Extend* Typography/03: one Heading at `weight="medium"` beside the default semibold. |
| ButtonGroupProps.size | Missing | buttongroup | *Extend* ButtonGroup/02: `size` set once on the group instead of on each button. |
| SplitButtonProps.menuLabel | Exception (a) | buttongroup | Sets only the trigger's `aria-label` over "More actions". Nothing is visible. |
| SplitButtonProps.align | Missing | buttongroup | *Extend* ButtonGroup/03: a split button at the bar's start opens its menu `align="start"`. |
| TextareaProps.chars | Missing | textarea | **New:** a fixed comment box, `chars={60}` and `resize="none"`, beside the default drag handle. |
| TextareaProps.resize | Missing | textarea | Same new Textarea example. |
| RadioGroupProps.name | Exception (a) | radiogroup | The native radio `name` for form posts. The default is generated, and nothing is visible. |
| SelectProps.chars | Missing | sizes | **New (Sizes):** "Choosing and date fields sized to their value". Each field gets its own `chars`. |
| ComboboxProps.size | Missing | combobox | *Extend* Combobox/02 States: an `sm` field beside `md`, as Select/02 does. |
| ComboboxProps.chars | Missing | sizes | Same new Sizes example. |
| ComboboxOption.disabled | Missing | combobox | *Extend* Combobox/02: one driver on leave stands in the list but cannot be chosen. |
| MultiSelectProps.emptyText | Missing | multiselect | *Extend* MultiSelect/02 States: an own "No service matches" for a fruitless search. |
| MultiSelectProps.size | Missing | multiselect | *Extend* MultiSelect/02: an `sm` field beside `md`. |
| MultiSelectProps.chars | Missing | sizes | Same new Sizes example. Chips that do not fit collapse to "+N" without moving the field. |
| MultiSelectOption.disabled | Missing | multiselect | *Extend* MultiSelect/02: a retired service is listed, can't be ticked, and stays ticked if already chosen. |
| DatePickerProps.chars | Missing | sizes | Same new Sizes example. |
| DateTimePickerProps.placeholder | Missing | datetimepicker | *Extend* DateTimePicker/03 States: an empty field with its own placeholder, as DatePicker/02 does. |
| DateTimePickerProps.chars | Missing | sizes | Same new Sizes example. |
| DateRangePickerProps.chars | Missing | sizes | Same new Sizes example. |
| DateTimeRangePickerProps.placeholder | Missing | datetimerangepicker | *Extend* DateTimeRangePicker/03 States: an empty field with its own placeholder. |
| DateTimeRangePickerProps.chars | Missing | sizes | Same new Sizes example. |
| AlertProps.dismissLabel | Exception (a) | alert | Sets only the cross's `aria-label` over "Close message". Nothing is visible. |
| PopoverProps.focusRef | Exception (b) | popover | Focus return for a non-focusable anchor shell. The row states the one case, and a picture shows nothing. |
| PopoverProps.insideRefs | Exception (b) | popover | Exempts further elements from the outside-click rule, for builders of composite fields. The prose suffices. |
| PopoverProps.align | Missing | popover | **New:** a hover card on a name at the right edge. It uses `align="end"` and `offset={8}` and closes on scroll. |
| PopoverProps.offset | Missing | popover | Same new Popover example. |
| PopoverProps.hideOnScroll | Missing | popover | Same new Popover example (`hideOnScroll`: scroll the page and the card closes). |
| PopoverProps.id | Exception (a) | popover | A DOM `id` for `aria-controls`. |
| PopoverProps.className | Exception (a) | popover | A class on the surface. |
| ModalProps.closeOnBackdrop | Missing | modal | **New:** "A window that must be answered". It has no cross (`hideClose`) and the backdrop does not close it. |
| ModalHeaderProps.hideClose | Missing | modal | Same new Modal example. |
| DrawerProps.closeOnBackdrop | Missing | modal | Inherited from `ModalProps`. The same Modal example covers it (one declaration), so no Drawer example is needed. |
| CommandPaletteItem.icon | Missing | commandpalette | **New:** "Search hundreds of pages". It has a glyph per kind, `searchedGroup` strips "core · ", and `maxFinds={50}` shows the more-finds line. |
| CommandPaletteItem.searchedGroup | Missing | commandpalette | Same new CommandPalette example. |
| CommandPaletteProps.maxFinds | Missing | commandpalette | Same new CommandPalette example. |
| TagProps.removeLabel | Missing | tag | *Extend* Tag/03: a tag whose content is an avatar node gets `removeLabel`, which is required there. |

## charts

| Prop | Verdict | Page | Example sketch / reason |
| --- | --- | --- | --- |
| ChartProps.className | Exception (a) | chart | Goes to the root element. |
| ChartProps.style | Exception (a) | chart | Goes to the root element. |
| AreaProps.xAxisId | Exception (f) | area | The binding works as on Line (Axis/02 "Add axes for other magnitudes"). |
| AreaProps.yAxisId | Exception (f) | area | As above. |
| AreaProps.hidden | Missing | area | *Extend* Area/03 Stacked: a legend `onToggle` drops a depot, and the stack closes the gap. |
| AreaProps.format | Missing | area | **New:** "Shares of the whole". It uses `normalize`, the axis reads %, and `format` writes the tooltip's readings in tonnes. |
| AreaProps.color | Exception (f) | area | Any CSS colour, as on Line and Bar, which are both shown. |
| AreaProps.tone | Exception (f) | area | A theme role instead of a colour, as on Scatter/02 and BoxPlot/06. |
| AreaProps.normalize | Missing | area | Same new Area example. A 100 % area is its own chart form, so it is not left to Bar/05. |
| AreaProps.dash | Missing | area | *Extend* Area/02 Corridor: the forecast corridor's outline is dashed and its fill stays whole. |
| BarProps.xAxisId | Exception (f) | bar | As Line in Axis/02. |
| BarProps.yAxisId | Exception (f) | bar | As Line in Axis/02. Pareto/01 already shows bars against a line on its own axis. |
| BarProps.data | Exception (f) | bar | Series-own data, shown on Line, Area and BoxPlot. |
| BarProps.hidden | Missing | bar | *Extend* Bar/04 Stacked: a legend `onToggle` drops a member, and the stack closes the gap. |
| ScatterProps.xAxisId | Exception (f) | scatter | As Line in Axis/02. |
| ScatterProps.yAxisId | Exception (f) | scatter | As Line in Axis/02. |
| ScatterProps.data | Exception (f) | scatter | Series-own data, shown on Line, Area and BoxPlot. |
| ScatterProps.hidden | Exception (f) | scatter | A single unstacked series hides exactly as Line does (Tooltip/05). |
| ScatterProps.format | Exception (f) | scatter | The tooltip value format, as on Line (Tooltip/04). |
| ScatterProps.color | Exception (f) | scatter | Any CSS colour, as on Line and Bar. |
| BoxPlotProps.xAxisId | Exception (f) | boxplot | As Line in Axis/02. |
| BoxPlotProps.yAxisId | Exception (f) | boxplot | As Line in Axis/02. |
| BoxPlotProps.color | Exception (f) | boxplot | Any CSS colour. BoxPlot/06 already shows `tone`. |
| StateBandProps.xAxisId | Exception (f) | stateband | As Line in Axis/02. |
| StateBandProps.hidden | Missing | stateband | *Extend* StateBand/02: the band's legend entries are states, and a click on any of them hides the band. |
| MatrixProps.xAxisId | Exception (f) | matrix | As Line in Axis/02. |
| MatrixProps.yAxisId | Exception (f) | matrix | As Line in Axis/02. |
| MatrixProps.data | Exception (f) | matrix | Series-own data, shown on Line, Area and BoxPlot. |
| MatrixProps.hidden | Exception (f) | matrix | A matrix is its chart's only series, and hiding works as on Line. |
| MatrixProps.format | Missing | matrix | *Extend* Matrix/01: the tooltip writes "412 ms" while the y axis writes the row. |
| LimitLineProps.orientation | Missing | limitline | **New:** "Limits along time". A freeze start is an x line and a maintenance window an x band, each in its own colour. |
| LimitLineProps.color | Missing | limitline | Same new example. The JSDoc's own case: a mark that carries no severity. |
| LimitLineProps.role | Missing | limitline | **New:** "Specification and control limits side by side". The two roles look different (ADR-0008). |
| LimitBandProps.orientation | Missing | limitline | Same as LimitLine `orientation` ("Limits along time"). |
| LimitBandProps.color | Missing | limitline | Same as LimitLine `color` ("Limits along time"). |
| LimitBandProps.role | Missing | limitline | Same as LimitLine `role`: a ±3σ control band beside the specification band. |
| ControlChartProps.xAxisId | Exception (f) | controlchart | As Line in Axis/02. |
| ControlChartProps.yAxisId | Exception (f) | controlchart | As Line in Axis/02. |
| ControlChartProps.format | Exception (f) | controlchart | The tooltip value format, as on Line (Tooltip/04). |
| ControlChartProps.color | Exception (f) | controlchart | Any CSS colour for the line, as on Line. |
| ControlChartProps.tone | Exception (f) | controlchart | A theme role for the line, as on Scatter/02. Violations stay alarm. |
| ControlChartProps.rules | Missing | controlchart | **New:** "Choose the rules". Rule 4 is off, the run length is 8, there are no `zoneLines`, and `onViolations` lists the finds. |
| ControlChartProps.zoneLines | Missing | controlchart | Same new ControlChart example. |
| ControlChartProps.onViolations | Missing | controlchart | Same new ControlChart example. ControlChart/02 lists through plain functions and never uses the callback. |

## table

| Prop | Verdict | Page | Example sketch / reason |
| --- | --- | --- | --- |
| TableProps.striped | Missing | row-appearance | **New:** "Stripes across a wide table". `striped` keeps a long row on its line. |
| TableOptions.filter | Exception (g) | first-table | `@deprecated`, the old name of `preFilter`, which Pre-filter/01 shows. |
| TableOptions.selection | Missing | selection | **New:** "Hold the selection yourself". `useTableSelection` is passed in, preselected, and counted and cleared outside. |
| SearchProps.className | Exception (a) | search | A class on the field. |
| SearchProps.size | Missing | toolbar | **New (Toolbar):** "Parts outside a toolbar". Search, ColumnMenu and Export sit `md` in a card header, with a Pagination in the footer. |
| FilterInputProps.values | Missing | filter | **New:** "Offer the values that occur". The own filter's input builds its choices from `values`. |
| ToolbarProps.className | Exception (a) | toolbar | A class on the toolbar. |
| ColumnMenuProps.size | Missing | toolbar | Same new Toolbar example. |
| ColumnMenuProps.of | Missing | toolbar | Same new Toolbar example. |
| ExportProps.size | Missing | toolbar | Same new Toolbar example. |
| PaginationProps.className | Exception (a) | pagination | A class on the bar. |
| PaginationProps.of | Missing | toolbar | Same new Toolbar example (the pager stands in the card footer, outside the table). |
| VerdictBase.resizable | Exception (f) | verdictcolumn | The same grip as `ColumnBase.resizable`, shown on Width and pinning. |

## schedule

| Prop | Verdict | Page | Example sketch / reason |
| --- | --- | --- | --- |
| ScheduleProps.defaultCollapsedGroups | Missing | lane-groups | **New:** "Start with groups folded". It is uncontrolled: one team folded at mount, and the reader unfolds it. |
| ScheduleProps.className | Exception (a) | schedule | Goes to the root element. |
| ScheduleProps.style | Exception (a) | schedule | Goes to the root element. |
| Dependency.attach | Missing | dependencies | **New:** "One handover drawn its own way". One dependency overrides the schedule's `attach` and `ends`. |
| Dependency.ends | Missing | dependencies | Same new Dependencies example. |
| ScheduleInteraction.lane | Missing | interactions | *Extend* Interactions/01: the status line writes `interaction.lane`, which its lead already promises. |
| ScheduleTooltipTarget.subtask | Missing | tooltip | **New:** "Say what a bar covers and a line joins". A bar shows its times and covered leave; a line shows from→to. |
| ScheduleTooltipTarget.blocked | Missing | tooltip | Same new Tooltip example. |
| ScheduleTooltipTarget.dependency | Missing | tooltip | Same new Tooltip example. |
| ScheduleTooltipTarget.from | Missing | tooltip | Same new Tooltip example. |
| ScheduleTooltipTarget.to | Missing | tooltip | Same new Tooltip example. |
| ViolatedDependency.departure | Missing | findings | *Extend* findings/01: "leaves 10:20, due by 10:00" beside the hours short. |
| ViolatedDependency.arrival | Missing | findings | Same extension. |

## Batch plan

The 66 Missing entries are covered by 17 new examples, 16 extensions of existing examples and 2 type annotations.

| Package | New examples | Extensions | Annotations | Entries covered |
| --- | --- | --- | --- | --- |
| core | 6 | 9 | 2 | 31 + 2 |
| charts | 4 | 5 | 0 | 16 |
| table | 4 | 0 | 0 | 8 |
| schedule | 3 | 2 | 0 | 11 |
| **all** | **17** | **16** | **2** | **66 + 2** |

Proposed batches, each one PR. Each PR removes its entries from `unshown.json`; if it misses one, the gate reports that entry as stale.

1. **core, quick wins (14 entries: 12 Missing and the 2 uncounted; no new files).** The two `ToastConfig` annotations. Extensions to Splitter/03, Typography/03, ButtonGroup/02 and /03, Combobox/02 and MultiSelect/02 (these two carry `size`, option `disabled` and `emptyText`), DateTimePicker/03, DateTimeRangePicker/03 and Tag/03.
2. **core, new examples (19 entries, 6 files).**
   - Toast "How many stand at once" (`limit`).
   - Textarea fixed comment box (`chars`, `resize`).
   - Sizes "Choosing and date fields sized to their value" (7 × `chars`).
   - Popover hover card (`align`, `offset`, `hideOnScroll`).
   - Modal "must be answered" (`closeOnBackdrop` on Modal and Drawer, plus `hideClose`).
   - CommandPalette "Search hundreds of pages" (`icon`, `searchedGroup`, `maxFinds`).
3. **charts (16 entries, 4 new files and 5 extensions).**
   - New: Area "Shares of the whole" (`normalize`, `format`), LimitLine "Limits along time" (4), LimitLine "Specification and control limits" (2), ControlChart "Choose the rules" (3).
   - Extend: Area/02 (`dash`), Area/03 (`hidden`), Bar/04 (`hidden`), StateBand/02 (`hidden`), Matrix/01 (`format`).
4. **table (8 entries, 4 new files).** Row appearance stripes; Selection held outside; Filter "values that occur"; Toolbar "Parts outside a toolbar" (5 entries).
5. **schedule (11 entries, 3 new files and 2 extensions).**
   - New: Lane groups "Start folded"; Dependencies "One handover drawn its own way" (2); Tooltip "What a bar covers and a line joins" (5).
   - Extend: Interactions/01 (`lane`) and findings/01 (`departure`, `arrival`).
6. **Exceptions (43 entries, no example).** The 43 entries stay in `unshown.json`, but their reason changes from "not shown yet" to the category and reason above, e.g. `"twin of LineProps.xAxisId (Axis/02)"`. The gate treats every reason alike, so this is a text change only. Afterwards a "not shown yet" in the lists means a real gap.

Every extension moves its example's screenshot baselines, light and dark, so each batch renews them once.

Open question for the spec owner: category (f) accounts for 27 of the 43 exceptions (26 of them in charts). If the rule should be "every series kind shows its own axis binding", the cheapest cover is one Axis example. It would bind Area, Bar, Scatter, BoxPlot, StateBand, Matrix and ControlChart to a second axis and cover 13 twin entries at once.
