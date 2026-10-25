# 05 - Scenario: trace a batch

Status: ready-for-agent
Type: task
Size: M

Blocked by: `03-the-current-row-by-the-keyboard.md`, `04-the-current-row-comes-into-view.md`
Spec: `.scratch/linked-views/spec.md`

## What to build

Linked views as a scenario, not a feature. Core's demo is the only one that reaches all three packages. Its
scenarios page gets a new scenario, after the scenarios that stand, in which a table, a schedule and a chart
follow one batch.

Follow the form of the scenarios that stand:

- the exports `title`, `lead`, `callouts` and `builtFrom`, and a default component;
- the data written out in the file;
- three or four callouts.

The pieces:

- **The key** is the batch id, held in the scenario's `useState`. Nothing else holds it.
- **The table** of the shift's batches, with `rowHeader` on the batch name, takes `currentRow` and
  `onCurrentRowChange`.
- **The schedule** of the shift takes `selectedTask` and `onSelectedTaskChange`; the batch id is the task.
- **The chart** shows the kiln temperature over the shift, on a time axis.
  - It draws the current batch's stretch as a `LimitBand` with `orientation="x"`: the application draws what
    it keeps (ADR-0056).
  - `onSelect` on the trend makes current the batch that ran at the chosen instant.
- One callout says that no view knows the others.

## Acceptance criteria

- [ ] The scenario stands in order on the scenarios page. The guards that count scenarios pass: the visual
      pages list, the smoke test and the own-data check.
- [ ] A unit test of the scenario's lookup from an instant to a batch covers an instant inside a batch (both
      ends included) and an instant between batches.
- [ ] Screenshot baselines with and without a current batch, and in forced colours where the other scenarios
      have them, looked at before they are accepted.
- [ ] The accessibility check passes. With the keyboard alone, a reader chooses a batch in the table and the
      schedule and the chart follow; Enter on the chart's Active point moves the table's current row.
- [ ] `builtFrom` links the table, the schedule and the chart.
