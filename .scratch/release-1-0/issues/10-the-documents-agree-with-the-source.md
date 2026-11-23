# The documents agree with the source

Type:   research
Status: resolved

## Question

Where does a document say something the source does not do, or leave out what a caller needs?

- Doc comments on the public types against the behaviour. Known instance: `TableView.conditions`
  (`packages/table/src/model/view.ts`) says "the conditions of the column filters, per column", yet row
  filters' conditions live there too, and it names no shape per filter kind.
- The packages' `README.md` against `API.md`.
- `CONTEXT.md` against the names in the source.
- ADRs overtaken by later ones without saying so (ADR-0066 speaks of six packages; there are seven published).
- `docs/README.md`, `CONTRIBUTING.md`, `docs/releasing.md`, `docs/testing.md` against what the scripts do.

Sample widely rather than read everything; say what was sampled. Candidates only.

Findings: `.scratch/release-1-0/research/10-the-documents-agree-with-the-source.md`

## Answer

Findings: `.scratch/release-1-0/research/10-the-documents-agree-with-the-source.md`, each with its line, and
with what was sampled and what was not read. Nothing was built or run.

No document claims a prop or an export the source lacks. The drift is in counts, package lists, removed
behaviour, and in what the generated file leaves out.

- **Why `API.md` leaves out props.** `packages/demo/src/tooling/apiMd.ts:113-122` writes a props table only
  for a component that is itself exported, never for one a hook returns (`Table`, `Column`, `Action`,
  `Chart`, `Schedule`, `Dashboard`); `propsSyntax.ts:30-34` keeps property signatures only, so a member
  written as a method vanishes (`exportAs`, `TableRef.setFilter`, the charts' `Scale.toPx`). Core, the
  calculation and the alarms are complete. The generator knows no `@experimental`.
- **`skills/umriss-ui/SKILL.md`** sends an agent to `canvas.toDataURL()` where `toPng` exists (ADR-0075),
  says "six packages", and is a fifth place that states the Firefox floor.
- **Counts**: six packages in `CONTEXT.md` and the dashboard's README, "all five packages" at twelve places
  in the READMEs, pnpm 9 against 12.15.0, 27 configurator pages against 31.
- **`CONTEXT.md` against the source**: an `ariaLabel` alias that was removed; a CSV export "still German"
  against ADR-0061.
- **An ADR's status stands twice and disagrees in sixteen**: the file's `Status:` line and the index's
  column. The index counts "Eighty-one decisions".
- **`TableView`'s doc comments** leave out `folded` and `branches` and the row filters' conditions.
- **WebKit runs** (`table-webkit` in `playwright.config.ts`) and no document or workflow installs or names it.
- **The Firefox 120 floor**: the source uses `:has()`, the `popover` attribute, `text-wrap: balance` and
  `@starting-style`; whether Firefox 120 has them all was not checked against a source. It goes to "The
  acceptance criteria".
- Smaller: `docs/testing.md`, `docs/releasing.md` and `CONTRIBUTING.md` each describe a check incompletely;
  58 code comments cite `.scratch/` folders, against the rule on ticket names.

*(agent)* None of this breaks a caller, and all of it is set right before 1.0: ADR-0083 makes `API.md` the
list of the surface, so the generator comes first (hook-returned components, method members,
`@experimental`), with a guard that an ADR's status stands once.
