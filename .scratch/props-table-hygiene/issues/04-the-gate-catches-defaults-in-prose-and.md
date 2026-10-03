# 04: The gate catches defaults in prose and unexported types

Status: done
Blocked by: `types-without-holes` 05 (Every library type in a type cell is a link, and "Types on this page" defines the rest), `types-without-holes` 06 (Every type a table names can be imported), `types-without-holes` 07 (The charts' defaults move from prose into `@default`), `types-without-holes` 08 (The table's, schedule's and calculation's defaults move from prose into `@default`)
Spec: `.scratch/props-table-hygiene/spec.md`

**What to build:** Two more error classes in the generator, each reporting every offender with file, line, type and prop, no exception list: *default in prose* (the description contains the word "default" and the row has no default from `@default` or destructuring) and *unexported type* (a library type in a type cell, definition block or table header is not exported from the entry or a subpath).

- [x] Gate tests: one fixture per class fails with file and line; the corrected fixtures pass.
- [x] The workspace passes both new classes.
- [x] A phrase `@default` (including "no default") satisfies the first class.

## Comments

Delivered in `packages/demo/src/tooling/propsReader.ts`, through the `check`/`flags` route of ticket 03. `Flag` now has a `kind`: `reference` (ticket 03), `default` and `unexported`. `generateProps` prints each kind under its own heading, lists every offender as `file:line  Type.prop: found`, and exits.

- **Default in prose**: a shown row whose description has `default` as a word (`/\bdefault\b/i`, so `defaultValue`, `defaults` and `DEFAULT_X` do not count) and no default from `@default` or the destructuring. The flag carries the sentence. This runs on every read, the way gaps do.
- **Unexported type**: `readProps` takes a fifth argument `entries`. `props.ts` `importableEntries` passes the package's own entries and subpaths (`entriesOf` from `exportDocs.ts`, now exported) plus those of its `@umriss-ui/*` peer dependencies. The check flags any name that no entry exports, in three places: a row's type cell, a definition's declaration (`(its declaration)`), and a header (`(its header)`, meaning the table type's own name and the names in its or a members definition's parameter constraints and defaults). A name gets one flag, where it is named. The check is off when no entries are given.

What the workspace had, and how it was fixed:
- Core: `Formats.count` said "Intl's default". It now says "Intl's own rounding"; that sentence is about Intl, not a default of the member. `DockPlace` was `= Place`, an internal name. `place.ts`'s `Place` is renamed to `DockPlace` and re-exported by `Dock.tsx`, so the declaration shows the four edges.
- Table: the model `Column`'s `searchable`, `hideable` and `resizable` got `@default false/true/false`, checked against the code. Nine types are newly exported at the end of `src/index.ts`, with JSDoc where they had none: the outline's tables `ColumnBase`, `FieldColumn`, `ValuePaths`, `GroupByBase` and `VerdictBase` (`GroupByBase` and `VerdictBase` were not even module-exported), plus `Displayable`, `IsDisplayable`, `DatePeriod` and `RowGroup`, which definitions name. Both changelogs say so.
- Charts, schedule and calculation passed as they were.

Tests: `propsReader.test.ts` has 4 new cases. Fixture `prose.tsx`: two offenders flagged with file and line, and the corrected props pass with a value, a phrase "no default" and a destructuring default. Fixture `exports/hidden.tsx` + `exports/index.ts`: cell, header constraint, unexported table and definition declaration are flagged with file and line, and a clean table passes. A planted offender in charts' `Legend.tsx` stopped `pnpm props` with both new headings, then was reverted. lint, typecheck (the gate of all five packages) and test:unit are green. Playwright `features-page` in ui-light and table-light: 27 passed, 1 failed (the Button configurator's background check). That check is untouched by this change and passed on two reruns.

Baselines moved: none.

Deviations: "a table header" is read as the table's own name plus its parameter constraints and defaults. Neighbours are found through `peerDependencies`. A fixture package without a `package.json` has none.
