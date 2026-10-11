# 02 — Documents and release

Status: ready-for-agent
Type: task
Size: S

Blocked by: 01
Spec: user story 10

## What to build

The capability record (`packages/charts/docs/capabilities.md`), table
`DataTable`: the row "A stacked series lists its own value, not its top; no
total column" says that a stack's total follows its last member, in the
tooltip's format, and what proves it. The section "Later" no longer lists it.
The stacked data-table example, if one shows "Show data" over a stack, is
looked at; its screenshot may move by a column. The changelog gets an entry
under "Added" in the next charts release - which ships with the other charts
work of that release, and is not a release of its own. A baseline of the open
table over a stack is looked at before it is accepted.

## Acceptance

- [ ] The capability row and "Later" are changed.
- [ ] Changelog entry; no "Changed" entry is needed (no key, no existing cell
      moves; a new column appears).
- [ ] Any baseline of an open table over a stack is looked at and updated.
- [ ] The spec's status set to `done` with the delivery report under
      `## Comments` once the release carries it; both tickets `done`.
