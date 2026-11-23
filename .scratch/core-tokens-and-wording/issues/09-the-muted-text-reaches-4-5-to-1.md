# 09: The muted text reaches 4.5:1

**What to build:** the muted text token reaches 4.5:1 against every surface it stands on, light and dark; the list of tolerated colour pairs is empty and axe is green on every page; `CONTRIBUTING.md` and the README say so. **Not merged until the maintainer has seen before and after**: the coordinator takes the screenshots. See the spec's "The muted text"; findings in research 12.

**Blocked by:** 08 (same tokens file); every other ticket of this spec (it goes last, on its own commit)

**Status:** ready-for-agent

**Size:** M (Sonnet, chain C)

- [ ] The report names the old and the new value per theme, and the contrast against each surface
- [ ] The tolerated list is empty
- [ ] No other colour token changes
- [ ] The changelog lines stand in the report, a `Migration:` under every Changed
- [ ] `pnpm check` for every package touched, `pnpm typecheck` and `pnpm check:site` are green
