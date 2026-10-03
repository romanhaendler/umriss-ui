# 03: A prop without an example fails the build

Status: done
Blocked by: 01 (Every row names the examples that show it)
Spec: `.scratch/props-to-examples/spec.md`

**What to build:** After the scan, every documented row of a package must have a use in that package's examples or scenarios. Each package carries a checked-in exception list beside its outline, mapping `Type.prop` to a reason; it starts with every row shown nowhere today (about 67), each with the reason "not shown yet". The generator fails, in the same run as the JSDoc gate (so `pretypecheck` and CI carry it), listing all offenders at once, on three conditions: an unshown row not on the list, a listed row that is now shown ("stale — remove it"), and a listed row that does not exist.

- [x] Fixture tests make the generator fail on each of the three conditions, and list every offender in one run with its type
- [x] The five packages pass with their exception lists; the lists together hold exactly the rows shown nowhere today
- [x] Adding an example that uses a listed prop fails the build as stale until the entry is removed
- [x] `pnpm typecheck` runs the gate; no new CI job

## Comments

Delivered: `exampleFaults` in `packages/demo/src/tooling/shownIn.ts` compares a package's rows (`declaredAt`) and the scan's `shownIn` with the package's `demo/unshown.json`, which maps `Type.prop` to a reason. It returns three lists: `unshown` (no use and not listed), `stale` (listed, but now used) and `unknown` (listed, but no such row). `generateProps` now runs the scan before the gate's verdict. It writes these three lists to stderr together with the JSDoc gaps, references, defaults and unexported types (props-table-hygiene 03/04), all in the same run, then exits with 1. So `predev`, `prebuild:demo`, `pretypecheck` and CI cover the new check without a new job. A package without the file has an empty list. The messages:

- `N props without an example:`
- `N entries of demo/unshown.json are shown now - stale, remove them:`
- `N entries of demo/unshown.json name no row:`

Each lists one `Type.prop` per line. CONTRIBUTING's rules and `docs/testing.md` now name the gate.

The scan is wider in one respect, and that was a choice. An object literal that a callback maps into the array a prop takes now counts against the array's element type: `options={xs.map((x) => ({ value, label }))}`. Before, the literal's context was only what `map` inferred from the literal itself. The new rule applies only to that inferred context; a callback that its caller types keeps its own type. This was the spec's intent (count real uses, never text), and it is checked by the type checker. It brings in `ComboboxOption.value/label`, `MultiSelectOption.value/label` and `BreadcrumbEntry.onSelect`, so they are not listed. One gap is left on purpose, and it is consistent with ticket 01's loose-spread rule. An untyped `const x = { … }` (with or without `as const`) that is passed on later does not count, because its literal has no contextual type. Example: schedule's `LaneIntent.lane` in Interactions/02. Those rows are on the lists.

The gate holds only the props tables a page lists (`Page.types` in the outlines). It leaves out reference tables (`Wording`, `ChartsWording`, `Formats`) and the definition tables under "Types on this page". The spec owner decided this: the gate is about a component's props. A reference or definition table is read, not set, and no example can sensibly show each of its rows. The comment in `props.ts` and `docs/testing.md` record this rule.

The lists hold exactly the 155 rows of those tables that are shown nowhere today:

| Package | Rows |
| --- | --- |
| core | 52 |
| charts | 44 |
| table | 46 |
| schedule | 13 |
| calculation | 0 (`{}`) |

They include the spec's expected gaps: 33 `TableSnapshot` members and 13 `invalid` props. Tickets 04 and 05 shrink the lists by those. (Before the spec owner's decision, the lists held 622 rows. 310 of them were wording keys, and most of the rest were definition tables added by `types-without-holes`.)

Tests: `tests-unit/shownIn.test.ts`.

- New use: a literal mapped into `PanelProps.marks` covers `PanelMark.at` and not `PanelMark.note`.
- `exampleFaults` passes an exact list. It names every unlisted row, a stale entry and two unknown entries.
- `generateProps` on the fixture (`fixtures/shown/demo/unshown.json` holds one correct entry, one stale entry and one unknown entry) exits with 1. In one run it names all four unshown rows of the listed tables, the stale entry and the unknown entry. It names neither `PanelMark.note` (a definition) nor a JSDoc gap. For that, the fixture now has a `vite.config.ts` and JSDoc on its exports.

By hand: adding `invalid` to Input/01 failed `pnpm --filter @umriss-ui/core props` with `InputProps.invalid` and `TreeSearchProps.invalid` stale (one declaration); after the revert it passed. lint, typecheck and test:unit are green. Playwright ui-light `features-page.spec.ts`: 24 passed. The test "a link to a definition previews it…" failed after ticket 01; ticket 02 fixed it on main, and this branch takes that fix. Baselines moved: none.
