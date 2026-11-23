# 01: Density has one word

**What to build:** core's `Density` is `"regular" | "compact"`; `"comfortable"` still works for this minor and warns; `useDensity()` returns `undefined` where nobody set one, and nothing looks different; the packages that mapped core's word to their own drop the mapping; `CONTEXT.md`'s entry follows. See the spec's "Density" and "A rename keeps its old name"; finding A1.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Size:** M (Sonnet, chain A)

- [ ] `density="comfortable"` renders as before and warns once in development; `"regular"` warns nowhere
- [ ] No package or demo of the workspace passes or maps `"comfortable"` any more
- [ ] `useDensity()` outside a provider returns `undefined`; a test holds it, and each reader's default is unchanged
- [ ] The changelog lines stand in the report, a `Migration:` under every Changed
- [ ] `pnpm check` for every package touched, `pnpm typecheck` and `pnpm check:site` are green
