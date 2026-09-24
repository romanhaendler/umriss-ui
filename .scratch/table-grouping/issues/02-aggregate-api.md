# 02 — `aggregate` on a column, and `footer` as its old name

Status: ready-for-agent
Type: task

Blocked by: 01
Spec: `.scratch/table-grouping/spec.md` (Q4, "How it looks" 5–6)

## Scope

- `aggregate` on field and computed columns and on the verdict column: the
  built-ins typed by value type, or a function whose result runs through the
  column's presentation. `share={false}`.
- The footer reads the aggregate over the filtered set; `footer` is a deprecated
  alias with a development warning naming `aggregate`, removed with the next
  minor version.
- The Σ/⌀ sign in the footer for the built-ins that have one; none for `count`,
  `distinct`, `range` and own functions beyond their wording.
- Overloads extended in the Ticket-01 manner (required props decide the
  overload; the field column stays last).

## Acceptance

- `types.test-d.tsx`: `"sum"` on text fails, `"range"` on numbers fails, an own
  aggregate returning the wrong type for `children` fails; `footer` still
  compiles and is marked deprecated.
- Existing footer tests pass unchanged through the alias.
