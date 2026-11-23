# 02: Comments say what the code does, not which ticket made it

**What to build:** no comment under `packages/*/src`, `packages/*/demo`, `packages/*/tests-*` or `scripts`
cites a `.scratch` path, a ticket by slug or number, or tells history; each is rewritten to what the code
does now and why, or deleted where it says nothing else. A unit test in the demo package fails for
`.scratch/` in those trees. Only comments change: no code, no test expectation. Findings: section D of
`.scratch/release-1-0/research/10-the-documents-agree-with-the-source.md`, and B7 of
`.scratch/release-1-0/research/05-the-surface-of-charts.md` (history in charts' public doc comments).

Other workers edit code in the same files at the same time: change only the comment lines.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Size:** M, mechanical (Haiku)

- [ ] `grep -rn "\.scratch" packages/*/src packages/*/demo packages/*/tests-* scripts --include=*.ts --include=*.tsx --include=*.css --include=*.mjs`
      finds nothing but the new test's own pattern
- [ ] `git diff` shows comment lines only (and the new test)
- [ ] `pnpm check:site` is green (doc comments feed `API.md`; regenerate where stale), `pnpm typecheck` too
