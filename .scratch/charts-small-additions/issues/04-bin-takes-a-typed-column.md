# 04 - `bin` takes a typed column

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/charts-small-additions/spec.md`

## What to build

A data scientist calls `bin(column)` on a `Float64Array` and the compiler accepts it. Today the values are
counted correctly, but the types refuse them (`data-science.md`, statistical views).

- **The type.** The values overload of `bin` takes `ArrayLike<number | null | undefined>`. The rows overload
  stays as it is.
- **The reading.** By index, so a typed array needs no iterator. Values that are not finite are still
  skipped.
- **Docs.** The doc comment names typed arrays. The capability record's `bin` row and the changelog under
  "Changed" (a widened type, no migration needed) are updated.

## Acceptance criteria

- [ ] `bin.test.ts` counts a `Float64Array` and a plain array of the same values to the same bins.
- [ ] A type test accepts a `Float64Array` and an `Int32Array`, and still refuses an array of strings.
- [ ] `pnpm check charts` and `pnpm check:site` pass, and charts' `API.md` is regenerated.
