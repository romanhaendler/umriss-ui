# Spec: Reaching a node, and what cannot be reached

Status: done

Origin: `/grill-with-docs` session, 25 Aug 2026, after the tree shipped. The
proposal was checked against two references: the WAI-ARIA authoring practices
for the tree pattern, and what the table in this repo already offers.

Decisions recorded as ADRs: `docs/adr/0005-what-cannot-be-checked.md`, which
replaces part of `docs/adr/0003-an-active-node-is-not-a-selection.md`.
Vocabulary in `CONTEXT.md`.

Sequencing: builds on `tree-view`. Issue 01 must land before everything else;
03, 04 and 05 are independent of one another once 02 is in.

Deliberately excluded from this package, on the author's instruction: sharing a
tree's state as a link. The table's equivalent exists; the tree does not need it.

---

## Problem Statement

The tree works, and every remaining complaint is a variation on one theme: there
are nodes the user cannot get to, or cannot act on, and the component's answer in
each case is to pretend they do not exist.

**A node that may not be checked has nowhere to be.** The first version excluded
disabled nodes on the grounds that a branch containing one could never be fully
checked. That is true and it is not a problem — it was made into one by a third
rule nobody asked for. An application with per-node permissions currently has to
either lie about what the user may tick, or leave those nodes out of the tree
entirely.

**A branch whose children have not arrived cannot be expressed.** The reader
distinguishes a leaf from an empty branch, and nothing else. A tree fed from an
API that returns one level at a time has no way to say "there is more here" — so
either everything is loaded up front, or the structure is a lie.

**A node the user knows about cannot be reached programmatically.** There is no
way to say "show me this node": expand its ancestors, bring it into view, put the
keyboard on it. That blocks deep links, "jump to the node I just created", and
"take me to that search result" — all of which the application has to solve by
walking the tree itself, which is the work the model exists to do.

**A large tree can only be opened one branch at a time**, and a set of nodes can
only be checked one click at a time. Twelve siblings is twelve clicks.

**Two keyboard gestures the accepted standard expects are missing.** The WAI-ARIA
authoring practices list type-ahead as a regular interaction for every tree — not
an optional one — and list range selection among the recommended multi-select
keys. The first version excluded type-ahead on the grounds that the tree has a
search. They are not the same gesture: type-ahead moves focus among the nodes
that are showing; search changes which nodes show. In a large open tree the user
wants the first.

## Solution

Give the tree a vocabulary for what it cannot do, and gestures for reaching what
it can.

**Two rules replace the exclusion** (ADR-0005). The cascade leaves alone every
node it may not check. The "are all children checked" test takes every child
exactly as it is, excluding nothing. Under those two rules a branch containing an
unchecked disabled child is simply not checked — true, renderable, actionable —
and the third check state the first version feared never appears.

**Disabled means one thing only: not checkable.** Arrow keys reach a disabled
node, it can be activated, it carries focus and its focus ring. Only its checkbox
is inert. Nothing in the original reasoning touched navigation, and a node one may
look at but not tick is the ordinary case.

**An unloaded branch is a disabled node with a different reason.** The reader
gains a way to say "this branch may have children that are not here". Such a
branch shows a chevron, opening it is reported to the caller, and it may not be
checked — because checking it would claim descendants nobody has seen. The
component does not fetch anything: the caller extends its own data and the tree
re-renders. Concurrency, failure and cancellation stay outside a module that is
otherwise pure.

**A search cannot look inside an unloaded branch, and says so.** Such a branch
survives every filter rather than being dropped. A filtered tree therefore shows
something that did not match — on purpose. A result set that is confidently wrong
is worse than one that admits its edge.

**Showing a node is one call.** It expands what it can along the path, brings the
node into view, and reports how far it got. If the path runs into an unloaded
branch it stops there and says so, which is exactly the signal the caller needs to
load that branch and call again — the same loop it already runs for expansion.

**Opening and closing everything is one call**, over what is loaded. It never
triggers loading: one click that fires a thousand requests is a trap, not a
feature.

**Type-ahead moves the keyboard to the next node whose label starts with what was
typed**, among the nodes that are showing, without changing what shows.

**Range selection follows the standard's recommended model**, which is the only
one compatible with what the tree already does: the space bar toggles a node,
shift with an arrow moves and toggles, shift with the space bar checks everything
between the anchor and here, and control with A checks everything or clears it.
Disabled and unloaded nodes are stepped over.

## User Stories

