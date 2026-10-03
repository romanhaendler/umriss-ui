# 02: Rows that are true: no `never`, no free type parameters, constraints in the header

Status: ready-for-agent
Blocked by: 01 (One table model, two writers)
Spec: `.scratch/types-without-holes/spec.md`

**What to build:** On the table's Column page, `aggregate` reads `AggregateFor<…>` and `footer` reads its real type. A member typed `never` in an arm of a union contributes no type to the merged row; its description is kept after the real arms' descriptions. A member that is `never` in every arm is absent. Members taken from helper, inherited or union-arm types have the helper's parameters replaced by the arguments at the use. Table headers (and later definitions) show each parameter with its constraint and default: `FieldColumn<Z, K extends Field<Z>>`, `RadioGroupProps<T extends string>`. A member naming a type parameter the header does not introduce stops the generator with an error.

- [ ] Reader fixtures: an arm with `member?: never` merges to the real type with both descriptions; a member `never` in all arms is absent; an inherited member's parameter is substituted; a constraint and a default appear in the parameter list; a free type parameter is reported.
- [ ] No row in any generated props data has a type equal to `never` or starting with `never |`.
- [ ] No member of any table names a type parameter its header does not introduce.
- [ ] The Column page shows `FieldColumn<Z, K extends Field<Z>>` and `aggregate` with a real type.
- [ ] The built-site guard fails on a merged `never` row.
