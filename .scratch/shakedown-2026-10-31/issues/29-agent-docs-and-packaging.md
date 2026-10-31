# 29: Agent docs and packaging

Status:     ready-for-agent
Blocked by: None (can start immediately)

Sources: earlier-runs-open agent-docs 2, 3, 6, 7, security 4, design-system 7.

- [ ] `llms.txt`: each scenario links its own anchor; an `## Optional` section as llmstxt.org shapes it.
- [ ] `llms-full.md` starts with what a consumer reads first (install, provider, the components), scenarios after.
- [ ] The everyday words that found nothing are findable (charts: brush, annotation, live, dark; core: validation; table: resize; schedule: baseline, critical path; calculation: variable, step) - an index line or the word in the right section.
- [ ] The published `package.json` carries no dev-only scripts (`props`, `dev`, `check:dist`) - stripped at pack time.
- [ ] `API.md` ships in the tarball (`files`), so a wrapper library's docs can read the props.
- [ ] `pnpm check:site`; a `pnpm pack` inspected.

## Comments
