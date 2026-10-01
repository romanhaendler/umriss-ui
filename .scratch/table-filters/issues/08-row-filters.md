# 08 — Row filters

Status: ready-for-agent
Type: feature

Spec: `.scratch/table-filters/spec.md` — takes up the out-of-scope item
"table-wide quick filters over the whole row". Agreed with the user on
1 Oct 2026, in the session that fixed the pre-filter loop (4862392).

## Why

A filter the user may lift had to be a column's condition. A toolbar control
that restricts by a field the table does not show, or by a question over the
whole row ("overdue" = past its window and not delivered), had two ways out,
both wrong: `preFilter` (invisible, never reset, no count) or a column kept
hidden through `initialView` only to carry a condition.

## Decided

- `rowFilter({ id, label, matches, describe? })` defines a **row filter** once,
  outside the component, like `columnFilter`. `matches(row, condition)` is any
  question over the whole row; the condition is any value the application
  chooses. The object is the key everywhere after its definition - no id
  string at a call site.
- `useTable(rows, { rowFilters: [a, b] })` names the row filters a table has.
  The list exists so that a condition from `initialView` - which arrives by
  id - is known in the first render.
- `t.setFilter(f, condition | null)` sets or lifts it, typed by `matches`'
  second parameter; `t.conditionOf(f)` reads it back as that type, `null`
  when lifted. The control is the application's own.
- A row filter's condition is a **Condition** like a column's: it counts in
  the ratio, "Reset" lifts it, a change goes back to page one, it stands in
  `t.view.conditions` under its id, and manual mode reports it to the server.
  Row filters and column filters combine with AND.
- With `describe`, the condition stands as a chip "label: describe(condition)"
  with a cross; the chip opens nothing, since the control is not the table's.
  Without it there is no chip - the control shows the state, as the search
  field does.
- Everything that varies goes into the condition, never into a closure over
  component state: the table cannot see that change.

## Acceptance

- Unit tests: filters by the whole row; ratio, "Reset", page one; chip with
  `describe`, none without; `conditionOf` reads back; `initialView` restores;
  AND with a column condition; a row filter not in `rowFilters` warns and is
  passed over; manual mode reports and does not filter itself.
- Type tests: condition typed by `matches`; a wrong one is an error.
- `CONTEXT.md` gains **Row filter**; **Condition** names both kinds.
- Demo `Filter`: 06 a multiselect over a field without a column, 07 rows
  from a request, 08 the complex case "overdue" with a chip. New baselines for
  these three examples may be written; no existing baseline moves.
