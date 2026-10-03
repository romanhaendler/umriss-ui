# 03: Every export of core carries JSDoc

Status: done
Blocked by: None (can start immediately)
Spec: `.scratch/api-index/spec.md`

**What to build:** Every export of core's entry and subpaths that lacks a comment gets one: what it is for, and for a hook or function `@param`/`@returns` lines where the type does not explain itself.

- [x] A one-off run of the export check (the one ticket 05 turns into a gate) lists no core export without JSDoc.
- [x] Comments are in English and name no internal requirement numbers or source paths.
- [x] Typecheck, lint and unit tests stay green.

## Comments

**Delivered.** 150 of core's 252 exports had no JSDoc (all of them from the
entry; the `wording/de` subpath already had its comments). Each now has one,
directly above its declaration and in the voice of the comments around it:
components say what they are for and how they are driven, props interfaces
name their component (and what they change of the native attributes), unions
say what their values mean, `useTree` has `@param` and `@returns`, and the four
tree transitions say what they return when nothing changes. The existing
`/* */` maintainer notes stay where they were, above the new comment. The diff
is comment lines only (265 added, 0 removed), plus the CHANGELOG entry under
"Unreleased".

**The check.** A one-off script on the TypeScript compiler over `src/index.ts`
and `src/lib/language/de.ts`. It takes every symbol from `getExportsOfModule`,
resolves aliases, and counts a symbol as documented when one of its
declarations has a `/** */` comment (`ts.getJSDocCommentsAndTags`). Before:
150 of 252 without one. After: 0 of 252. Ticket 05 builds the same check into
the generator.

**Green:** `pnpm lint`, `pnpm typecheck` (props gate included) and
`pnpm test:unit` (all six packages). Playwright was not run: no page, table
or screenshot reads an export's own comment, and the llms appendix is text
that is not checked in. `propsStandard.test.ts` timed out once, at 5.5 s,
while parallel worktrees held the load average at 26. It passed on every
re-run.

**Baselines moved:** none. **Deviations:** none.
