# 06: The triaged props shown, and the exceptions named

Status: done
Blocked by: `configurator` 03 (Every core page that can be configured opens with a configurator)
Spec: `.scratch/props-to-examples/spec.md`

**What to build:** Carry out the owner-approved triage in `.scratch/props-to-examples/unshown-triage.md` (4 Oct 2026). First, once: teach the coverage scan to count a configurator's `controls` (declared as prop names in `demo/configurators/*.tsx`) against its `<Component>Props`, so a prop a configurator sets counts as shown; then remove the entries the configurators of `configurator` 03 show. Then per package, in its own worktree (core, charts, table, schedule):

- **Missing** entries get the example or extension the triage sketches. Before writing one, check whether `configurator` 03 already shows the prop (a configurator's use counts); if so, only remove the entry.
- **Charts axes (owner's decision):** one new Axis example binds several series kinds (line, area, bar, scatter …) to a second y axis, so the twin entries `xAxisId`/`yAxisId` per series kind are shown for real, not excepted. Category (f) stays for the remaining twins.
- **Shown, uncounted:** annotate the two Toast literals (`: ToastConfig`, `useMemo<ToastConfig>`) so the scan counts them.
- **Fix the two examples that promise more than they show:** ControlChart/02 uses `onViolations` for the list it shows; schedule Interactions/01 reads `interaction.lane` as its lead promises.
- **Exceptions keep their entry in `unshown.json`, but the reason becomes their category and one-line reason from the triage** instead of "not shown yet", so every gap left is a named decision. The gate's comment and `docs/testing.md` say that an entry's reason is either "not shown yet" or a category (a)/(b)/(f)/(g).

- [ ] Every Missing entry of the triage is shown and gone from its `unshown.json`.
- [ ] Every remaining entry carries a category and reason; none reads "not shown yet".
- [ ] The Axis example shows at least four series kinds on a second y axis.
- [ ] ControlChart/02 and Interactions/01 do what their leads say.
- [ ] lint, typecheck (the gate), `pnpm test:unit` and the affected visual suites green; new pictures looked at.

## Comments

### core

- **The scan counts configurators** (`packages/demo/src/tooling/shownIn.ts`): a file under `demo/configurators/` sets its `controls`, its `required` keys and its `children` against `<name>Props` (the file's name, or the `name` it exports), read from the file's text as `readConfigurators` reads the module. Its rows resolve through `declaredAt`, so an inherited row is covered as by an example. It stands first on its page as "Configurator", linking `configurator-<page>` (`configuratorAnchor` moved into `tooling/configurator.ts` so the Node tooling can share it). Tested against the fixture package (`shownIn.test.ts`: two fixture configurators, one with `name` and a `required` prop, one with `children`).
- **Configurator 03 already showed 11 entries**: `TextareaProps.chars`/`resize`, the seven `chars` of the Sizes sketch, `ComboboxProps.size`, `MultiSelectProps.size`. Removed only; so the planned Textarea and Sizes examples were not needed. Charts, table and schedule have no configurators, so nothing there changed.
- **New examples:** Toast/08 "How many stand at once" (`limit`), Popover/04 "A card at the right edge" (`align`, `offset`, `hideOnScroll`; opened by click, not hover, so the keyboard reaches it), Modal/05 "A window that must be answered" (`closeOnBackdrop`, `hideClose`; covers Drawer's inherited row), CommandPalette/05 "Search hundreds of pages" (`icon`, `searchedGroup`, `maxFinds`).
- **Extended:** Splitter/03 (`step`), Typography/03 (two Headings, one `weight="medium"`), ButtonGroup/02 (`size` on the group), ButtonGroup/03 (`align="start"`), MultiSelect/02 (`emptyText`), DateTimePicker/03 and DateTimeRangePicker/03 (an empty field with its own placeholder), Tag/03 (a tag with markup and `removeLabel`). Combobox/02 and MultiSelect/02 already had a disabled option in an untyped list; annotating `ComboboxOption[]`/`MultiSelectOption[]` counts it, as the two Toast annotations (`: ToastConfig`, `useMemo<ToastConfig>`) do.
- **core's `unshown.json` holds 8 entries**, each with its category and reason ((a) ×6, (b) ×2); none reads "not shown yet". The gate's comments (`shownIn.ts`, `props.ts`), its failure message and `docs/testing.md` say an entry's reason is "not shown yet" or a category (a)/(b)/(f)/(g).
- **Checks:** lint, typecheck (the gate of all five packages), `pnpm test:unit` green; core's screenshot, forced-colors, page and own-data suites in ui-light and ui-dark green. The shell's page check (`checks/page.ts`) followed the Button page's first "Shown in" link, which now names the configurator, so it accepts the anchor's element by id as well as an example.
- **Baselines:** new for the four new examples (light and dark); renewed for the extended examples (ButtonGroup/02, /03, DateTimePicker/03, DateTimeRangePicker/03, MultiSelect/02, Splitter/03, Tag/03, Typography/03) and, from the page growing above them (half-pixel text shifts, looked at), ButtonGroup/04, /05, DateTimePicker/04, Tag/04, Typography/04-06, /08, /09, and "A toast at work", whose translucent toast now has Toast/08's lead behind it.
- Not done: the prerendered page carries no configurator, so a "Configurator" link there reaches the page and the anchor only once the app runs (no guard checks example anchors).

### charts

- **Missing, all 16 shown.** New: Area/04 "Show shares of the whole over time" (`normalize`, `format` in tonnes), LimitLine/05 "Mark moments and windows along time" (`orientation="x"` and `color` on a line and a band), LimitLine/06 "Set specification and control limits side by side" (`role="control"` on a band and a line), ControlChart/03 "Choose the rules" (`rules`, `zoneLines={false}`, `onViolations`). Extended: Area/02 (`dash`), Area/03 and Bar/04 (`hidden` from a legend `onToggle`, the stack closes), StateBand/02 (a state's legend entry hides the band), Matrix/01 (`format`).
- **Axes (owner's decision).** New Axis/08 "Bind every kind of series to a second axis": an Area, Bars, a Line and a Scatter read hourly counts against a second y axis and a second x axis, the kiln's minutes stay on the first two. Removes `xAxisId`/`yAxisId` of Area, Bar and Scatter, and with them `BarProps.data`/`ScatterProps.data` (the example passes series-own data).
- **ControlChart/02** lists through `onViolations`, no longer through `controlLimits`/`violations`; its lead says so.
- **20 entries remain**, each with its category: 2 × (a) (`ChartProps.className`/`style`), 18 × (f) twins - BoxPlot, StateBand (x), Matrix and ControlChart axis bindings, `color`/`tone`/`format`/`hidden`/`data` twins. None reads "not shown yet". The gate comment and `docs/testing.md` wording belong to the shared part, not done here.
- **Baselines:** charts-light/dark renewed for the 6 changed examples (area corridor/stacked, bar stacked, stateband under-a-course, matrix by-limits, controlchart list-the-violations) and taken for the 5 new ones; looked at. The "Known open" note on charts pictures is marked done (Sep. 2026); nothing outside these moved.
- **Library findings, not fixed (out of scope):** a limit's label takes its severity's colour even when `color` is given (LimitLine/05 labels "Release freeze" in alarm red beside its own-coloured line); on an x axis a limit label covers a tick label only partly, where the y axis hides the covered tick - LimitLine/05 spaces its ticks to keep clear.
- Tests: lint, typecheck (gate), `pnpm test:unit` green; Playwright charts-light/dark screenshots (changed/new), features-page, own-data, features-interaction, silent-pages, accessibility - 63 passed.

### table

Delivered: the 8 Missing entries are shown by 4 new examples - Row appearance/04 "Stripes across a wide table" (`striped`), Selection/02 "Hold the selection yourself" (`selection` from `useTableSelection`, counted, filled and cleared by controls outside), Filter/09 "Offer the values that occur" (the own filter's `Input` builds its thresholds from `values`) and Toolbar/03 "Parts outside a toolbar" (Search, ColumnMenu and Export at `size="md"` in a card header, the Pagination with `of`). `packages/table/demo/unshown.json` holds the 5 exceptions, each with its category and reason: `TableOptions.filter` (g), `SearchProps.className`, `ToolbarProps.className` and `PaginationProps.className` (a), `VerdictBase.resizable` (f).

Proof: the table gate passes (`pnpm --filter @umriss-ui/table typecheck`); lint, typecheck and test:unit green. Playwright table-light + table-dark: own-data and features-page green; screenshots of the four pages' heads and examples green.

Baselines: 8 new (4 examples x light/dark), each looked at. None moved.

Deviations: the triage's "preselected" selection is left out - `useTableSelection` takes no initial keys, so a button "Select Oakridge Pharmacy" fills it from outside instead. The pager in Toolbar/03 stands above the rows, not in a card footer: `Pagination`'s JSDoc says a pager outside the table goes before it, or it registers only after the first frame.

### schedule

Delivered: the 11 Missing entries are shown. New: Lane groups/05 "Start with groups folded" (`defaultCollapsedGroups`), Dependencies/06 "Draw one handover its own way" (a dependency's own `attach` and `ends` over the schedule's), Tooltip/04 "Say what a bar covers and a line joins" (`subtask`, `blocked`, `dependency`, `from`, `to`). Extended: findings/01 writes "leaves ... for a start at ..." from `departure` and `arrival`; Interactions/01 now writes `interaction.lane` into its status line, as its lead promised (a lane hit reads "free time", so the lane is not named twice), and `features-schedule.spec.ts` asserts the new text. `packages/schedule/demo/unshown.json` holds the 2 (a) exceptions `ScheduleProps.className` and `ScheduleProps.style`.

Proof: the schedule gate passes; lint, typecheck and test:unit green. Playwright schedule-light + schedule-dark: own-data, features-page and "hover, click and right-click report their target" green; screenshots of the five pages' heads and examples green after the renewal below.

Baselines: 6 new (3 examples x light/dark), each looked at. Renewed: `findings--list-the-findings` light and dark - the extension lengthens its "Too early" line.

Not done here: the gate's comment and `docs/testing.md` on the reason format belong to the core part of this ticket.