1. As a developer, I want to mark a node as not checkable, so that a tree can show something the user may see but not choose.
2. As a developer, I want a disabled node to stay navigable, so that it is part of the structure rather than a hole in it.
3. As a developer, I want the cascade to step over disabled nodes, so that checking a folder does not claim things the user may not have.
4. As a developer, I want a disabled node's own state to count towards its parent, so that a parent is never reported as fully checked while something below it is outstanding.
5. As a developer, I want a disabled node that arrives already checked to stay checked, so that a restored state is not quietly rewritten.
6. As a developer, I want to say that a branch may have children that are not loaded, so that a tree fed one level at a time can tell the truth about its shape.
7. As a developer, I want to be told when an unloaded branch is opened, so that I can fetch its children.
8. As a developer, I want to extend my own data and have the tree follow, so that fetching, retrying and cancelling stay in my code where I can see them.
9. As a developer, I want an unloaded branch to be uncheckable, so that a check never claims descendants nobody has seen.
10. As a developer, I want an unloaded branch to survive a search, so that my users are not shown a result count that is confidently wrong.
11. As a developer, I want to reveal a node by its key, so that a deep link, a freshly created node or a chosen search result can be brought into view without me walking the tree.
12. As a developer, I want revealing to report how far it got, so that I can load what is missing and try again.
13. As a developer, I want revealing to work with virtualisation, so that a node outside the rendered window is scrolled to rather than merely expanded.
14. As a developer, I want to open or close everything in one call, so that I do not write that traversal myself.
15. As a developer, I want opening everything to leave unloaded branches closed, so that one gesture cannot fire a thousand requests.
16. As a developer, I want the range gestures to skip what cannot be checked, so that a sweep does not silently fail on part of its range.
17. As a developer, I want every new rule to be a pure function of the model, so that I can assert it without a browser.
18. As an end user, I want to see a node I may not choose, so that I understand the structure I am working in.
19. As an end user, I want a node I may not choose to look different from one I simply have not chosen, so that I do not click at it repeatedly.
20. As an end user, I want to reach a disabled node with the arrow keys, so that the keyboard walks the same structure my eyes do.
21. As an end user, I want a branch whose contents have not loaded to look like it has contents, so that I know to open it.
22. As an end user, I want to see that a branch is loading, so that I do not think the click was lost.
23. As an end user, I want a search to admit that it could not look everywhere, so that I do not conclude something is absent when it is merely unseen.
24. As an end user, I want to type the first letters of a node's name and land on it, so that I can cross a long open tree without the mouse.
25. As an end user, I want type-ahead to keep the tree as it is, so that finding a node does not rearrange what I was looking at.
26. As an end user, I want typing several characters quickly to narrow the jump, so that similar names are still reachable.
27. As an end user, I want to hold shift and press an arrow to check as I move, so that a run of neighbours is one gesture.
28. As an end user, I want to hold shift and press the space bar to check everything between where I started and where I am, so that a long run does not need a key press per node.
29. As an end user, I want control with A to check everything, and to clear it when everything is checked, so that one gesture covers both directions.
30. As an end user, I want a range gesture to step over what I may not check, so that it does what it can rather than nothing.
31. As an end user, I want to open or close the whole tree at once, so that I can start from either end.
32. As an end user, I want the node I was sent to be focused and visible, so that a link lands me somewhere rather than near somewhere.
33. As a library maintainer, I want the two cascade rules asserted directly, so that the reasoning ADR-0005 replaces cannot creep back.
34. As a library maintainer, I want the case of a parent with an unchecked disabled child asserted, so that the state ADR-0003 feared is shown to be ordinary.
35. As a library maintainer, I want revealing into an unloaded path asserted, so that the reported stopping point is proven rather than assumed.
36. As a library maintainer, I want every new keyboard gesture proven in a real browser, so that a gesture that works in a fake DOM and not in a real one cannot ship again.
37. As a library maintainer, I want the type-ahead matcher pure and its timing separate, so that the part with logic is testable and the part with a timer is small.
38. As a library maintainer, I want the capability record extended, so that what is proven at which level stays written down.
39. As a library maintainer, I want ADR-0003 to point at what replaced it, so that a future reader does not act on a decision that has been overturned.
40. As a library maintainer, I want no new test seam, so that this package extends the four the tree already has rather than adding a fifth.

## Implementation Decisions

**The reader gains two optional predicates.** One says whether a node may be
checked, one says whether a branch may have children that are not present. Both
are optional, so a caller who needs neither writes exactly what they write today.
Neither changes the node type: they are questions asked about the caller's data,
like every other accessor.

**Unloadedness is a named question, not an overloaded return value.** Returning
`null` from the children accessor to mean "unknown" while `undefined` means "leaf"
is the kind of distinction that is wrong more often than it is right. A separate
predicate is greppable and cannot be confused with an empty list.

**Two rules govern the cascade** (ADR-0005). It skips what it may not check. The
count test takes every child as it is and excludes nothing. Nothing else changes:
indeterminate is still derived, reconciliation still runs only along the path to
the node that was touched.

**An unloaded branch is uncheckable by the same mechanism as a disabled node.**
One rule serves both, and the model does not distinguish them where it does not
have to.

**An unloaded branch survives every filter.** It cannot be searched, so it is
never claimed to have no match. Its entry says it is unloaded and the interface
shows that; the user sees where the search stopped looking.

**The flattening carries the node's label.** It is already computed while
searching, and carrying it removes the need to hand the reader to anything
downstream — type-ahead in particular becomes a pure function over the flattening.

