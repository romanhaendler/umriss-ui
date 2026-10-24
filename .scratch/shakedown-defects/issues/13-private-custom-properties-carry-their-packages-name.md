# 13: Private custom properties carry their package's name

Spec: `.scratch/shakedown-defects/spec.md` (Custom properties)
Finding: `cross-package.md` 16

**What to build:** in every package but core, a private custom property is
named `--_<package>-<name>` (`--_dashboard-column`, `--_calculation-line-pad`,
`--_table-pad`); core's own `--_` names and the public `--u-` and `--uc-`
tokens stay. A Calculation inside a dashboard widget lays out as anywhere
else. The shared style guard fails on a custom property a stylesheet declares
or reads that is neither a public token nor its own package's private name.

**Blocked by:** 12 (same dashboard component)

**Status:** ready-for-agent

- [ ] Red first: the shared style guard's new rule fails today on dashboard, calculation and table
- [ ] The names renamed in table, calculation, dashboard (and schedule, if any); the inline styles the components write follow
- [ ] A Calculation in a dashboard widget: labels, figures and operators in their columns (checked on a screenshot of a demo page or a host)
- [ ] `pnpm check` green for table, schedule, calculation, dashboard; `pnpm test:visual:quick` for calculation and dashboard green
- [ ] Finding 16 struck from `.scratch/shakedown/cross-package.md`
