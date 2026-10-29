# 03: Table, alarms, schedule, calculation and dashboard warn through core's helper

**What to build:** "Once", the development gate and the message prefix are one implementation: the packages that depend on core use core's warn-once helper, and their own copies go. Charts keeps its own, since it depends on nothing. Each message still names the package that warns. Spec: `../spec.md` ("One warn-once helper").

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] No package except core and charts defines a warn-once helper of its own
- [ ] Every existing warning test of the five packages stays green unchanged (once, silent in production, wording)
- [ ] A warning names its package in its prefix as before
