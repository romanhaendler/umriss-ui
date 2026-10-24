# 15: Freshness after a clock step - reproduce first

Spec: `.scratch/shakedown-defects/spec.md` (Freshness)
Finding: `kiosk.md` 1

**What to build:** a `Stat`'s freshness is right within one cadence after the
wall clock steps an hour forward or five minutes back. The red uses a clock
whose timers keep running in real time while the wall clock steps; the
shakedown's Playwright clock moved the time without running timers, and the
current interval re-reads the time on every tick. If the reading is right
within one cadence, the test stays as a guarantee and the finding closes as a
measurement artefact. Only if it is not does the reading get re-taken on
`visibilitychange` and on a heartbeat comparing the wall clock with the armed
deadline.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Core's freshness test: stale 60 s, lost 1 h; the wall clock steps +1 h with timers running - "lost" within one cadence; steps back 5 min - fresh again within one cadence
- [ ] Either no source change (finding closed as an artefact, with what was measured) or the re-reading above with the test red first
- [ ] `pnpm check core` green
- [ ] Finding 1 struck from `.scratch/shakedown/kiosk.md`, or annotated with the measurement
