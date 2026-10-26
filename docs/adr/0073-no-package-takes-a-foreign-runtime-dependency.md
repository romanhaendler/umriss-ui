# No package takes a foreign runtime dependency

Status: accepted
Date:   2026-10

No umriss package has a runtime dependency. `@umriss-ui/table` depends on
`@umriss-ui/core` and the schedule on core and charts (ADR-0016, ADR-0022); beyond
those and React as a peer, nothing is installed with a package. This decision
says that it stays so, and that the XLSX export does not start the exception.

**Why XLSX does not.** A writer for one sheet of typed cells is a few hundred
lines: a stored ZIP, six small XML parts, a serial number for a date. A
spreadsheet library is a supply chain in every application's bundle - its own
dependencies, its release rhythm, its advisories - and most of it reads, styles,
formulates and compresses what an export never does. An application that
installs umriss installs umriss, and what it audits is what it imports.

**The cost is carried here.** The format is written by hand, tested without Excel
(the tests unzip the result and read it back), and limited on purpose: one sheet,
no styling, no formulas, no compression. A feature that needs more is the
application's to add with a library of its own, behind the same `ExportFormat`
(`{ extension, mime, write }`), which the table's `Export` takes as a value.

## Considered Options

- **A spreadsheet library as a dependency, or as an optional peer.** Rejected: an
  optional peer is still a version the application must choose and the library
  must keep working against.
- **No XLSX at all.** Rejected: a CSV is text, and text makes a spreadsheet guess
  at leading zeros, dates and `=`.

## Consequences

- A package adding a `dependencies` entry needs a new ADR that supersedes this one.
- The XLSX writer lives behind its own entry point, `@umriss-ui/table/xlsx`, so
  that an application which never imports it never pays for it.
