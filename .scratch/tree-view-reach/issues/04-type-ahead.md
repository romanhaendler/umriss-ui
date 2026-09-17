# 04 — Type-ahead

Status: done

Spec: `.scratch/tree-view-reach/spec.md`
Blocked by: 02

## Scope

The first half of the keyboard package. The authoring practices list type-ahead
as a regular interaction for every tree, not an optional one; the first version
excluded it on the grounds that the tree has a search, which is true and beside
the point. **One gesture moves the focus; the other moves the ground.**

- Typing a printable character moves the keyboard to the next node whose label
  starts with it, among the nodes that are showing, wrapping around from the
  active node.
- Characters arriving in quick succession accumulate and narrow the jump; a pause
  clears the buffer.
- Matching is case-insensitive on the start of the label.
- **It changes nothing else**: not the expansion, not the checked set, not the
  search, not what is filtered.
- Disabled nodes take part — they are navigable. Unloaded branches take part as
  themselves.
- The matcher is a pure function over the flattening. Only the buffer and its
  timer live in the component.

## Acceptance

- Unit tests for the matcher: a single character lands on the next match after
  the active node; it wraps around to the beginning; several characters narrow
  it; no match leaves the active node where it was; matching ignores case.
- A unit test that a jump changes only the active node — the expansion, the
  checked set and the search come back identical.
- A unit test that a disabled node is a legitimate target and an unloaded branch
  is too.
- In a browser: typing lands on the expected node, and typing two characters
  quickly lands somewhere a single character would not. The timing is the part
  that cannot be proven in a fake DOM, and it is the part most likely to be
  wrong.
- No existing screenshot baseline moves.

## Notes

Keep the buffer as small as it can be: a string and a timer. Everything with a
decision in it belongs in the matcher, where it can be asserted without waiting
for anything.

The wrap-around is the case that is quietly wrong most often. Starting from the
last node and typing a letter that only matches the first must work.

Be careful not to swallow keys the tree already uses. The space bar checks, and a
node whose label begins with a space does not exist.
