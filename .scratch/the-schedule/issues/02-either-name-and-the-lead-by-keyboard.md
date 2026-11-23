# 02: Either name names a schedule; a lead-in and a lead-out by keyboard

**What to build:** `aria-label` or `aria-labelledby` by type; a chord that changes the active subtask's lead-in and lead-out through the existing intents. See the spec's last decisions; finding in research 21.

**Blocked by:** 01

**Status:** ready-for-agent

**Size:** M (Sonnet, continued)

- [ ] A unit test at the keys' existing seam: the chord reports `leadIn` / `leadOut` with the snapped time, and a refusal is announced
- [ ] The demo's keyboard section and the keys' help name the chord
- [ ] The report proposes the chord with its neighbours, for the coordinator to try in the browser
- [ ] The changelog lines stand in the report, a `Migration:` under every Changed
- [ ] `pnpm check` for every package touched, `pnpm typecheck` and `pnpm check:site` are green
