# The accessibility tree is flat, not nested

Status: accepted
Date:   2026-08

The obvious way to build a tree is nested lists: a `group` inside a `treeitem`
inside a `group`. We render a flat sequence of `treeitem`s instead, each
declaring its own level, its position among its siblings and how many siblings
it has. The accessibility layer reconstructs the hierarchy from those three
numbers, which is a shape assistive technology supports directly.

We do this because nesting and virtualisation are incompatible. Only the visible
slice of a large tree is in the document, so an ancestor's markup would have to
exist to hold a descendant that is on screen while the ancestor is not — and the
sibling counts would be counts of what happens to be rendered rather than of what
exists.

## Consequences

The **flattening** is the component's real data structure: everything downstream
— keyboard movement, virtualisation, rendering, indentation — reads that list and
nothing walks the tree. Indentation is a visual property of a level, not a
consequence of nesting, so it comes from a computed offset rather than from the
document structure.

The sibling counts must be computed against the whole tree rather than the
rendered window, and they must stay correct while a filter is narrowing what is
visible. That is a real obligation this decision creates, and it is the thing
most likely to be got quietly wrong.

Reversing this would mean giving up virtualisation, which is the reason the tree
can hold a large structure at all.
