# 05: The gate stops at an export without JSDoc

Status: ready-for-agent
Blocked by: 03 (Every export of core carries JSDoc), 04 (Every export of charts, table, schedule and calculation carries JSDoc)
Spec: `.scratch/api-index/spec.md`

**What to build:** The generator that stops at a prop without a comment also stops at an export of the entry or a subpath without one, listing every offender with file and line in one run, so CI fails on it.

- [ ] Gate test: a fixture export without JSDoc stops the generator and is listed with file and line; the corrected fixture passes.
- [ ] The workspace passes the gate.
- [ ] CI fails when a new export without a comment is added (shown by the gate test, not by a red build).
