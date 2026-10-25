# 03 - A chart is testable in jsdom

Status: ready-for-agent
Type: task
Size: S

Blocked by: `02-core-loads-in-vitest-and-jest-with-its-readmes-lines.md`
Spec: `.scratch/test-runners/spec.md`

## What to build

An application that copies the Testing section of charts' README can test a chart in jsdom the way a user
uses it. The chart lays out, "Show data" opens its table, and a legend click hides a series. All of it works
without core, and without any internal class name of the library.

- **Exports.** Charts' JS entries get the `default` condition, as core's did.
- **Charts' README** gets a Testing section:
  - the runner lines, given in full rather than as a pointer to core's README, because a charts-only
    application installs no core;
  - a setup file with a ResizeObserver that reports a fixed size, and a `getContext` stub. 600 × 280 was
    shown to be enough.
- **The check.** `check-dist` uses charts' blocks for charts. Its consumer test renders a line chart,
  toggles a legend entry and opens "Show data". It asserts on the data table's rows and the legend's
  pressed state.

## Acceptance criteria

- [ ] `pnpm --filter @umriss-ui/charts check:dist` runs charts' consumer test under Vitest 5 and Jest 30, and
      passes.
- [ ] Without charts' setup block, the test fails: "Show data" opens no table.
- [ ] The setup names no class or attribute of the library's internals.
- [ ] jsdom logs no "getContext() not implemented" during the check.
- [ ] `pnpm check charts` and `pnpm check:site` pass.
- [ ] The changelog notes the `default` condition and the Testing section.
