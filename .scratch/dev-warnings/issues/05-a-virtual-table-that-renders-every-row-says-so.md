# 05 - A virtual table that renders every row says so

Status: ready-for-agent
Type: task
Size: S

Blocked by: `.scratch/views-in-their-frame/issues/01-a-table-stays-within-its-frame.md`
Spec: `.scratch/dev-warnings/spec.md`

## What to build

An application puts a `virtual` table of 20,000 rows in a flexible layout with no definite height and no
`maxHeight`. The scroll area grows with its rows, and the window holds every row. In development the table
now logs once that `virtual` needs a bounded scroll area, through `maxHeight` or a parent of definite height.
A parent of definite height already bounds the table (views-in-their-frame 01), so that case stays silent.

- **The check** sits beside the table's other measuring DEV checks, after layout. It warns once when all of
  these hold:
  - `virtual` is set;
  - the rendered window holds every row;
  - the scroll area is taller than the viewport.
- A short virtual table that fits the viewport does not warn.

## Acceptance criteria

- [ ] With the scroll area's height stubbed above the viewport and every row rendered, DEV warns once and
      names `maxHeight`. The stubbing follows `rowPitch.test.tsx`.
- [ ] A bounded virtual table (a window smaller than the rows) does not warn.
- [ ] A virtual table whose rows all fit the viewport does not warn.
- [ ] `pnpm check table` passes.
- [ ] The changelog notes the warning under "Added".