**Revealing a node is a path walk plus an expansion**, both pure. Finding the path
to a key and expanding what is loaded along it are functions of the model; the
companion adds bringing the row into view and moving the keyboard. It reports the
deepest key it reached: the target when it succeeded, the unloaded branch where it
stopped, or nothing when the key is not in the data at all.

**Opening everything acts on loaded, non-empty branches only** and never triggers
loading. The resulting flattening can be very long; that is what virtualisation is
for, and it is a gesture the user asks for deliberately.

**Type-ahead uses the standard's model**: the buffer accumulates while keys arrive
in quick succession and clears after a pause; matching is case-insensitive on the
start of the label, over the flattening, wrapping around from the active node. It
does not change expansion, checking or what is filtered. Disabled nodes take part —
they are navigable — and unloaded branches take part as themselves.

**Range selection uses the standard's recommended model**, not its alternative.
The alternative reassigns the space bar, which this tree has already given to
checking. The anchor is part of the state, so a range is reproducible and
controllable from outside like everything else. Range gestures step over what
cannot be checked rather than stopping at it.

**Control with A toggles**: it checks everything checkable when anything is
unchecked, and clears when everything checkable is already checked.

**Disabled nodes look muted and keep their focus ring**, because they are still
navigable. Their checkbox is inert rather than absent, so the column does not
shift.

## Testing Decisions

**No new seam.** This package extends the four the tree already has, and that is
deliberate: everything it adds is either a function of the model or a gesture, and
both already have a home.

- **The pure model.** The two cascade rules, the count test with a disabled child,
  the survival of unloaded branches under a filter, the path walk, expanding
  everything, the type-ahead matcher and the range calculation. All of it is
  arithmetic over the flattening or a walk over the roots, and none of it needs a
  browser.
- **Behaviour in jsdom.** What the accessibility layer reports for disabled and
  unloaded nodes, that the inert checkbox is inert, that opening an unloaded
  branch reports it.
- **The browser.** Every new keyboard gesture, without exception. This is not
  belt-and-braces: the last package shipped a checkbox that worked in the fake DOM
  and did nothing in a real browser, because a click through nested elements
  behaves differently in the two. Any gesture involving a real key press or a real
  click is proven where the user performs it.
- **Screenshots.** Disabled nodes, an unloaded branch and its loading state, in
  both themes.

**Count gestures, do not compare results.** The bug the last package shipped
survived because a test compared the reported set instead of counting how many
times the handler fired, and two toggles from the same state produce the same set.
Every gesture test in this package asserts how many times something happened.

**Coverage priorities, in order.** The two cascade rules and the count test with a
disabled child, because they are the reasoning ADR-0005 replaces and the place a
regression would be invisible. Then the path walk into an unloaded branch and its
reported stopping point. Then the range calculation over a run containing
something uncheckable. Then type-ahead's wrap-around. Then the browser gestures.

**Fixture data.** Extend the tree model's existing purpose-built fixture with a
disabled node and an unloaded branch rather than building a second one. The
existing cases must keep passing unchanged: both new predicates are optional, and
a fixture that does not use them must behave exactly as before.

**Regression safety.** No existing screenshot baseline moves except the tree's
own tile, which gains new states deliberately. Every existing tree test passes
unchanged — if one needs editing, an optional addition was not optional.

## Out of Scope

- **Sharing a tree's state as a link.** The table has an equivalent; the author
  does not need one here.
- **The component fetching anything.** It reports that a branch was opened. The
  caller fetches.
- **Retry, failure and cancellation of loading.** Consequences of the above.
- **Searching inside unloaded branches**, which is impossible, and any attempt to
  approximate it.
- **Disabled meaning unnavigable.** Disabled is a statement about the checkbox.
- **Inheriting disabled down a subtree.** A caller whose rule is "everything under
  this is locked" writes that in its predicate, which is one line and reads better
  where the rule actually lives.
- **`*` to expand siblings at one level**, which the standard lists as optional and
  which nobody asks for.
- **The standard's alternative multi-select model.** Incompatible with the space
  bar this tree already assigns.
- **Drag and drop, inline renaming, context menus, node actions, sorting.**
  Unchanged from the tree's own out-of-scope list; drag and drop remains its own
  work package.

## Further Notes

The interesting part of this package is that it removes an exclusion rather than
adding a feature. ADR-0003 was right about the two states and wrong about their
consequences, and the wrongness came from a rule that was never necessary:
excluding disabled children from the count. Once that rule is gone, disabled
nodes and unloaded branches are the same problem with the same two-line answer,
and the third check state that justified the exclusion never appears. It is worth
noticing how confidently the original reasoning read.

Type-ahead is the second thing the first pass got wrong for a plausible reason.
"The tree has a search" is true and irrelevant: one gesture moves the focus, the
other moves the ground. Checking against the authoring practices is what surfaced
it, and it is a good argument for checking new components against them as a matter
of course rather than at the end.

One accessibility question remains genuinely open and is deliberately not settled
here: the tree reports checking through `aria-checked` on each node and omits
`aria-multiselectable`, which the practices describe in terms of `aria-selected`.
That reading is defensible and has not been confirmed against a real screen
reader. It should be, before the package makes any further accessibility claims.
