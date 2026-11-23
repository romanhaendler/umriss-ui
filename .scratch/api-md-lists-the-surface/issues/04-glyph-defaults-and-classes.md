# 04: A glyph prints its own default; a class is a class

**What to build:** core's `API.md` prints for each glyph the default size its code applies (9, 10, 12 or 16),
not 12 for all; a class (`LinearScale`) stands under "Classes", not "Constants"; the writer's comment on the
wording's size no longer names a stale count. No runtime default changes. Findings:
`.scratch/release-1-0/research/04-the-surface-of-core.md` E1,
`.scratch/release-1-0/research/05-the-surface-of-charts.md` A2,
`.scratch/release-1-0/research/10-the-documents-agree-with-the-source.md` A5.

**Blocked by:** 03

**Status:** ready-for-agent

**Size:** S (same agent as 01, continued)

- [ ] Each glyph's printed default equals the default in its code; a test holds it for every exported glyph
- [ ] `LinearScale` is under `## Classes` in charts' `API.md`
- [ ] The seven `API.md` are regenerated; `pnpm check demo`, `pnpm check core` and `pnpm check:site` are green
