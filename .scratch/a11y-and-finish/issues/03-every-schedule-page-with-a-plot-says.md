# 03: Every schedule page with a plot says its keys

Status: ready-for-agent
Blocked by: 02 (The silent-page check, with charts and calculation filled)
Spec: `.scratch/a11y-and-finish/spec.md`

**What to build:** The check wired into the schedule demo. Every page with a plot gets `keysOf: ["schedule"]`; Dependencies gets its own rows for `]`, `[` and `t`/`T`, and Pan and zoom its own rows for Home/End and PageUp/PageDown (both also staying on First schedule); First schedule gets an Accessibility section for the plot's role, readout and summary.

- [ ] The check passes on every schedule page, exceptions reasoned
- [ ] Dependencies and Pan and zoom show their own rows plus the link to First schedule's keys
- [ ] Screenshot baselines renewed for the pages that gained sections
