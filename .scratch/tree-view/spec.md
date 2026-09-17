# Spec: A tree view

Status: done

Origin: `/grill-with-docs` session, 25 Aug 2026. Prompted by "I need a TreeView
with every feature you can think of — expandable, multiselect, … — that fits
seamlessly into the library's style."

Decisions recorded as ADRs: `docs/adr/0003-an-active-node-is-not-a-selection.md`,
`docs/adr/0004-a-flat-accessibility-tree.md`. Vocabulary in `CONTEXT.md`.

Sequencing: self-contained within `packages/ui`. Issue 01 must land before 02;
02 before everything else. Not anticipated by `HANDOFF.md`, whose fifteen work
packages contain no tree.

---

## Problem Statement

The library has no way to show hierarchy. Everything it offers is flat: a table
of rows, a list of options, a menu of items. An application with a folder
structure, an organisational chart, a category system or a permission hierarchy
has to build its own — and building one badly is easy, because almost everything
that makes a tree hard is invisible until it is wrong.

The request was for "every feature you can think of". That framing is the risk
this spec has to answer rather than obey. The library's own table spec records
what happens when a component accumulates features without a model behind them:
an interface costing about twenty-five props to learn that buys back one styled
element per prop. A tree with drag-and-drop, inline renaming, lazy loading,
context menus, type-ahead and search bolted onto a rendering component would land
in exactly that place, and the parts that matter would be the ones nobody wrote
down.

Three of those parts matter more than the rest.

**"Multiselect" is two states.** A tree answers "where am I" — one node, focused,
driving whatever detail view sits beside it — and "what have I picked" — any
number of nodes, driving a bulk action. Components that put both behind one
`selected` prop cannot separate them again.

**Checking a branch has to mean something.** If checking a folder does not check
its contents, the checkbox is decoration. If it does, then a folder whose
contents are partly checked needs a third visual state, and that state has to be
derived rather than stored or it will drift out of step.

**A tree of any size cannot all be in the document.** The library already knows
this about tables and solved it. A tree can reuse that solution, but only if it
stops being nested.

## Solution

A tree view built the way the table is built: a pure model, a thin stateful
companion, and compositional rendering pieces.

**The model is pure and holds no state.** It takes the roots, a description of
how to read a node, and the current expansion, checking, activation and search
values, and returns the **flattening** — the visible nodes in reading order, each
carrying its level, whether it is a branch, whether it is expanded, whether it is
checked or indeterminate, and where it sits among its siblings. The state
transitions are pure functions in the same module: expanding, collapsing,
checking, unchecking and moving the active node each take a state and return a
new one. Everything genuinely hard about a tree lives here, and none of it needs
a browser to test.

**Nodes stay the caller's own type.** The model is told how to read a node's key
and its children through two accessors, once. It never requires a particular
shape and never copies the caller's data into one of its own.

**The active node and the checked set are separate state** (ADR-0003). Moving
around checks nothing; checking moves nothing. Checking cascades down to
descendants and reconciles up through ancestors, and the indeterminate state of a
partly-checked branch is derived from its descendants every time rather than
stored.

**The accessibility tree is flat** (ADR-0004). Each visible node is rendered as
one item declaring its own level, its position among its siblings and its sibling
count. That is what lets the tree reuse the table's virtualisation unchanged: once
flattened, a tree is a list, and the library already knows how to render only the
part of a list that is on screen.

**Searching shows matches in place.** A node is visible if it matches or if any
descendant matches, so a match is always shown with the path that leads to it.
Ancestors shown only because of a descendant are marked as such, so the interface
can mute them. Crucially, a search opens the branches it needs **without touching
the expansion state**: clearing the search returns the tree to exactly the shape
the user had left it in.

**Keyboard and appearance follow the house rules.** Roving tabindex with exactly
one focusable item, arrow keys to move, right to open, left to close or go up,
Enter to activate, Space to check. Ink on paper, one accent for interactive state,
the existing checkbox with its indeterminate state, the shared glyph set, and
wording through the wording seam.

**Drag-and-drop, inline renaming and lazy loading are not in it.** The first two
are their own components with their own state machines. The third is excluded for
a reason rather than for effort: a cascading check must be able to reach every
descendant, and children that have not arrived cannot be reached.

## User Stories

