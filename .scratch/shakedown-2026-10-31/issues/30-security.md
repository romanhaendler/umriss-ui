# 30: Security - link targets and export file names

Status:     ready-for-agent
Blocked by: None (can start immediately)

Sources: earlier-runs-open security.md 2, 3.

- [ ] `Link` refuses `javascript:`, `vbscript:` and `data:` targets like Breadcrumb's `isSafeTarget` (one shared helper), with a DEV warning; README says which targets pass.
- [ ] `Export`'s `filename` is reduced to a safe file name (no path separators, control characters or reserved names) before it reaches `a.download`.
- [ ] Unit tests; `pnpm check core`, `pnpm check table`, `pnpm semgrep` if Docker runs.

## Comments
