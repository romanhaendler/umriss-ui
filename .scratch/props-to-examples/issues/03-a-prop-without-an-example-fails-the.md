# 03: A prop without an example fails the build

Status: ready-for-agent
Blocked by: 01 (Every row names the examples that show it)
Spec: `.scratch/props-to-examples/spec.md`

**What to build:** After the scan, every documented row of a package must have a use in that package's examples or scenarios. Each package carries a checked-in exception list beside its outline, mapping `Type.prop` to a reason; it starts with every row shown nowhere today (about 67), each with the reason "not shown yet". The generator fails, in the same run as the JSDoc gate (so `pretypecheck` and CI carry it), listing all offenders at once, on three conditions: an unshown row not on the list, a listed row that is now shown ("stale — remove it"), and a listed row that does not exist.

- [ ] Fixture tests make the generator fail on each of the three conditions, and list every offender in one run with its type
- [ ] The five packages pass with their exception lists; the lists together hold exactly the rows shown nowhere today
- [ ] Adding an example that uses a listed prop fails the build as stale until the entry is removed
- [ ] `pnpm typecheck` runs the gate; no new CI job
