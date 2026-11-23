# 03: `@experimental` stands apart, a deprecated member last

**What to build:** the generator reads `@experimental` as it reads `@deprecated`. A marked export leaves its
group and stands under `## Experimental`; a marked member stays in its table with `(experimental)` and is
named under that heading as `Type.member`. Within a table, deprecated members follow the others. The header
line of `API.md` says what the file lists and what the heading means (ADR-0083, "`@experimental`" and "A
rename"). No library source is marked in this release. See the spec's "`@experimental`" and "Deprecated
last".

**Blocked by:** 02

**Status:** ready-for-agent

**Size:** S (same agent as 01, continued)

- [ ] Fixture: a marked export, a marked prop, a deprecated prop between two others
- [ ] With nothing marked, no `## Experimental` heading is written
- [ ] The seven `API.md` are regenerated; `pnpm check demo` and `pnpm check:site` are green
