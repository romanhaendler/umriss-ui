# 03: Every export of core carries JSDoc

Status: ready-for-agent
Blocked by: None (can start immediately)
Spec: `.scratch/api-index/spec.md`

**What to build:** Every export of core's entry and subpaths that lacks a comment gets one: what it is for, and for a hook or function `@param`/`@returns` lines where the type does not explain itself.

- [ ] A one-off run of the export check (the one ticket 05 turns into a gate) lists no core export without JSDoc.
- [ ] Comments are in English and name no internal requirement numbers or source paths.
- [ ] Typecheck, lint and unit tests stay green.