1. As a developer, I want a tree component in the library, so that I do not build hierarchy from scratch in every application.
2. As a developer, I want to pass my own node type unchanged, so that I do not copy my data into a shape the component prefers.
3. As a developer, I want to tell the tree how to read a node's key and its children once, so that the instruction is in one place rather than repeated per node.
4. As a developer, I want nested data with children, so that the tree takes what my API already returns.
5. As a developer, I want the model available on its own, so that I can drive a tree that renders nothing like the default one.
6. As a developer, I want the model to be pure, so that I can assert hierarchy behaviour without a browser.
7. As a developer, I want the state transitions to be pure functions too, so that "what happens when I check this" is answerable without mounting anything.
8. As a developer, I want a stateful companion for the common case, so that I do not wire five pieces of state by hand.
9. As a developer, I want the active node and the checked set kept apart, so that "where the user is" and "what the user picked" cannot be confused.
10. As a developer, I want checking a branch to check its descendants, so that the checkbox on a folder means what it appears to mean.
11. As a developer, I want unchecking a branch to uncheck its descendants, so that the gesture is symmetrical.
12. As a developer, I want a branch to become checked when its last unchecked descendant is checked, so that the state stays consistent from below as well as above.
13. As a developer, I want the indeterminate state derived rather than stored, so that it cannot drift out of step with the descendants it describes.
14. As a developer, I want the checked set to contain branches as well as leaves, so that I can send a compact answer to a server.
15. As a developer, I want to control expansion, checking and activation from outside, so that I can restore a tree from a URL or a saved view.
16. As a developer, I want to search the tree, so that a user can find a node without opening every branch.
17. As a developer, I want a match shown together with the path that leads to it, so that the user can see where the match sits.
18. As a developer, I want ancestors shown only because of a descendant marked as such, so that I can mute them and keep the real matches legible.
19. As a developer, I want a search to leave the expansion state alone, so that clearing it returns the tree to the shape the user left.
20. As a developer, I want a large tree to render only what is on screen, so that a structure of many thousands of nodes stays responsive.
21. As a developer, I want the tree to reuse the library's existing virtualisation, so that there is one implementation of that arithmetic rather than two.
22. As a developer, I want the tree's appearance to match the rest of the library, so that it does not read as a component from somewhere else.
23. As a developer, I want to compose my own node content, so that icons, badges, counts and secondary text stay possible.
24. As a developer, I want the tree's German wording to come from the wording seam, so that I can override individual entries the way I can everywhere else.
25. As a developer, I want the expand chevron to come from the shared glyph set, so that it is drawn to the same specification as everything else.
26. As an end user, I want to open and close a branch, so that I can look at part of a structure without seeing all of it.
27. As an end user, I want an empty branch to be distinguishable from an unopened one, so that I do not click at something that will never open.
28. As an end user, I want the level of a node to be visible at a glance, so that I can read the structure without counting.
29. As an end user, I want to move through the tree with the arrow keys, so that I do not have to reach for the mouse.
30. As an end user, I want the right arrow to open a closed branch and step into an open one, so that one key moves me deeper by either meaning.
31. As an end user, I want the left arrow to close an open branch and step out of a closed one, so that one key moves me shallower by either meaning.
32. As an end user, I want Home and End to reach the first and last visible node, so that I can cross a long tree in one gesture.
33. As an end user, I want the up and down arrows to move by what I can see, so that a closed branch's contents are skipped rather than walked through invisibly.
34. As an end user, I want Enter to activate a node, so that the keyboard can do what a click does.
35. As an end user, I want Space to check a node, so that checking and activating are separate gestures as well as separate states.
36. As an end user, I want exactly one node reachable by Tab, so that the tree is one stop in the page's tab order rather than thousands.
37. As an end user, I want Tab to return me to the node I was on, so that leaving the tree and coming back does not lose my place.
38. As an end user using a screen reader, I want each node to announce its level, its position among its siblings and how many siblings it has, so that I can understand a structure I cannot see.
39. As an end user using a screen reader, I want a branch to announce whether it is open or closed, so that I know whether there is more below it.
40. As an end user using a screen reader, I want those announcements to stay correct while only part of the tree is rendered, so that virtualisation does not cost me the structure.
41. As an end user using a screen reader, I want those announcements to stay correct while a search is narrowing the tree, so that the counts describe what is there rather than what was there.
42. As an end user, I want a partly-checked folder to look different from a checked one and from an unchecked one, so that I can tell at a glance that there is something below to look at.
43. As an end user, I want the active node visibly marked, so that I know where the keyboard will act.
44. As an end user, I want the active node and my checked nodes to look different from each other, so that two different things do not share one appearance.
45. As an end user, I want reduced motion respected, so that opening a branch does not animate when I have asked it not to.
46. As a library maintainer, I want the flattening to be the single data structure everything downstream reads, so that nothing else has to know how to walk a tree.
47. As a library maintainer, I want the cascade asserted directly, so that the most subtle behaviour in the component is proven rather than remembered.
48. As a library maintainer, I want the search-with-ancestors rule asserted directly, so that the case of a deep match under closed branches is covered.
49. As a library maintainer, I want the "search does not disturb expansion" rule asserted directly, so that a regression there is caught by a test rather than by a user.
50. As a library maintainer, I want the sibling counts asserted under a filter, so that the accessibility obligation ADR-0004 creates is verified.
51. As a library maintainer, I want the virtualisation arithmetic to have one home and one test file, so that a second consumer does not mean a second copy.
52. As a library maintainer, I want the tree covered by a screenshot in both themes, so that its appearance is guarded like every other component's.
53. As a library maintainer, I want the tree covered by the existing accessibility sweep, so that its roles and attributes are checked by the same tool as the rest.
54. As a library maintainer, I want a capability record for the tree, so that what is proven at which level is written down rather than assumed.

