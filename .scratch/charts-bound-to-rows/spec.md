# Charts declared like the table

Status: ready-for-agent
Date:   2026-10-04
Origin: grilling of 2026-10-04 (charts research "zoom and the legend"); ADR-0048.
Released with: `.scratch/component-view/` - one release breaks charts, table and schedule once.

## Problem Statement

A developer who knows `useTable` meets a different library in the charts: a
free `<Chart data>`, free series, and an `accessor` function on every series
and axis whose parameter is annotated by hand - 406 of them in the workspace,
346 of which only read a field. Functions are compared by their source text,
so an accessor that reads a changed captured variable does not update the
chart. The schedule is a third shape again: a component with a ref handle.

## Decisions (grilling 2026-10-04)

| # | Question | Decision |
|---|---|---|
| Q1 | Scope | Two efforts, one ADR each: this one (the declaration) and `component-view` (the view). Built in sequence, released together (Q19). |
| Q15 | Series with their own `data` | Bound series inherit the hook's rows; a series with its own `data` is a generic component typed by that `data`. No hook per data source. |
| Q16 | Naming the value | `accessor` becomes `value` everywhere: a field name of the row or a function, as `Column value`. Named channels (`baseline`, the box channels) keep their names and take the same two forms (ADR-0011). |
| Q17 | Hook or import | The hook returns `Chart`, `XAxis`, `YAxis` and every series kind. Free imports: `Legend`, `Tooltip`, `DataTable`, `LimitLine`, `LimitBand`. No free `Line` and kin. `ControlChart` stays a component typed by its own `data`. |
| Q18 | Hook options vs props | `useChart(rows, { initialView, onViewChange })`; `<Chart>` keeps `ariaLabel`, `height`, `width`, `padding`, `wording`, `encoding`, `syncId`, `empty`, `onPerf`. `data` leaves `<Chart>`. |
| Q7 | The schedule | `useSchedule(options)` returns `Schedule` and its parts with the view and its setters (shape in `component-view`); it binds no row type, the model types are the library's. |
| Q11 | Migration | The old shape is removed, not deprecated. |
| Q27 | Matrix naming (2026-10-04, after 02) | `value` is the y position on every series kind, Matrix included; Matrix's colour channel, `value` until now, becomes `level`. |

## Solution

Expand-contract: the new shape lands beside the old, the callers move in
batches that each stay green, the old shape goes last.

| Ticket | Scope | Blocked by |
|---|---|---|
| 01 | Prefactor: the scene reads view state through one seam | - |
| 02 | Expand: `useChart` and `value` beside the old shape | - |
| 03 | Migrate: the charts' tests | 02 |
| 04 | Migrate: examples Area to Chart | 02 |
| 05 | Migrate: examples ControlChart to Tooltip, scenarios | 02 |
| 06 | Migrate: core's demo, the charts' documents | 02 |
| 07 | Contract: remove the free parts and `accessor` | 03-06 |
| 08 | `useSchedule` | - |

## Testing

Type tests first (the compiler errors that must occur: an unknown field, a
field of the wrong row type in a series with its own `data`, a free `Line`
that no longer exists), as the table's typing is tested (ADR-0017). Then the
existing unit and interaction tests, migrated, unchanged in what they assert.
The screenshot suite must not change a pixel.

## Out of Scope

- The view, zoom and the legend's gestures: `.scratch/component-view/`.
- A field path (`"a.b"`): a function covers it.
