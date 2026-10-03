# 06: Every type a table names can be imported

Status: ready-for-agent
Blocked by: None (can start immediately)
Spec: `.scratch/types-without-holes/spec.md`

**What to build:** The thirteen types that a props table names and the package does not export are exported: from the table `Present`, `Absent`, `Pin`, `ToolbarSize`, `FormatFor`, `FilterFor`, `GroupFor`, `FooterFor`, `AggregateFor`, `Presentation`; from core `TextTracking`, `TextLeading`, `Align` — plus any further one the reader reports when checking references against the entry. Each package's changelog lists them as new public types.

- [ ] The thirteen types are importable from their package's entry.
- [ ] The table's and core's changelogs list the additions.
- [ ] The llms completeness guard stays green (the new exports appear in the text).
- [ ] Typecheck and unit tests stay green in all packages.
