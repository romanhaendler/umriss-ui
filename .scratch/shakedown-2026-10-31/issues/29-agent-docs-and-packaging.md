# 29: Agent docs and packaging

Status:     done
Blocked by: None (can start immediately)

Sources: earlier-runs-open agent-docs 2, 3, 6, 7, security 4, design-system 7.

- [x] `llms.txt`: each scenario links its own anchor; an `## Optional` section as llmstxt.org shapes it.
- [x] `llms-full.md` starts with what a consumer reads first (install, provider, the components), scenarios after.
- [x] The everyday words that found nothing are findable (charts: brush, annotation, live, dark; core: validation; table: resize; schedule: baseline, critical path; calculation: variable, step) - an index line or the word in the right section.
- [x] The published `package.json` carries no dev-only scripts (`props`, `dev`, `check:dist`) - stripped at pack time.
- [x] `API.md` ships in the tarball (`files`), so a wrapper library's docs can read the props.
- [x] `pnpm check:site`; a `pnpm pack` inspected.

## Comments

**Delivered (2026-10-31, run coordinator).** llms.txt has `## Optional` linking the full text and links
each scenario `index.md#<slug>`; `llms-full.md` puts the pages (Getting started first) before the
scenarios; everyday words in page sentences (brush, live edge, annotation, dark, validation, resize,
baseline, critical path, variable, step); `API.md` in every package's `files`; the packed manifest
carries no scripts (`prepack`/`postpack` with `scripts/packManifest.mjs`); `check-dist` packs and checks
both. Also fixed: core's emitted types did not compile for a strict consumer (NumberInput's `name`
clashed with `FormPostProps`) and 11 deprecation markers lacked "since 0.52" - `pnpm -r check:dist`
passes for all seven. Decided: the llms tests' pinned link and order moved to the ticket's (coordinator's
call). Left: a schedule baseline and a critical path are not built - the words name the nearest feature.
