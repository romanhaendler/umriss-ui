# The documents agree with the source

Research for ticket 10. Candidates only; nothing was changed. Every `file:line` was read in this worktree
(HEAD `e7dc7b6c`). Size: S under an hour, M a few hours, L a day or more.

**Sampled:** `packages/demo/src/tooling/apiMd.ts`, `exportDocs.ts`, `propsSyntax.ts` and the seven `API.md`;
`TableView`/`TableRequest` (`table/src/model/view.ts`); the root `README.md`, `CONTRIBUTING.md`, `docs/README.md`,
`docs/releasing.md`, `docs/testing.md`, `docs/agents/*.md`, `skills/umriss-ui/SKILL.md`; all seven package READMEs
(identifiers and imports checked against `src` and `API.md`: all resolve; counts and prose below); `CONTEXT.md`
(the head, "Language", "Words, and the German that stays", about 30 of the 225 terms against the source);
the status of all 83 ADRs against the table in `docs/adr/README.md`; the three workflows; `playwright.config.ts`;
all relative links in the root, `docs/`, `CONTEXT.md` and the package READMEs (every one resolves).
**Not read:** `docs/design-language.md` and `docs/standards.md` beyond path and token references (all resolve),
the ADR bodies other than 0066 and 0083, the CHANGELOGs, `docs/archive`, `docs/research`, `docs/journal.md`
(frozen), generated `llms-full.md` (not present here).

Where a document and the source disagree, "change" names the one the candidate would edit.

## A. `API.md` is incomplete for the main component of four packages (known gap, cause found)

ADR-0083 makes `API.md` the promised surface ("every entry of a package's `API.md` with its type and default",
`docs/adr/0083-from-1-0-a-break-costs-a-major.md:19-20`, `:30`). It cannot carry that today.

1. **Why `Table`, `Column`, `Action` have no props.** `apiMd.ts:113-122` writes a props table only for an exported
   component (`kind === "component"`) and only for `${name}Props` and its parameter types. The component a hook
   *returns* (`Table`, `Column`, `Action`, `Chart`, `Schedule`, `Dashboard`) is a member of the hook's returns
   table (`table/API.md:203-208`, one line each: `Table: (props: TableProps<Z, Key>) => ReactNode`) and is never
   followed. Where a type is named `*Props`, `apiMd.ts:94` drops its member list in the "Types" index on the
   promise that "the props types of components stand in full below" - but for these they do not
   (`table/API.md:34`, `:44`, `:61`, `:101` list `ActionProps`, `ColumnComponent`, `FieldColumn`, `TableProps`
   with no members; no `#### props (TableProps)` exists).
2. **The same gap in three more packages.** `charts/API.md:77` (`ChartProps`) and `:234` (`Chart`),
   `schedule/API.md:54` (`ScheduleProps`) and `:77`, `dashboard/API.md:18` (`DashboardProps`) and `:58`: the
   props of `Chart`, `Schedule` and `Dashboard` appear nowhere in the file (the only `props (...)` heading in
   charts is `ControlChartProps`, `charts/API.md:162`). Core, calculation and alarms export no hook that returns
   a component, so their component tables are whole.
3. **Why `exportAs` is missing.** `propsSyntax.ts:30-34` (`membersOf`) keeps `ts.isPropertySignature` only;
   its comment says "methods and index signatures are not" props. `exportAs<R>(...)` is declared as a method
   (`table/src/types.ts:950`), so it is absent from `table/API.md:201-257` although it is the documented
   counterpart of `asCsv` (`types.ts:947-950`). The same filter drops, from every props table and from the
   demo's props tables:
   - the `bulk: true` variant's `onSelect` of `ActionProps` (`table/src/types.ts:499`, written as a method on
     purpose, see the comment at `:497-498`);
   - `TableRef.setFilter` (`types.ts:974`);
   - `Scale.toPx`, `fromPx`, `ticks` (`charts/src/types.ts:369-371`; `charts/API.md:119` lists the type with no
     members).
   A method-style member is a normal TypeScript idiom (here chosen deliberately for assignability), so any new
   public member written that way vanishes silently.
4. **`@experimental` has no home.** ADR-0083 says "`API.md` lists what is marked apart from the rest"
   (`0083...md:46`); `apiMd.ts` knows only `@deprecated` (`:76`); no `@experimental` appears in any `src`.
   "Deprecated last in its group" (ADR-0083 "A rename") is done on the site (`apiTable.ts:39`, `:221`) but not in
   `API.md`, which keeps source order and marks `(deprecated)` inline (`apiMd.ts:75`).
5. **Stale comment in the generator:** `apiMd.ts:109` says the wording is "a table of 260 labels"; ticket 04
   counts 443 keys. The threshold that decides (`> 100`) is right, the number is not.

Candidate: follow the component members of a hook's returns (and index the method signatures too) in
`apiMd.ts` / `propsSyntax.ts`; add `@experimental` to the generator before 1.0. Change: **source** (the
generator), then regenerate. Cost of leaving it: an unwritten surface that ADR-0083 calls the contract; fixing
later costs no major but the contract is vague meanwhile. Size: M (one generator change, seven regenerated
files, a gate test that every `Props` type reachable from a returned component has a table).

