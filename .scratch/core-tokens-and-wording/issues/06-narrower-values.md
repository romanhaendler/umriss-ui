# 06: `Input`, `Textarea` and `Select` say what value they take

**What to build:** `Input` and `Textarea` take `string | null`; `Select` gives up the native `multiple` and its value is `T | null`. Read findings C1 and C2 for the present types first. No old form is kept: each stands under "Changed" with a migration line. Report every caller in the workspace that relied on the wider form.

**Blocked by:** 05

**Status:** ready-for-agent

**Size:** M (Sonnet, chain B)

- [ ] Type tests hold the new value types, and what no longer compiles
- [ ] At run time nothing that was right before behaves differently
- [ ] The changelog lines stand in the report, a `Migration:` under every Changed
- [ ] `pnpm check` for every package touched, `pnpm typecheck` and `pnpm check:site` are green
