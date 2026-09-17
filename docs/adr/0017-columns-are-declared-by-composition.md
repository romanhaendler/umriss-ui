# Columns are declared by composition and bound through the hook

Status: accepted
Date:   2026-09

`table-model` decided that columns are data for the pipeline while rendering stays
with the caller: a column descriptor said how to read and compare a value, and the
caller wrote header, cells and footer by hand. The reason was sound — a
columns-as-data rendering interface fights custom cells, and every cell in that
table was custom. The cost appeared later. Each column was described up to four
times, every model state about columns had to be re-applied by hand at each place,
and where it was not, the model and the screen disagreed: reordering changed the
model, the menu and the export, and moved nothing on screen.

`@umriss-ui/table` reverses that decision. **A column is a JSX element carrying its
value and its presentation, and the table renders the rows.** The objection of
`table-model` no longer applies, because `children` keeps the presentation open:
a cell can still be any JSX.

**The row type is bound by the hook.** `useTabelle(zeilen, …)` infers it from the
rows and returns `Table`, `Column` and the other building blocks that need it.
There is no freely exported `Column`. TypeScript does not check a JSX child
against its parent, so a column can only be typed against its rows if both come
from the same source; a free `Column` would be the unchecked and therefore the
most-used route. Building blocks that do not touch the row are ordinary imports.

**Every column has exactly one value**, given as a field name or a function.
Sorting, search, export and footers read the value; `children` only presents it.

## Considered Options

- **JSX columns read through the children's props** (PrimeReact, KendoReact,
  Blueprint). Wrappers around a column break, silently or by validation, and the
  row type is lost.
- **A free generic `Column` inside a generic `Table`.** Verified with the compiler:
  the accessor's parameter is `unknown`, and a column typed for the wrong rows
  inside the table goes unreported.
- **A factory per row type** (`tabelleFuer<Auftrag>()`). Types correctly and gives
  one central place per row type, but binds shared columns to a row type rather
  than to a property, and leaves the state to a second construct.
- **A render-prop child** handing out bound components. Types correctly, but turns
  the declaration into a function and loses the shape that made JSX worth having.
- **An array with render functions** (TanStack Table, AG Grid, MUI X). Types
  correctly and is the market's default; it reads as configuration rather than as
  the table it produces, which is the complaint that started this.

## Consequences

The typing is part of the product and is tested by the compiler, including the
errors it must produce. Rendering now belongs to the library and gets component
tests, which `table-model` ruled out when rendering belonged to the caller.
Registration raises questions the old design never had — building-block identity
across renders, columns in the first frame, render passes with wrapped columns —
and the spec settles them by prototype before building on them.
