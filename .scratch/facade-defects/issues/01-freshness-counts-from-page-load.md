# 01: Freshness counts from page load

Status: done
Blocked by: None (can start immediately)
Spec: `.scratch/facade-defects/spec.md`

**What to build:** No scenario ages into an error state. The table's landing scenario "Work through the alerts" shows a live-looking alarm list again: its feed's `asOf` is the moment the page was loaded minus forty seconds, while the world keeps its fixed moment for every alarm, acknowledgement and task time. Every other scenario and example that pairs a fixed moment with freshness (the kiln line, the Stat examples, the Given example, the AlarmList examples) is brought under the same rule; examples whose subject is a stale or lost feed keep showing it, relative to load. The rule ("a world has a fixed moment; a feed's freshness counts from page load") is written once in the shell's description of worlds.

- [x] The table landing shows no stale or lost feed today.
- [x] Each of the five demos' jsdom smoke tests has a case that sets the system clock to 1 January 2030 and renders every scenario without the wording for a lost or a stale feed.
- [x] The examples that demonstrate stale and lost feeds still show those states.
- [x] Alarm, acknowledgement and task times in the scenarios are unchanged.
- [x] The rule is written once, in the shell's description of worlds.
- [x] The table landing's screenshot baseline is renewed.

## Comments

**Delivered (2026-10-03).**

- `table/demo/scenarios/01-work-through-the-alerts.tsx`: the AlarmList's `asOf` is `LOADED - 40_000` (`LOADED = Date.now()` at module load, the pattern of core's service overview). `alarmModel`'s `asOf`, the acknowledgements and the snoozes keep the world's `NOW` (17 March 2026, 10:30), so alarm, acknowledgement and duration times are unchanged.
- `calculation/demo/examples/Worked-examples/01-cost-per-tour.tsx`: the diesel price (with ages) had a fixed `asOf` and so read "No connection" today instead of the "Stale" its lead promises. It is now read `at(10, 30) - 14 March 06:00` before load: stale, 3 days, exactly as under the screenshots' frozen clock.
- Checked and already under the rule, unchanged: the kiln line (its `wall` clock starts at mount), Stat 07 freshness and 09 service overview (`LOADED`), Given 01 (mount time), AlarmList 05 quiet vs disconnected (`Date.now()`). Given 02 passes `asOf` without ages, so it shows a time and no freshness; it keeps its fixed dates. AlarmList 01–04 hand `asOf` only to `alarmModel` (world time), not freshness. No other scenario in the five demos passes a freshness.
- The rule is written once, in the header of `packages/demo/src/Scenarios.tsx` (the shell's scenarios page, which introduces the worlds).

Tests: each of the five demos' smoke tests (`core`, `charts`, `table`, `schedule`, `calculation`) has the case "show no stale or lost feed when the page is loaded in 2030": fake `Date` set to 1 January 2030, `vi.resetModules()` and a fresh import of the demo, so that a module-level load moment is also taken in 2030. Then every scenario renders without `DEFAULT_WORDING.freshnessDisconnected` or `freshnessStale`. Seen red on the table before the fix ("No connection · 1,385 days ago"). `pnpm lint`, `pnpm typecheck` and `pnpm test:unit` are green. Playwright table and calculation `screenshots.spec.ts` (light and dark): 388 passed.

Baselines moved: `scenario-work-through-the-alerts-table-{light,dark}` ("Fresh · now" becomes "Fresh · 40 seconds ago"). The scenarios page head (`page-scenarios-table-*`) does not reach the alarm list's freshness and stays as it was. The scenario's change was within `maxDiffPixelRatio` 0.001, so the comparison alone did not catch it; the two images were renewed on purpose with `--update-snapshots=all` and looked at.

Deviations: no CHANGELOG entry, because nothing a caller of a package can see changes (demo only). The change in `packages/demo` is a comment and has no effect at runtime, so the shell, page and screenshot suites of all five projects were not run for it.
