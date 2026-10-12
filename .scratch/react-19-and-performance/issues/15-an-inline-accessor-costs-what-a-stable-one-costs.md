# 15 - An inline accessor costs what a stable one costs

Status: done
Type: task
Size: M

Blocked by: 10
Spec: `.scratch/react-19-and-performance/spec.md`, "The table", fourth fix; user stories 26-29

## What to build

A caller writes `rowKey: (row) => row.id` and a column's `value` inline, as
every example does, and the table does not recompute its keys or filter and
sort again on every render.

An accessor is compared the way the charts compare theirs: by identity first,
by its source text otherwise, never for a native or bound function. This goes
for a column's `value`, `sortValue` and `groupValue`, for **Row key** and for
the **Pre-filter**. The charts' comparison is the rule; if the table can use
the same wording of it without a dependency between the packages (the table
does not depend on the charts), it does - otherwise it states the rule once,
in one place.

The one known limit is the charts' as well and is stated where a caller reads
about accessors: a closure that reads a changed outer variable reads as
unchanged; a new function text, or the variable carried in the row data, is
the way out.

## Acceptance

- [ ] A `value` and a `rowKey` that count their calls: a re-render with a new
      function of the same text does not raise the count; one with a function
      of another text does, and the cells show the new values.
- [ ] The same for `sortValue`, `groupValue` and `preFilter`.
- [ ] A bound or native function is compared by identity.
- [ ] The limit is stated on the site where accessors are described.
- [ ] The benchmark page's "re-render with inline accessors" figure, before
      and after, is in the capability record.
- [ ] `pnpm check table` and `pnpm check:site` pass.
