# 06 - Example: drill down

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/linked-views/spec.md`

## What to build

Drill-down along a time hierarchy is the application's stack over `onSelect`, not a feature of the charts.
One example on the charts' Tooltip page, after "Choose a hit", shows it. Write the data out in the file, as the
other examples do.

- Bars per year on a category axis.
- `onSelect` on a year goes into that year's months, and on a month into its days.
- A demo button goes back up one level and names the level it returns to.
- The levels are a stack in the example's state. The rows and the axis' categories follow the level.
- The lead says that the chart keeps no level (ADR-0056).

## Acceptance criteria

- [ ] The example stands on the Tooltip page after "Choose a hit". The demo's smoke test and own-data check
      pass.
- [ ] A screenshot baseline of the year level, looked at before it is accepted.
- [ ] The accessibility check passes. With the keyboard alone, Enter on a bar drills in and the button goes
      back up.
- [ ] `pnpm check charts` and `pnpm check:site` pass.
