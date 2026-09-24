# 09 — Documents and the release

Status: ready-for-agent
Type: task

Blocked by: 07, 08
Spec: `.scratch/table-grouping/spec.md`

## Scope

- `packages/table/README.md`: grouping and aggregates in the overview.
- `CHANGELOG.md`: the minor version — grouping, `aggregate`, the deprecated
  `footer`, the new menu entry every table gains.
- `docs/journal.md` entry; the spec's delivery report under `## Comments` and
  its status to `done`.

## Acceptance

- `pnpm lint`, `pnpm typecheck`, `pnpm test:unit`, `pnpm test:visual` green.