## B. Candidates where the document is the one to change

Ordered by what a reader or an agent would act on wrongly.

1. **`skills/umriss-ui/SKILL.md:50` tells agents to do chart export with `canvas.toDataURL()`.** The source has
   `toPng` (`charts/API.md:75`, `:252`) and ADR-0075 superseded that point of ADR-0032 because `toDataURL`
   cannot carry the axes. The row also lists "horizontal bars" as not built (consistent with ADR-0059 and the map's
   out-of-scope list). Change: the **skill** (and the row's "Instead"). Size S.
2. **The skill and CONTEXT name six packages, there are seven.** `SKILL.md:8` ("Six packages, all `0.x`", no
   alarms; the install block `:19-23` has no alarms line), `CONTEXT.md:3-5` (six, no alarms), `dashboard/README.md:129`
   ("all six packages"). `README.md` in the package folders says "all five packages" in 12 places
   (`core/README.md:9,20`, `charts/README.md:220,256,265`, `table/README.md:351,358`, `schedule/README.md:223,235`,
   `calculation/README.md:175`). One search and the German switch span seven packages
   (`README.md:81`). Change: **documents**; a guard that counts packages in prose is cheap to add. The skill also says "all `0.x`" (`:8`) and
   Firefox 120 (`:40`): a fifth place for each of the known claims. Size S.
3. **`CONTEXT.md:27-29` says the old `ariaLabel` "works for one more minor and warns".** It was removed
   (`charts/CHANGELOG.md:168`); no `ariaLabel` prop exists in `core`, `charts` or `table` `src` (only local
   variables in alarms). ADR-0083 says "no deprecated alias is alive in core or the table"; the context contradicts it. Change: **document**. Size S.
4. **`CONTEXT.md:1566-1572` says the CSV export is "still German"** (decimal comma, semicolon, `ja`/`nein`, "argued in
   `model/csv.ts`"). ADR-0061 and `table/src/model/csv.ts:10-11` say the conventions come from the language in
   use (`CsvConventions`). Change: **document**. Size S.
5. **`README.md:57` says "Node 22 and pnpm 9"; `CONTRIBUTING.md:9` and the `packageManager` field
   (`package.json:51`) say pnpm 12.15.0.** Change: **document** (pnpm line); ADR-0083 wants Node 22 in `engines` too
   (ticket 13). Size S.
6. **Root README and core README: "27 pages open with a configurator"** (`README.md:79`, `core/README.md:19`);
   `core/tests-unit/demo-smoke.test.tsx:92-97` pins 31 configurators and `demo/configurators/` holds 31. Change:
   **document**, or better make the count a generated figure. Size S.
7. **`docs/adr/README.md:3` says "Eighty-one decisions"; the table has 83 rows** (0001-0083). Change: **document**
   (drop the number). Size S.
8. **ADR status stands twice and disagrees in 16 ADRs.** Each ADR's `Status:` line and the table's status column
   differ for 0010, 0018, 0021, 0035, 0037, 0042, 0046, 0050, 0058, 0060, 0064, 0066, 0070, 0072, 0078, 0082. Examples:
   0082's file says `accepted`, the table `accepted, amends ADR-0072`; 0078's table adds "amends ADR-0035" which the
   file lacks; 0060's file names ADR-0076 as the second supersession, the table only ADR-0064; 0010, 0021, 0042, 0050, 0072
   are "accepted" in the file though the table lists a later amendment. One fact, two places (CLAUDE.md rule).
   Change: **documents**; a guard that compares the two (the table could be generated from the files). Size S (fix) / M (guard).
9. **`docs/testing.md:54-55` says no Playwright test draws the range band; one does**
   (`charts/tests-visual/features-interaction.spec.ts:705-707`, "an Alt drag draws the band mid-drag"). Change:
   **document**. Size S.
10. **`docs/releasing.md:15` lists CI as "lint, types, `check:site`, unit tests, build"**; `ci.yml:35` also runs
    `pnpm -r check:dist` and `ci.yml:39-45` a Semgrep job. Change: **document**. Size S.
11. **`TableView` doc comments** (`table/src/model/view.ts`): the type's comment (`:14-16`) lists the parts of the view
    but not `folded` and `branches`, which the interface carries (`:31-36`); `conditions` (`:19-20`) says "the conditions of
    the column filters" though row filters' conditions live there too (`useTable.tsx:43-49`, `:901` "column
    filters and row filters by id"), and it names no shape per filter kind (`ListCondition`, `RangeCondition`,
    `TextCondition`, `types.ts:596-628`). Change: **document** now; the type (`unknown`) is a surface candidate of ticket 06. Size S.
12. **`API.md` is named in neither consumer-facing README set.** It ships in every package (`table/package.json:33`) and is
    the promised surface, yet `core`, `charts`, `table`, `schedule` and `calculation` READMEs, the root README,
    `docs/README.md` and `CONTRIBUTING.md` do not mention it; only `dashboard/README.md:132`, `alarms/README.md:46`
    and `CLAUDE.md` do. Change: **documents** (a row in `docs/README.md`, a line in each README). Size S.
13. **The firefox/browser floor beyond the known claim.** The READMEs state Firefox 120 as the floor because of
    `light-dark()`. The source also uses `:has()` (12 files, e.g. `core/src/components/Checkbox/Checkbox.module.css:140`),
    the `popover` attribute (`core/src/components/Tooltip/Tooltip.tsx:190`, `Toast/Toast.tsx:467`),
    `text-wrap: balance` (`Typography.module.css:25`) and `@starting-style` (`Toast.module.css:68`). From my own
    knowledge of release dates (not re-checked against a source): `:has()` and `text-wrap: balance` shipped in
    Firefox 121, `popover` in 125, `@starting-style` in 129. If so the floor is higher than 120 even before
    the missing Firefox test. ADR-0083 lets a browser floor rise in a minor, but the number written down at 1.0 should be the checked one. Change: **document**
    (after ticket 12 decides what is tested), or a feature-by-feature floor check. Size S-M.

## C. Test and CI documents against the scripts

- **WebKit is run and documented nowhere.** `playwright.config.ts:62-77` adds a `table-webkit` project (Desktop
  Safari) to `pnpm test:visual`; `CONTRIBUTING.md:18` and `.github/workflows/visual.yml:30` install only
  Chromium, and `docs/testing.md` and `CONTRIBUTING.md` never mention WebKit (the only mention outside ADRs is
  `docs/agents/shakedown/README.md:41`). A fresh clone following "First run" would have a WebKit project without
  its browser (not run here). Either the docs gain `playwright install chromium webkit` or the project stays
  local. Change: **both documents and visual.yml**. Size S.
- **`CONTRIBUTING.md:35-36` says `check:site` runs "`props` in every package, and core's README table".**
  Each package's `check:site` also runs `checkReadmeLinks.ts` (`packages/*/package.json`, e.g.
  `table/package.json:78`); `props --check` is what compares `API.md` (CLAUDE.md says so, CONTRIBUTING does not). Change: **document**. Size S.
