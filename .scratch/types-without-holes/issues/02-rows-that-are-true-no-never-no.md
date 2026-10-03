# 02: Rows that are true: no `never`, no free type parameters, constraints in the header

Status: done
Blocked by: 01 (One table model, two writers)
Spec: `.scratch/types-without-holes/spec.md`

**What to build:** On the table's Column page, `aggregate` reads `AggregateFor<…>` and `footer` reads its real type. A member typed `never` in an arm of a union contributes no type to the merged row; its description is kept after the real arms' descriptions. A member that is `never` in every arm is absent. Members taken from helper, inherited or union-arm types have the helper's parameters replaced by the arguments at the use. Table headers (and later definitions) show each parameter with its constraint and default: `FieldColumn<Z, K extends Field<Z>>`, `RadioGroupProps<T extends string>`. A member naming a type parameter the header does not introduce stops the generator with an error.

- [x] Reader fixtures: an arm with `member?: never` merges to the real type with both descriptions; a member `never` in all arms is absent; an inherited member's parameter is substituted; a constraint and a default appear in the parameter list; a free type parameter is reported.
- [x] No row in any generated props data has a type equal to `never` or starting with `never |`.
- [x] No member of any table names a type parameter its header does not introduce.
- [x] The Column page shows `FieldColumn<Z, K extends Field<Z>>` and `aggregate` with a real type.
- [x] The built-site guard fails on a merged `never` row.

## Comments

Delivered in `packages/demo/src/tooling/propsReader.ts`. In `mergeArms`, a member typed `never` in an arm adds no type to the row. Its sentence stands after the sentences of the arms that give the member a real type. A member that is `never` in every arm stays `never`, and `readType` drops every row whose type is `never`. `substitutionsOf` now replaces a helper's parameters with the arguments at its use, or with the defaults where no argument is given, and does so for inherited interfaces and aliases as well as for conditional helpers. `TypeEntry.parameter` carries each parameter as written, with its constraint and default (`K extends Field<Z>`). After reading a table type, the reader parses each row's type and throws when the type names a type parameter the header does not introduce; names the type binds itself, such as a generic function or a mapped key, are not counted. `scripts/build-pages.mjs` now fails its guard on any props row typed `never` or `never | …`.

The Column page now shows `FieldColumn<Z, K extends Field<Z>>`, `aggregate?: AggregateFor<Z[K], Z>` (from AggregateOptions, ending with "Not together with `footer`, its old name."), `footer?: FooterFor<Z[K]>`, and `edit`, `editOptions`, `validate` in `Z[K]`. In core, nine headers gained their constraints (`RadioGroupProps<T extends string>`, `TreeViewProps<K, S extends Key = string>`, …). Charts, schedule and calculation are unchanged; I diffed every package's props.json against the version from before this change.

Tests: five new cases in `tests-unit/propsReader.test.ts` against the new fixture types in `fixtures/props/shapes.tsx` (`FixtureMeasure`, `FixtureTotals`, `FixtureLoose`). `FixtureLoose` leaves a parameter free on purpose, with a `@ts-expect-error`. I also checked the guard by hand: on the old props data it reports the three `never` rows, and on the new data none. lint, typecheck and test:unit are green. Playwright `features-page` and `features-shell` for ui-light and table-light passed, 52 of 52. No baselines moved.

Deviations: (1) In the arm of a union, a part that has a table of its own (`AggregateOptions`) is now copied out instead of being named in `alsoTakes`. Without that, `aggregate` would have been `never` in the one remaining arm and missing from the Column page. (2) `VerdictBase.filter?: never` is a single interface, not a merge, but it was a `never` row too, so it is gone. The VerdictColumn page already says "No list filter" under its limits. (3) `share` now carries both arms' sentences, because the two differ. Removing the second JSDoc in `packages/table/src/types.ts` would leave only the first.
