# The tree – a capability record

Every capability with the level at which it is proved. After the pattern of
`packages/charts/docs/capabilities.md`: only what is actually evidenced stands here, and it
stands with the evidence.

Levels of proof:

* **Unit (model)** – vitest, `tests-unit/treeModel.test.ts`
* **Unit (interaction)** – vitest + Testing Library, `tests-unit/treeInteraction.test.tsx`
* **Unit (search/size)** – vitest + Testing Library, `tests-unit/treeSearchAndSize.test.tsx`
* **Unit (wording)** – vitest, `tests-unit/language.test.tsx`
* **Interaction** – Playwright, `tests-visual/features-tree.spec.ts`
* **Screenshot** – Playwright, page `treeview` × light/dark
* **Accessibility** – Playwright + axe, WCAG 2.1 AA, page `treeview`

State: `tree-view` 01–06 and `tree-view-reach` 01–06 delivered.

## Model and flattening

| Capability | Decision | Proved at |
|---|---|---|
| Flattening in reading order, with a level per node | ADR-0004 | Unit (model) |
| A closed branch does not contribute its contents | — | Unit (model) |
| Branch, leaf and empty branch are distinguishable | — | Unit (model), Screenshot |
| Position and sibling count per node | ADR-0004 | Unit (model) |
| Sibling counts count the survivors of a filter | ADR-0004 | Unit (model), Unit (search/size) |
| A node's kind stays the caller's, read through accessors | — | Unit (model) |
| Empty tree, unknown active key, orphaned expansion key | — | Unit (model) |
| The model does not write into the state it was handed | — | Unit (model) |
| A duplicate key is found | — | Unit (model) |
| A duplicate key is reported in development | — | **not proved** – the warning itself has no test |
| Locked and unloaded nodes in the flattening | ADR-0005 | Unit (model) |
| An unloaded node counts as a branch, not as a leaf | ADR-0005 | Unit (model), Unit (interaction) |
| The label lies in the entry (it carries the typeahead) | — | Unit (model) |

## Ticking

| Capability | Decision | Proved at |
|---|---|---|
| Cascade downwards, grandchildren included | ADR-0003 | Unit (model), Unit (interaction) |
| The cascade reaches nodes that were never rendered | ADR-0003 | Unit (interaction) |
| Symmetrical unticking | ADR-0003 | Unit (model) |
| Reconciliation upwards as far as the root | ADR-0003 | Unit (model), Unit (interaction) |
| Only the ancestors of the touched node are reconciled | ADR-0003 | Unit (model) |
| Indeterminate is derived and never stored | ADR-0003 | Unit (model), Unit (interaction) |
| An empty branch counts like a leaf (not vacuously ticked) | — | Unit (model) |
| The reported set contains branches and leaves | — | Unit (model), Unit (interaction) |
| Three box states visibly distinguished | — | Screenshot (`treeview`) |
| One click toggles **exactly once** | — | Unit (interaction), Interaction |
| Cascade and reconciliation with the mouse, in the browser | ADR-0003 | Interaction |
| Without ticking, no room is kept for it | — | Unit (interaction) |
| The cascade leaves alone what it may not tick | ADR-0005 | Unit (model), Interaction |
| The count test takes every child as it is – nothing is taken out | ADR-0005 | Unit (model), Interaction |
| The count test holds at **every** level, not only at the touched node | ADR-0005 | Unit (model) |
| To toggle means: tick, and if that changed nothing, untick | ADR-0005 | Unit (model), Interaction |
| A branch with a locked child can be deselected again | ADR-0005 | Unit (model), Interaction |
| Deselecting leaves the locked node as it is | ADR-0005 | Unit (model) |
| A single tick and a span compute the same as `toggleAll` | ADR-0005 | Unit (model) |
| A branch with a pending locked child never becomes full | ADR-0005 | Unit (model), Interaction |
| A branch becomes full if the locked child arrived already ticked | ADR-0005 | Unit (model) |
| A restored state is not rewritten | ADR-0005 | Unit (model) |
| A locked box is locked, not omitted | ADR-0005 | Unit (interaction), Screenshot |
| A locked node stays navigable and activatable | ADR-0005 | Unit (interaction), Interaction |
| An unloaded branch cannot be ticked | ADR-0005 | Unit (model), Unit (interaction) |
| Expanding an unloaded branch is reported exactly once | ADR-0005 | Unit (interaction) |
| A loading indicator while open and unloaded | ADR-0005 | Interaction |
| The tree loads nothing itself | ADR-0005 | Code; the demo loads and extends its data |

