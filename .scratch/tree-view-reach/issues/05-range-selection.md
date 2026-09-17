# 05 — Range selection

Status: done

Spec: `.scratch/tree-view-reach/spec.md`
Blocked by: 02

## Scope

The second half of the keyboard package: checking a run of nodes without a key
press per node. Twelve siblings is currently twelve clicks.

- **The recommended model from the authoring practices**, not the alternative.
  The alternative reassigns the space bar, which this tree has already given to
  checking, so it is not a real option.
  - shift with an arrow: move and toggle;
  - shift with the space bar: check everything between the anchor and here;
  - control with A: check everything checkable, or clear it when everything
    checkable is already checked.
- **The anchor is part of the state**, so a range is reproducible and can be
  controlled from outside like every other value. It is neither the active node
  nor part of the checked set.
- **Range gestures step over what cannot be checked** — disabled nodes and
  unloaded branches — rather than stopping at them.
- The range calculation is a pure function over the flattening.

## Acceptance

- Unit tests for the range calculation: a run downwards, a run upwards, a run of
  one, and a run containing a disabled node and an unloaded branch, both of which
  are absent from the result.
- Unit tests for the anchor: it is set by a single check, it moves with each
  single check, and a range gesture extends from it rather than from the active
  node.
- Unit tests for control with A in both directions, including that "everything
  checkable" genuinely excludes what may not be checked — so a tree containing a
  disabled node still reports itself as fully checked when everything else is.
- A unit test that a range gesture cascades: checking a range that includes a
  branch checks that branch's descendants, and reconciles its ancestors, exactly
  as a single check would.
- In a browser: shift with an arrow checks as it moves; shift with the space bar
  covers the run; control with A fills and clears. **Count the toggles** — a range
  of five must report five nodes newly checked, not ten.
- No existing screenshot baseline moves.

## Notes

The interaction between a range and the cascade is the part with real depth: a
range that includes a branch is a set of cascading checks, and the ancestors have
to end up right afterwards. Decide whether the range applies as one operation or
as a sequence of single toggles, and write the decision down — they differ when
the range contains both a parent and one of its children.

"Everything checkable" is the phrase to hold on to for control with A. A tree
containing a node nobody may tick is fully checked when everything tickable is
ticked; any other reading makes the gesture useless in exactly the trees that
need it.

Count the toggles in the browser test. A range gesture that fires twice per node
produces the right set from the wrong number of operations, and that is precisely
the bug this component has already shipped once.