- **`docs/agents/triage-labels.md:11-14` says specs "are kept rather than deleted"; `docs/agents/issue-tracker.md:5`
  and `CONTRIBUTING.md:79-80` say a folder is deleted when its last ticket is done.** One of the two goes. Change: **document**. Size S.
- **`.github/workflows/visual.yml:1-3`** says the job "has never run on GitHub"; `docs/releasing.md:15` says "the screenshot suite stays local"
  - consistent, but ticket 12's question (is anything in CI a browser?) lands on both.

## D. Comments that break the repo's own rule

CLAUDE.md: "No ticket names, no history." 58 lines in `packages/*/src`, `demo`, `tests-*` and `scripts` cite
`.scratch/<folder>`; several folders no longer exist (`.scratch/ai-readable-docs` at
`packages/{core,charts,table,alarms,calculation}/demo/props.ts:14-29`, `.scratch/configurator` at
`core/tests-unit/demo-smoke.test.tsx:90`, `.scratch/sidebar-tree` at `core/demo/outline.ts:22`,
`.scratch/theming-and-wording-reference` at `core/demo/tooling/languageTables.ts:1`) and the tickets are named by
slug and number (`core/demo/props.ts:9-10`). A caller reading the published package never sees these (the demo
and tests are not packed), but anything under `src` does. Change: **source comments**. Size S for the
`src` ones, M for all (grep, rewrite as the why). No break.

## E. Checked and fine (so nobody re-checks)

- All relative links in `README.md`, `CONTRIBUTING.md`, `CONTEXT.md`, `docs/*.md`, `docs/agents/*.md` and the seven
  READMEs resolve to an existing file.
- Every backticked identifier and every import in the packages' READMEs (apart from `LICENSE`, `NoInfer`,
  `createRoot`, `minHeight`, `onCaughtError`, and the Jest/Next options in the charts README) exists in `src`
  or `API.md`.
- Package versions in the root README table (`README.md:15-21`) match the manifests (all 0.56.0).
- The tests named in `docs/testing.md` (range, xlsx, csv, limit and theme conformance, navigation) exist, apart
  from the note that `themeFallbackConformance.test.ts` lives in `core`, not charts (the text gives no path).
- ADR-0066's "six packages" (`:24`, `:36`, `:38`) is history and ADR-0083 supersedes it from 1.0; the ADR table's
  one-line summary for 0066 (`README.md:82`) still says "Six packages in step", which a reader of the table sees first.

## F. What this implies for 1.0

- A and B12 first: the contract named in ADR-0083 is `API.md`, so the generator is on the critical path
  before the file can be promised (source change, no break).
- B1-B10 are a one-sitting pass over documents; none breaks a caller; most can be prevented by a guard (package
  count, ADR status, README figures) at M cost, which fits "one fact, one place".
- Not found: any document that claims a prop or an export the source lacks. The drift is in prose (counts,
  packages, a removed alias, a German CSV) and in what the generated file leaves out.