## The active node and the keyboard

| Capability | Decision | Proved at |
|---|---|---|
| The active node and the ticked set are separate | ADR-0003 | Unit (interaction) |
| Exactly one tab stop, at the active node | Handoff A.5 §7 | Unit (interaction), Unit (search/size) |
| Without an active node the first entry carries the tab stop | — | Unit (interaction) |
| Up/down along the flattening, closed branches skipped | — | Unit (model), Unit (interaction) |
| Right opens first, then steps in | — | Unit (model), Unit (interaction) |
| Left closes first, then steps out | — | Unit (model), Unit (interaction) |
| Right on a leaf and an empty branch does nothing | — | Unit (model), Unit (interaction) |
| Home and End reach the ends | — | Unit (model), Unit (interaction) |
| Enter activates and ticks nothing | ADR-0003 | Unit (interaction) |
| Space ticks and moves nothing | ADR-0003 | Unit (interaction) |
| A click on the label activates, one on the box ticks | ADR-0003 | Unit (interaction) |
| The angle folds without activating | — | Unit (interaction), Interaction |
| The keyboard travels, opens and ticks – in the browser | — | Interaction |
| Tab returns to the previously active node (the tab stop stays put) | — | Unit (interaction) |
| Focus follows the active node | — | Interaction (`toBeFocused`); in jsdom only the seat of the tab stop |

## Screen reader

| Capability | Decision | Proved at |
|---|---|---|
| A flat sequence of `treeitem` with level, position, sibling count | ADR-0004 | Unit (interaction) |
| A branch announces whether it is open; a leaf says nothing | — | Unit (interaction) |
| The tick state on the node, `mixed` when indeterminate | ADR-0003 | Unit (interaction) |
| The visible box is hidden from the screen reader | — | Unit (interaction) |
| No `aria-selected` for the active node | ADR-0003 | Unit (interaction), Code |
| The tree carries a name | — | Unit (interaction) |
| axe check of the page, WCAG 2.1 AA | — | Accessibility |
| A locked node reports `aria-disabled` | ADR-0005 | Unit (interaction) |

## Search

| Capability | Decision | Proved at |
|---|---|---|
| A hit appears with its whole path | — | Unit (model), Unit (search/size), Interaction |
| Every hit is visible – including one under a hitting ancestor | — | Unit (model) |
| Ancestors present only for the path's sake are marked as such and muted | — | Unit (model), Unit (search/size) |
| Children under a hit are context and are not muted | — | Unit (model), Unit (search/size) |
| A branch that hits itself without hitting descendants keeps its state | — | Unit (model) |
| Sibling counts hold at deeper levels under the filter too | ADR-0004 | Unit (model), Unit (search/size) |
| Regardless of case and whitespace | — | Unit (model) |
| An unloaded branch survives every filter | ADR-0005 | Unit (model), Interaction |
| A locked node is filtered like any other | ADR-0005 | Unit (model) |
| Wording through the language seam, overridable entry by entry | — | Unit (wording) |
| No hit: an empty state instead of an empty box | — | Unit (search/size), Interaction |
| The expansion state is not touched | — | Unit (model), Unit (search/size) |

## Size