## Implementation Decisions

**The shape is the table's shape.** A pure model module, a stateful companion
hook, and compositional rendering pieces. This is the pattern the table model
established in this package, and the tree is the same kind of problem: a
non-trivial derivation the caller currently has to get right by hand.

**The model takes roots, a reader and a state, and returns the flattening.** The
reader says how to get a node's key and its children. The state carries the
expanded keys, the checked keys, the active key and the search term. The
flattening is a list of entries, each carrying the node itself, its key, its
level, whether it is a branch, whether it is expanded, whether it is checked,
whether it is indeterminate, whether it matched the search or is only shown as an
ancestor of a match, its position among its siblings and its sibling count.

**Keys are strings or numbers**, matching the convention the existing selection
helper already uses. Two nodes sharing a key is a development-time invariant, not
a silent merge.

**The state transitions live in the model module as pure functions.** Expanding,
collapsing, toggling a check, and moving the active node in each of the six
keyboard directions each take a state and return a new one. Putting them here
rather than in the hook is what keeps the seam count at one: the hook becomes a
state holder with no logic of its own to test.

**Checking cascades down and reconciles up.** Toggling a node's check adds or
removes every descendant. Every ancestor is then recomputed: checked if all of
its children are checked, unchecked otherwise. Indeterminate is never stored — a
branch is indeterminate when it is not checked and at least one descendant is,
computed as the flattening is built.

**The active node moves without changing anything else.** It is a single key or
none. Activation is reported to the caller as an event; the component does not
attach meaning to it.

**Search keeps a node when it matches or when a descendant matches.** Matching is
against a caller-supplied label accessor, case-insensitively, on a trimmed term.
Entries carry whether they matched themselves, so ancestors kept only for the path
can be rendered differently. While a search is active, a branch with a surviving
descendant is treated as open regardless of the expansion state, and the
expansion state is not written to. Clearing the search restores the previous
shape exactly.

**Sibling counts are computed against what survives the filter**, not against
what is rendered and not against the unfiltered tree. This is the obligation
ADR-0004 creates and the thing most likely to be got quietly wrong.

**The accessibility layer is a flat sequence** (ADR-0004): one item per visible
node, each declaring its level, its position and its sibling count, with branches
declaring whether they are open. Indentation is a computed offset from the level,
not a consequence of nesting.

**Keyboard follows the house rule for lists and grids**: roving tabindex with
exactly one item focusable, which is the active node. Down and up move by the
flattening, so a closed branch's contents are skipped. Right opens a closed
branch and steps to the first child of an open one. Left closes an open branch
and steps to the parent of a closed one. Home and End reach the ends of the
flattening. Enter activates. Space toggles the check. Type-ahead is not included:
the tree has a search, and two ways to find a node by typing is one too many.

**Virtualisation is the library's existing one, moved rather than copied.** The
window arithmetic is index-based and not table-specific; it moves to the shared
library folder, keeping every existing public export working and the table's
behaviour byte-identical. A second consumer is the reason; a second copy would be
the alternative.

**The checkbox is the existing one.** It already supports the indeterminate
state, so the tree wires it rather than building one.

**The chevron becomes a shared glyph drawn to specification.** The glyph document
sets the threshold at two places, and the tree is the second. The table's existing
inline chevron is drawn at a stroke weight the specification does not permit, and
the glyph document's own precedent is that such glyphs were left alone rather than
silently re-drawn — so it stays where it is and is recorded in that document's list
of known divergences, with the reason.

**Wording goes through the wording seam** as a set of entries in the default
German dictionary, with individual overrides falling back to the default.

**Nodes render compositionally.** The tree supplies the row, the indentation, the
chevron, the checkbox and the accessibility attributes; what a node *says* is the
caller's, so icons, badges, counts and secondary text stay possible.

## Testing Decisions

