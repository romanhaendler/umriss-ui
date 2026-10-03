# 05: The gate stops at an export without JSDoc

Status: done
Blocked by: 03 (Every export of core carries JSDoc), 04 (Every export of charts, table, schedule and calculation carries JSDoc)
Spec: `.scratch/api-index/spec.md`

**What to build:** The generator that stops at a prop without a comment also stops at an export of the entry or a subpath without one, listing every offender with file and line in one run, so CI fails on it.

- [x] Gate test: a fixture export without JSDoc stops the generator and is listed with file and line; the corrected fixture passes.
- [x] The workspace passes the gate.
- [x] CI fails when a new export without a comment is added (shown by the gate test, not by a red build).

## Comments

**Delivered.** `generateProps` (the gate every demo's `demo/props.ts` runs in
`predev`, `prebuild:demo`, `prepack` and core's `pretypecheck`) now also stops
at an export without JSDoc. The check is ticket 03's one-off script, made a
module of the shell's tooling: `packages/demo/src/tooling/exportDocs.ts`,
`undocumentedExports(packageDir)`. It takes the entries from the package's
`vite.config.ts` (`build.lib.entry`, a string or an object - the main entry and
every subpath), so there is no second list of entries; a config with no entry
it can read throws. Prop gaps and export gaps are reported together in one
run, each export with file and line where it is declared (re-exports followed),
then the gate exits 1.

**Tests.** `packages/demo/tests-unit/exportDocs.test.ts` against two fixture
packages under `tests-unit/fixtures/exports/`: `bare` (a re-exported function
under a plain maintainer note, a re-exported interface, a subpath constant -
all three listed with file and line), `documented` (the same, explained - no
offender), and `generateProps` on `bare` exiting 1 with all three lines on
stderr. By hand: a bare export appended to core's `wording/de` subpath and one
to the table's entry each stopped `pnpm --filter … props` with file and line;
reverted. All five `props` runs pass.

**Green:** `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` (all six packages).
Playwright was not run: the change is tooling only, and the generated props
tables and llms text are byte-for-byte what they were.

**Baselines moved:** none. **Deviations:** none. `CONTRIBUTING.md`'s rule and
`docs/testing.md`'s tooling row now name the export class. No CHANGELOG entry:
`@umriss-ui/demo` is private and no published package's caller sees this.
