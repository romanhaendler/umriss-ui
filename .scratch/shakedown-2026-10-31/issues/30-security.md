# 30: Security - link targets and export file names

Status:     done
Blocked by: None (can start immediately)

Sources: earlier-runs-open security.md 2, 3.

- [x] `Link` refuses `javascript:`, `vbscript:` and `data:` targets like Breadcrumb's `isSafeTarget` (one shared helper), with a DEV warning; README says which targets pass.
- [x] `Export`'s `filename` is reduced to a safe file name (no path separators, control characters or reserved names) before it reaches `a.download`.
- [x] Unit tests; `pnpm check core`, `pnpm check table`, `pnpm semgrep` if Docker runs.

## Comments

**Delivered (2026-10-31, run coordinator).** One `safeTarget` in core for `Link` and `Breadcrumb` (http,
https, mailto, tel, relative and fragment pass; a refused href is not written, warns once); one
`safeFileName` in the table for the download name (control and path characters, dots, device names fall
back to the default). Left: `pnpm semgrep` not run by the worker (Docker down) - run at the release.
