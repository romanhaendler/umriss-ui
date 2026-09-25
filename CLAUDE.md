# umriss

A pnpm workspace with six packages: `packages/core`, `packages/charts`, `packages/table`, `packages/schedule`, `packages/calculation` and `packages/demo`. `@umriss-ui/table` depends on `@umriss-ui/core` (ADR-0016); `@umriss-ui/schedule` depends on `@umriss-ui/core` and `@umriss-ui/charts` (ADR-0022); `@umriss-ui/calculation` depends on `@umriss-ui/core` only; nothing depends on the table, the schedule or the calculation, and `@umriss-ui/charts` itself depends on nothing. `@umriss-ui/demo` is the private shell all five demos are built from (ADR-0020); it is never published. Core's demo alone reaches the other four packages' sources by alias, for its control room page; that is a demo's import, not a package dependency.

Which document answers which question stands in `docs/README.md` — the map over
everything that is not source.

Everything in the workspace is English — identifiers, prose and the default wording (ADR-0018). German ships as the subpath `@umriss-ui/core/wording/de` (ADR-0019).

## Agent skills

### Issue tracker

Issues live as markdown files under `.scratch/<feature-slug>/` in this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, each label string equal to its name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