| Capability | Decision | Proved at |
|---|---|---|
| Without virtualisation every node is rendered | — | Unit (search/size) |
| With virtualisation only a window | — | Unit (search/size) |
| Positions and sibling counts are the same with and without a window | ADR-0004 | Unit (search/size) |
| Exactly one tab stop with a window too | — | Unit (search/size) |
| The keyboard reaches nodes outside the window | — | Unit (search/size) |
| Virtualisation can be switched off and is off by default | — | Unit (search/size) |
| Revealing a node: ancestors open, into the window, focused | — | Unit (model), Interaction |
| An explicit reveal takes the focus, even from outside | — | Interaction |
| Reports the deepest key reached | — | Unit (model) |
| Stops at an unloaded branch and expands it | — | Unit (model) |
| Expand and collapse everything, only across what is loaded | — | Unit (model), Interaction |
| Collapsing leaves nothing open, not even after a search | — | Unit (model) |
| Expanding everything triggers no loading | ADR-0005 | Unit (model) |
| The window arithmetic is the table's, unchanged | — | Unit, `tests-unit/virtual.test.ts` |

## Keyboard: typeahead and spans

| Capability | Decision | Proved at |
|---|---|---|
| The typeahead jumps to the next matching node | APG | Unit (model), Interaction |
| One character jumps on, several refine | APG | Unit (model), Interaction |
| It wraps at the end | APG | Unit (model) |
| The buffer resets after a pause | APG | Interaction |
| It changes nothing but the active node | APG | Unit (model), Interaction |
| It copes with an active node that no longer exists | — | Unit (model) |
| Locked and unloaded nodes are valid targets | ADR-0005 | Unit (model) |
| Shift + arrow travels and ticks along | APG | Unit (model), Interaction |
| Shift + Space covers the span from the anchor | APG | Interaction |
| Ctrl + A fills and empties | APG | Unit (model), Interaction |
| A span **sets**; it does not toggle | — | Unit (model), Interaction |
| Spans leave out what may not be ticked | ADR-0005 | Unit (model) |
| "Full" means: ticking changed nothing further | ADR-0005 | Unit (model) |
| The anchor lies in the state | — | Unit (model) |
| The anchor is set by a single tick and travels along | — | Unit (interaction) |
| The anchor can be steered from outside | — | Unit (interaction) |
| Shift + arrow reports the active node **exactly once** | — | Unit (interaction) |
| The span brings exactly as many ticks as it covers | — | Interaction |
| The recommended APG model, not the alternative one | APG | Code |

## Not proved – expressly

* **Whether omitting `aria-multiselectable` beside `aria-checked` holds up.**
  The practice guideline describes the attribute in terms of `aria-selected`,
  which this tree does not use. The reading is defensible and **has not been
  checked with a real screen reader**. It cannot be closed by thinking – the
  thinking already stands in the code.
* **Whether `aria-disabled` is right on a node that can still be activated.**
  Locked is a statement about the box here; the node stays navigable and
  activatable. `aria-disabled` is the widespread convention, but its meaning
  ("not operable") is wider than what is meant here. Unchecked as well.
* **The loading indicator in a screenshot.** It is a state that passes of its own
  accord; the baseline shows the unloaded branch closed. It is proved in the
  interaction test, where it can be waited for.

## Deliberately open

* **Drag and drop**, **renaming in place**. Not tree behaviour but editing
  behaviour, with state machines of their own.
* **The tree loading by itself.** It reports that an unloaded branch was opened;
  fetching, retrying and cancelling stay with the caller (ADR-0005).
* **Searching inside unloaded branches.** Not possible, and no approximation for
  it.
* **Locked meaning not navigable**, and **inheriting locked** down a subtree.
  Whoever needs that writes it into their predicate.
* **`*` expanding the siblings of a level.** Listed as optional by the practice
  guideline and asked for by nobody.
* **The practice guideline's alternative multi-select model.** Incompatible with
  the Space key, which this tree has already assigned.
* **The view as a link.** Out by declaration.
* **Context menu and node actions.** The node's content is compositional.
* **Sorting.** The order is the caller's.
* **A flat source form with a parent reference.** Converting is a three-liner at
  the caller and needs no second contract.
