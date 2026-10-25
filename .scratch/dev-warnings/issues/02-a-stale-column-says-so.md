# 02 - A stale column says so, and a `key` is the way out

Status: ready-for-agent
Type: task
Size: M

Blocked by: `.scratch/table-columns-from-the-data/issues/01-a-column-keeps-its-accessor-only-while-it-keeps-its-id.md`
Spec: `.scratch/dev-warnings/spec.md`

## What to build

The tracer bullet for the stale accessor. A column `value={(o) => o.net * rate}` keeps its old figures after
`rate` doubles, as it does today. In development the table now logs one warning. The warning names the
column, says that its function reads a value from outside the row that has changed, and gives the two ways
out. With `key={rate}` on the column, the figures follow the rate.

- **The probe.** The registry holds a column's `value`, `sortValue` and `groupValue` while the next one has
  the same text. The hook holds `rowKey` the same way. At those holds, and only in DEV, when the new
  function differs from the held one in identity but not in text:
  - call both on at most the first 1,000 of the table's rows;
  - compare the results: primitives by `Object.is`, Dates by time; any other result is not compared;
  - on the first difference, warn once per column id (or once for `rowKey`).

  The held function stays. Nothing else changes, in DEV or in production.
- **The warning's ways out:** carry the value in the rows, or give the column a `key` that changes with the
  value.
- **The `key`.** A test shows that a new `key` on a column shows the new values, and keeps the column's
  sort and width.
- **The documents.** The column page's sentence on inline accessors (in the table's demo outline, and so in
  `llms-full.md`) replaces "give the function a new text" with the two ways out, and says that development
  warns. The capabilities record says the same in one sentence.

## Acceptance criteria

- [ ] A column whose `value` closes over a changed rate warns once in DEV, naming the column's id; a further
      re-render does not warn again.
- [ ] The same for `sortValue`, `groupValue` and `rowKey`, each in its own test.
- [ ] An inline accessor re-rendered with an unchanged closure, a field name, and a native function such as
      `Number` stay silent.
- [ ] With the rate in a changing `key`, the cells show the new figures, and the sort and the width of the
      column hold.
- [ ] The probe calls an accessor at most 1,000 times per side per render, held by a test over a larger
      table with a counting accessor.
- [ ] The documentation sentences name the two ways out and no longer advise a new function text.
- [ ] `pnpm check table` and `pnpm check:site` pass.
- [ ] The changelog notes the warning under "Added".
