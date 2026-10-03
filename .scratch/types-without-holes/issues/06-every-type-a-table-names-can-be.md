# 06: Every type a table names can be imported

Status: done
Blocked by: None (can start immediately)
Spec: `.scratch/types-without-holes/spec.md`

**What to build:** The thirteen types that a props table names and the package does not export are exported: from the table `Present`, `Absent`, `Pin`, `ToolbarSize`, `FormatFor`, `FilterFor`, `GroupFor`, `FooterFor`, `AggregateFor`, `Presentation`; from core `TextTracking`, `TextLeading`, `Align` — plus any further one the reader reports when checking references against the entry. Each package's changelog lists them as new public types.

- [x] The thirteen types are importable from their package's entry.
- [x] The table's and core's changelogs list the additions.
- [x] The llms completeness guard stays green (the new exports appear in the text).
- [x] Typecheck and unit tests stay green in all packages.

## Comments

**Delivered.** The thirteen types are exported at the end of each entry:
`Absent`, `AggregateFor`, `FilterFor`, `FooterFor`, `FormatFor`, `GroupFor`,
`Present`, `Presentation`, `Pin`, `ToolbarSize` from `@umriss-ui/table`;
`TextTracking`, `TextLeading`, `Align` from `@umriss-ui/core`. Eight of them
had no JSDoc and got one, so the export gate stays green. Both changelogs list
them under Unreleased / Added.

**No further ones.** The reader's reference list (ticket 05) is not merged yet,
so the check was done by hand: every capitalised name in every type cell of the
five packages' generated `props.json`, against the declarations in the
workspace's sources and the owning package's entry exports. After this change
no name a table shows is declared in the workspace and missing from its
package's entry.

**Tests.** `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` green (the llms
completeness guard in `packages/demo/tests-unit/llmsGuard.test.ts` included).
No Playwright run: nothing a demo page draws changes. No baselines moved.
`props-table-hygiene` adds the gate that keeps it so.
