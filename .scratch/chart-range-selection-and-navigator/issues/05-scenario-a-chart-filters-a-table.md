# 05 — Scenario: a chart filters a table

Status: ready-for-agent
Type: task
Size: M

Blocked by: 01, 02, 03
Spec: decision R11; user story 23

## What to build

The scenario "A chart filters a table" (row X6 of the roadmap): no feature, a
screen built with the range. A reader marks a stretch of a course and a table
beside it shows the rows of that stretch; a button clears it.

It lives in **core's demo**: `packages/core/demo/scenarios/06-<slug>.tsx`.
Charts depends on nothing, so its own demo cannot hold a table; core's demo
reaches every package's sources by the aliases in `vite.demo.config.ts`, and
scenarios 01 and 05 already import `@umriss-ui/charts` and
`@umriss-ui/table` beside core's own parts. Follow their form: the exports
`title`, `lead`, `callouts`, `builtFrom`, and a default component, with data
written out in the file, and three or four callouts pointing at what to look
at.

The pieces: `useChart` with `onRange` and a time axis, the range held in the
scenario's `useState`, the table filtered from it - read the table package's
`rowFilter` and `useTable` (`packages/table/src/index.ts`) and use the way a
condition from outside reaches the table, not a copy of the rows - and the
chart drawing the range back with the bands it already has (a `LimitBand`), the
way an application draws what it keeps (ADR-0056).

## Acceptance

- [ ] The scenario stands in the order of the others on the scenarios page;
      the guards that count scenarios (visual `pages.ts`, the smoke test, the
      own-data check) pass with six.
- [ ] A unit test of the filter the scenario holds: a range selects exactly
      the rows inside it, both ends included; a cleared range selects all.
- [ ] Screenshot baselines of the scenario, with and without a range, looked
      at before they are accepted; forced colours where the others have them.
- [ ] The accessibility check passes; the keyboard marks a range in the
      scenario (Space, walk, Space) and the table follows.
- [ ] `builtFrom` links the chart and the table.
