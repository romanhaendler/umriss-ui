# 02 - The number format is resolved in core

Status: ready-for-agent
Type: task
Size: S

Blocked by: `01-the-adr.md`
Spec: `.scratch/number-formats/spec.md`

## What to build

The prefactor. Nothing a user sees changes. The table maps a number format onto core's formats in two
places: its value text, and the verdict column's own copy with a local copy of the type. That mapping moves
into core, once, so that the next ticket widens it in one place.

- Core exports the type `NumberFormat`: `"percent"`, `"count"` or `{ decimals: number }`. This ticket keeps
  today's shape, and the next widens it.
- Core exports the pure function `writeNumber(formats, n, format?)`:
  - `"percent"` goes to `percent`;
  - `"count"` goes to `count`;
  - `{ decimals }` goes to `number` with those places;
  - no format goes to `number` without places.
- The table's exported `NumberFormat` is core's, re-exported under the same name.
- The table's value text and `VerdictColumn` call `writeNumber`. `VerdictColumn`'s local type goes.

## Acceptance criteria

- [ ] A unit test in core pins `writeNumber` for each case. It includes that `{ decimals }` and no format go
      through an application's replaced `number`, and that the two names go through a replaced `percent` and
      `count`.
- [ ] The table's existing tests pass unchanged.
- [ ] The table holds no mapping of a number format of its own.
- [ ] `pnpm check core`, `pnpm check table` and `pnpm check:site` pass. Both `API.md` files are regenerated,
      and core's lists `writeNumber` and `NumberFormat`.
