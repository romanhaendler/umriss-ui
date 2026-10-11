# umriss

A pnpm workspace with six packages: `packages/core`, `packages/charts`, `packages/table`, `packages/schedule`, `packages/calculation` and `packages/demo`. `@umriss-ui/table` depends on `@umriss-ui/core` (ADR-0016); `@umriss-ui/schedule` depends on `@umriss-ui/core` and `@umriss-ui/charts` (ADR-0022); `@umriss-ui/calculation` depends on `@umriss-ui/core` only; nothing depends on the table, the schedule or the calculation, and `@umriss-ui/charts` itself depends on nothing. `@umriss-ui/demo` is the private shell all five demos are built from (ADR-0020); it is never published. Core's demo alone reaches the other four packages' sources by alias, for its control room page; that is a demo's import, not a package dependency.

Which document answers which question stands in `docs/README.md` — the map over
everything that is not source.

Everything in the workspace is English — identifiers, prose and the default wording (ADR-0018). German ships as the subpath `@umriss-ui/core/wording/de` (ADR-0019).

## Agent skills

### Issue tracker

Open issues live as markdown files under `.scratch/<feature-slug>/` in this repo; a folder is deleted when its last ticket is done. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## What exists

Before stating what a package can or cannot do, read its `packages/<pkg>/API.md`: every export, and the props, options and returns of each component and hook, one line each.
Generated and checked in; do not edit it, and do not infer absence from `types.ts` alone.

## Checking a change

- `pnpm check <package>`: shrink guard, eslint, `typecheck` and `test:unit` of one package (`core`, `charts`, `table`, `schedule`, `calculation`, `demo`); without a name, all of them. Stops at the first failure.
- `pnpm check:site`: the demo gates (props, core's README table, and that each `packages/<pkg>/API.md` is current; `pnpm --filter @umriss-ui/<pkg> props` rewrites it).
- `pnpm typecheck`: `typecheck` and `typecheck:demo` of every package.
- `pnpm test:visual:quick <package>`: the cheap layout checks (tests tagged `@quick`) of one demo, light only, about a minute after the build.
- `pnpm test:visual`: the full visual suite; `DEMOS=table,charts` limits servers and projects to those packages.
- `pnpm test:visual:on-main '<pattern>'`: the tests matching the pattern run against an export of `main` - was it me?

## Where a fact is written

- One fact, one place: a change touches the source, its test, its example and - at release - the changelog.
- An ADR is written only for a decision that is costly to reverse; anything smaller is the commit message.
- A comment says what the code does now and why it must be so. No ticket names, no history.
- The journal (`docs/journal.md`) is frozen; `.scratch/` holds open work only. See `CONTRIBUTING.md`.