**What makes a good test here.** A test calls the model with a tree and a state
and asserts the flattening it returns — which nodes, in what order, at what
levels, with what checked, indeterminate and match flags, and with what sibling
counts. Or it calls a transition with a state and asserts the state that comes
back. It does not mount anything to test hierarchy, and it does not assert on
class names or element structure. The flattening is the whole observable surface
of the model; a test that needs more than it is testing the wrong thing.

**One new seam.** The pure tree model, with its own test file, following the
table model's test file exactly. Everything genuinely hard lives there:
flattening, levels, the cascade, the derived indeterminate state, search with
ancestors, sibling counts under a filter, and every keyboard transition as a pure
state change. Because the transitions are pure, the companion hook has no logic
of its own and needs no seam.

**Everything else on existing seams.**

- **Component behaviour, in jsdom.** The keyboard and the accessibility
  attributes get a React Testing Library test. Prior art: the radio group's test,
  which is the package's existing keyboard-behaviour test.
- **Virtualisation.** The existing pure test file moves with the module and must
  pass unchanged. That it does is the proof the move was behaviour-preserving.
- **Wording.** The existing wording tests cover the dictionary and its fallback;
  the tree's entries join them.
- **Screenshots, in a browser.** A demo tile in both themes, showing an open
  tree with mixed checked, unchecked and indeterminate branches, an active node,
  and a search narrowing it.
- **Accessibility, in a browser.** The existing automated sweep covers the new
  tile. Note that this sweep is currently unrunnable for an unrelated missing
  dependency; see Further Notes.

**Coverage priorities, in order.** The cascade and the derived indeterminate
state, because it is the component's most subtle behaviour and the easiest to
get almost right. Then search with ancestors, including a deep match under
several closed branches. Then that a search leaves the expansion state untouched.
Then the sibling counts under a filter. Then the keyboard transitions, especially
the two arrow keys that mean two things each.

**Fixture data.** A small purpose-built tree inside the test file, deep enough to
have grandchildren and wide enough for sibling counts to be interesting. Not the
demo's data: the existing interaction tests are coupled to demo rows, which is
why editing the demo breaks them, and that coupling should not be extended.

**Regression safety.** Moving the virtualisation module must move no pixel and
change no public export. Every existing screenshot baseline stays as it is; if
one moves, the move was not behaviour-preserving and that part is fixed rather
than re-baselined.

## Out of Scope

- **Drag-and-drop reordering.** Its own component with its own state machine,
  and a large one. It deserves a work package rather than a corner of this one.
- **Inline renaming.** Likewise, and it overlaps with the inline cell editing
  package the handoff already anticipates.
- **Lazy loading of children.** Excluded for a reason rather than for effort: a
  cascading check must be able to reach every descendant, and children that have
  not arrived cannot be reached. See ADR-0003.
- **Disabled nodes.** The same reasoning in miniature: a branch containing a node
  that may not be checked can never reach the fully-checked state.
- **Type-ahead.** The tree has a search.
- **A context menu on a node**, and node action buttons. The node content is
  compositional; a caller who wants either can put it there.
- **Multi-root drag between trees, copy and paste, undo.**
- **Sorting the tree.** The order is the order the caller supplies.
- **A flat source shape with parent references.** Converting one to nested data
  is a few lines in the caller and does not need a second contract in the
  component.
- **Any change to the table**, beyond the virtualisation module moving out from
  under it with its exports and behaviour preserved.
- **Redrawing the table's existing chevron.**

## Further Notes

The framing worth keeping is that this is a modelling job wearing a component's
clothes. Almost everything that makes a tree hard — the cascade, the derived
third checkbox state, search that has to show a path, sibling counts that have to
survive a filter, arrow keys that mean two things each — is arithmetic over a
list, and all of it can be settled before a single element is rendered. The parts
that actually need a browser are the parts the library already knows how to do.

The request was for every feature. What this spec removes is not the features
that are hard but the ones that are separate: drag-and-drop and renaming are not
tree behaviours, they are editing behaviours that happen to be performed on a
tree. What it keeps is what a tree cannot be without.

The exclusion of lazy loading is the one worth revisiting if it becomes painful.
It follows from the cascade, not from the tree, so a future version that offered
non-cascading checks could offer lazy loading alongside them. That would be a new
decision superseding ADR-0003 rather than an extension of it.

`packages/ui` used to fail its type check, and a full browser run could not
start, because `@axe-core/playwright` did not resolve from that package. The
cause turned out to be small: the dependency was declared in the root manifest
but had never been installed. Installing it fixed both, without a lockfile
change, and the accessibility sweep now covers the tree's tile like every
other.
