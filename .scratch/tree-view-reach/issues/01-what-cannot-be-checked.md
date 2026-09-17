# 01 — What cannot be checked

Status: done

Spec: `.scratch/tree-view-reach/spec.md`

## Scope

The model change that removes ADR-0003's exclusion. Read ADR-0005 first — the
whole ticket is two rules, and the value is in understanding why the old third
rule was the problem.

- **The reader gains two optional predicates.** One says whether a node may be
  checked. One says whether a branch may have children that are not present.
  Both optional: a caller who needs neither writes exactly what they write today.
- **The cascade skips what it may not check.** Checking a branch checks every
  descendant it may check and leaves the rest alone — including their existing
  state.
- **The count test takes every child as it is.** A disabled child that is checked
  counts as checked; one that is not counts as not. **Nothing is excluded from the
  count.** This is the rule the old design got wrong, and getting it wrong is what
  invented the third check state.
- **An unloaded branch is uncheckable by the same mechanism.** One rule, two
  reasons. The model does not distinguish them where it does not have to.
- **An unloaded branch survives every filter**, because a search cannot look
  inside it. Its entry says so.
- **The flattening carries each node's label** and two new flags: may-not-be-
  checked, and may-have-unloaded-children.

## Acceptance

Unit tests against the pure model, extending the existing fixture with a disabled
node and an unloaded branch rather than building a second one.

- **The two rules, directly.** Checking a branch containing a disabled child
  checks everything else and leaves the disabled child exactly as it was —
  checked or unchecked. Checking a branch containing an unloaded branch does the
  same.
- **The count test with a disabled child**, both ways round: a parent whose only
  outstanding child is a disabled unchecked one is **not** checked; a parent whose
  disabled child arrived already checked, and whose other children are checked,
  **is** checked. This pair is the heart of ADR-0005 — write it first.
- **A restored state is not rewritten.** A disabled node that arrives checked
  stays checked through an unrelated toggle elsewhere.
- **A parent with an unloaded child can never be fully checked**, which is
  correct rather than a defect: nobody has seen its descendants.
- **Indeterminate still derives.** A branch whose only checked descendant is a
  disabled one is indeterminate.
- **Unloaded branches survive a filter** that matches nothing under them, and
  their entry is marked as unloaded. A disabled node is filtered like any other —
  being disabled says nothing about matching.
- **Every existing test passes unchanged.** Both predicates are optional; if an
  existing test needs editing, the addition was not optional.

## Notes

Write the count-test pair before anything else. It is two assertions and it is
the entire argument of ADR-0005: excluding disabled children from the count is
what would report a parent as full while a child was outstanding, and *that* is
the state no checkbox can honestly show. The exclusion in ADR-0003 was defending
against a problem its own extra rule created.

Resist making disabled inherit down a subtree. A caller whose rule is "everything
under this is locked" writes that in the predicate, where the rule actually lives
and where it can be read.

Resist distinguishing disabled from unloaded anywhere the behaviour is the same.
They differ in what the interface says about them, not in what the cascade does.
