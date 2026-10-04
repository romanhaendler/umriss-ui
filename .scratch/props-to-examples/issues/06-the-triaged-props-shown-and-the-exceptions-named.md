# 06: The triaged props shown, and the exceptions named

Status: ready-for-agent
Blocked by: `configurator` 03 (Every core page that can be configured opens with a configurator)
Spec: `.scratch/props-to-examples/spec.md`

**What to build:** Carry out the owner-approved triage in `.scratch/props-to-examples/unshown-triage.md` (4 Oct 2026). Per package, in its own worktree (core, charts, table, schedule):

- **Missing** entries get the example or extension the triage sketches. Before writing one, check whether `configurator` 03 already shows the prop (a configurator's use counts); if so, only remove the entry.
- **Charts axes (owner's decision):** one new Axis example binds several series kinds (line, area, bar, scatter …) to a second y axis, so the twin entries `xAxisId`/`yAxisId` per series kind are shown for real, not excepted. Category (f) stays for the remaining twins.
- **Shown, uncounted:** annotate the two Toast literals (`: ToastConfig`, `useMemo<ToastConfig>`) so the scan counts them.
- **Fix the two examples that promise more than they show:** ControlChart/02 uses `onViolations` for the list it shows; schedule Interactions/01 reads `interaction.lane` as its lead promises.
- **Exceptions keep their entry in `unshown.json`, but the reason becomes their category and one-line reason from the triage** instead of "not shown yet", so every gap left is a named decision. The gate's comment and `docs/testing.md` say that an entry's reason is either "not shown yet" or a category (a)/(b)/(f)/(g).

- [ ] Every Missing entry of the triage is shown and gone from its `unshown.json`.
- [ ] Every remaining entry carries a category and reason; none reads "not shown yet".
- [ ] The Axis example shows at least four series kinds on a second y axis.
- [ ] ControlChart/02 and Interactions/01 do what their leads say.
- [ ] lint, typecheck (the gate), `pnpm test:unit` and the affected visual suites green; new pictures looked at.
