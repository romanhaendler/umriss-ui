# 06: The triaged props shown, and the exceptions named

Status: ready-for-agent
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
