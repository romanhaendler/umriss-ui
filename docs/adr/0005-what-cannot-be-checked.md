# A node that cannot be checked is simply not checked

Status: accepted
Date:   2026-08

ADR-0003 excluded both **disabled** nodes and lazily-loaded children, and gave
one reason for both: a cascading check must reach every descendant, so a branch
containing something unreachable could never reach the fully-checked state, and
that would need a third check state nobody can render. We now think the premise
was wrong, and this ADR replaces that part of ADR-0003.

The third state never arises, because two rules are enough:

1. **The cascade leaves unreachable nodes alone.** Checking a branch checks every
   descendant it may check and skips the rest.
2. **The "are all children checked" test takes every child as it is.** A disabled
   child that is checked counts as checked; one that is not counts as not.
   Nothing is excluded from the count.

Under those two rules a branch containing an unchecked disabled child is simply
**not checked** — which is true, renderable, and actionable. What ADR-0003 feared
was an artefact of a third rule we never needed: excluding disabled children from
the count. That would have reported a parent as full while a child was
outstanding, and *that* is the state no checkbox can honestly show.

## Consequences

**Unloaded branches need no separate machinery.** A branch whose children are not
present is, for the purpose of checking, exactly a disabled node: nothing that
must reach its descendants may act on it. So lazy loading needs no
non-cascading check mode, and ADR-0003's conclusion that the two were mutually
exclusive falls away with its premise.

**The component does not load anything.** It gains one thing it lacked: a way for
the caller to say "this is a branch whose children are not here yet", and an
event when such a branch is opened. The caller fetches and extends its own data;
the tree is driven by nested data and re-renders. Concurrency, failure and
cancellation stay outside a module that is otherwise pure and testable.

**A search cannot look inside an unloaded branch, and says so.** Such a branch
survives every filter rather than being quietly dropped. A filtered tree
therefore shows something that did not match — deliberately. The alternative is
a result count that is confidently wrong, which is the worse of the two.

**A disabled node is still navigable.** Arrow keys reach it, it can be activated,
it carries focus. Only its checkbox is inert. ADR-0003's reasoning never touched
navigation, and a node one may look at but not tick is the common case.
