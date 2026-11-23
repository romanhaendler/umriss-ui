# 05: An ADR's status stands once

**What to build:** the `Status:` line of an ADR's file is the fact; the status column of the index
`docs/adr/README.md` equals it word for word, and a repo test in the demo package (beside the existing
`*.repo.test.ts`) fails when they differ or when a file has no row. The sixteen that differ (0010, 0018,
0021, 0035, 0037, 0042, 0046, 0050, 0058, 0060, 0064, 0066, 0070, 0072, 0078, 0082) are set right, taking
the fuller of the two statements and checking it against the ADR that amends or supersedes. The index's
"Eighty-one decisions" loses its number. Findings:
`.scratch/release-1-0/research/10-the-documents-agree-with-the-source.md` B7-B8.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Size:** S (Haiku)

- [ ] The repo test compares every ADR file with its row and is green
- [ ] It fails when one status is changed in one place (tried by hand, then reverted)
- [ ] No ADR's decision text changes, only `Status:` lines and the index
- [ ] `pnpm check demo` is green
