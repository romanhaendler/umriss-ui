# 04 - Table, schedule, calculation and dashboard in both runners

Status: ready-for-agent
Type: task
Size: S

Blocked by: `03-a-chart-is-testable-in-jsdom.md`
Spec: `.scratch/test-runners/spec.md`

## What to build

The other four packages keep the same promise. Each loads in Vitest 5 and Jest 30 with the documented lines,
and its README says where those lines are.

- **Exports.** Each package's JS entries get the `default` condition.
- **Each README** gets a short Testing section:
  - table, calculation and dashboard point at core's section;
  - schedule points at core's and charts' sections, since it draws with charts.
- **The check.** Each package's `check:dist` runs a consumer test in both runners, built from core's blocks
  (and charts' blocks for schedule). The tests:
  - table: sort a column;
  - schedule: render a lane with a bar and read its accessible text;
  - calculation: change an input and read the result;
  - dashboard: render a widget and read its title.

  Each asserts on roles, names and text.

## Acceptance criteria

- [ ] `pnpm -r check:dist` passes, and runs a consumer test of every published package under both runners.
- [ ] Every JS entry of every published package has a `default` equal to its `import`.
- [ ] `pnpm check` and `pnpm check:site` pass.
- [ ] The changelog notes the `default` condition per package.
