# The table is a package, and it depends on `@umriss-ui/core`

Status: accepted
Date:   2026-09

The table leaves `@umriss-ui/core` and becomes `@umriss-ui/table`, with `@umriss-ui/core` as a
peer dependency. `@umriss-ui/core` keeps no table at all — not `Table`, `Th` and `Td`
as primitives, not `AlarmList`, not the selection hook. This is the first
dependency between packages in the workspace; until now the two packages
imported nothing from each other, and ADR-0006 went as far as writing the limit
model twice to keep it that way.

The table is split out because it is to become a product of its own: its own
demo, its own sequence of specs (grouping, live data, grid navigation, inline
editing), and an interface rethought from the ground up (ADR-0017). The criterion
put forward when the question came up — split when someone wants `@umriss-ui/core`
without the table, or when the table brings a dependency `@umriss-ui/core` should not
carry — was not met. The decision rests on the table's weight and independence as
a product, and a future reader should not look for a consumer who asked for it.

## Considered Options

**Duplicate what the table needs, as ADR-0006 did.** That reasoning was explicitly
limited to a pure function of one value — no state, no clock, no text. The table
needs `Popover`, `Menu`, `Select` and `Checkbox`: stateful components with focus
management and portal rules. Two copies of those would drift in behaviour, which
no conformance table can catch.

**A third, shared base package** below both. It would rebuild the library's
structure to enable one package.

**Keep the primitives `Table`, `Th` and `Td` in `@umriss-ui/core`.** Rejected so that
there is one place a table comes from. `AlarmList` moves with the rest and is
re-expressed in the new API.

## Consequences

`@umriss-ui/table` imports only `@umriss-ui/core`'s public entry, and lint enforces it:
`@umriss-ui/core` and `@umriss-ui/charts` may not import `@umriss-ui/table`, and
`@umriss-ui/table` may not reach into `@umriss-ui/core` by a deep or relative path.
Whatever the table used internally — the window arithmetic `TreeView` shares, for
one — becomes public in `@umriss-ui/core`.

A release of `@umriss-ui/table` states the range of `@umriss-ui/core` it works with, and a
breaking change in a component the table uses is a breaking change for two
packages.

One `UmrissProvider` configures both: theme, density, formats and wording are
set once.
