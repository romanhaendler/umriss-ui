# 08: What sizes with the text is rem; the token list says what is a measure

**What to build:** the space scale, the icon sizes, the buttons' paddings and the widths of modal, drawer and toast are rem, each equal to its former px at a 16px root; `--u-control-height-xs` goes; `--u-shadow-sticky` and `--u-color-edge-hover` get their new names with an alias; the design language names the measures, the naming scheme, and lists the dashboard's and the charts' tokens. See the spec's "Tokens"; findings T2, T4, T5, T6, D5 and section 3.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Size:** M (Sonnet, chain C)

- [ ] A test: every token that became rem equals its former px value at 16px
- [ ] The alias test covers the two renamed tokens; no rule in the workspace reads an old name
- [ ] The report says, per token group, what changed and what stayed px and why
- [ ] The changelog lines stand in the report, a `Migration:` under every Changed
- [ ] `pnpm check` for every package touched, `pnpm typecheck` and `pnpm check:site` are green
