# Spec: One seam for the dismissable surface

Status: done

Delivered in three parts: the primitive with Menu and Combobox; MultiSelect, TableFilter and the four pickers; the barrel export.

Origin: `/improve-codebase-architecture` review, 23 Aug 2026 — candidate 01. Implements work package B.4 of the library handoff, with two amendments the review established.

Sequencing: run after `pure-logic-seams` and `picker-shared-modules`. See Further Notes.

---

## Problem Statement

Eleven modules in `@umriss/ui` put a floating surface on screen. Eight of them portal into the document body and compute their own position. Between them they contain fifty-six independent implementations of eight concerns: outside-click dismissal, Escape, positioning, focus restore, reposition-on-scroll, the aria triple, scroll locking, and exit animation.

The copies were made by hand and have drifted apart. Right-edge clamping exists in two of the four date pickers and not the other two — same directory, same stylesheet, a fix applied to half the siblings. Vertical flipping near the viewport edge exists only in the tooltip, so a date-time picker opened near the bottom of the window renders a four-hundred-pixel panel off-screen with no recovery. Focus restore exists in eight modules and is silently missing from the combobox. The same panel-entrance keyframe is defined five times in five stylesheets. Escape is bound to three different event targets, so nothing can stop anything else, and a menu opened inside a modal renders behind it because a portal cannot reach the dialog top layer.

The clamp that does exist is dead on first open: the position is computed before the panel mounts, so the measured width is never available and a hard-coded fallback is what actually paints.

Every one of these is a bug that can be fixed in one module and stay live in the other seven. There is no place to fix it once.

## Solution

One `Popover` module owns the behaviour of a dismissable anchored surface. Each caller keeps its own interface and its own domain logic, and stops carrying a copy of the plumbing.

Behind it sit two things: the element itself, which owns the portal, dismissal, focus restore, reposition and the aria wiring; and a pure geometry function that turns an anchor rectangle, a panel size and the viewport into a resolved position, including horizontal clamping and vertical flipping. The geometry is separated because it is the half that can be verified by calculation rather than by driving a browser.

Nine modules migrate onto it. The modal and the toast do not: the modal delegates its hard behaviour to the platform dialog element, which is the right adapter and should not be replaced, and the toast is a fixed-corner region with no anchor.

When this lands, the eight concerns have one owner. The fixes that currently exist in some copies apply everywhere, and the ones that exist nowhere become possible to add once.

## User Stories

1. As an end user, I want a panel opened near the right edge of the window to stay on screen, so that I can see and use all of it.
2. As an end user, I want a panel opened near the bottom of the window to flip above its trigger, so that a tall panel is not cut off by the viewport.
3. As an end user, I want a panel to stay correctly positioned the first time I open it, so that it does not appear misplaced until I scroll.
4. As an end user, I want keyboard focus to return to the trigger when I dismiss a panel with Escape, so that I do not lose my place in the page.
5. As an end user, I want every panel in the library to dismiss the same way, so that I do not have to learn each one separately.
6. As an end user, I want a menu opened inside a dialog to appear above the dialog, so that I can actually see what I opened.
7. As an end user relying on a screen reader, I want every trigger to announce its expanded state and the surface it controls consistently, so that the library behaves predictably.
8. As an end user who prefers reduced motion, I want one consistent answer to panel animation, so that the setting is honoured everywhere rather than in some modules.
9. As a library maintainer, I want one place to fix a positioning bug, so that a fix cannot land in two of four siblings and be forgotten in the others.
10. As a library maintainer, I want to assert the geometry by calculation, so that clamping and flipping are covered without a real browser and without a layout engine.
11. As a library maintainer, I want to assert clamping against the left and right viewport edges, so that a wide panel provably stays on screen.
12. As a library maintainer, I want to assert the flip rule against available space above and below the anchor, so that the decision is proven rather than eyeballed.
13. As a library maintainer, I want to assert that the geometry uses the panel's real measured size, so that the first-open fallback defect cannot return.
14. As a library maintainer, I want to assert dismissal on outside pointer input, so that the rule is covered once instead of eight times.
15. As a library maintainer, I want to assert that pointer input on the trigger or on a declared inside element does not dismiss, so that a clear button cannot close the panel it sits next to.
16. As a library maintainer, I want to assert Escape dismissal together with focus restore, so that the pair cannot drift apart.
17. As a library maintainer, I want to assert the aria wiring on the trigger and the surface, so that accessibility is verified rather than assumed.
18. As a library maintainer, I want one panel-entrance animation definition, so that five stylesheets cannot disagree.
19. As a library maintainer, I want stacking to come from a named scale rather than scattered literals, so that a new surface has an obvious correct value.
20. As a library maintainer, I want form elements rendered inside a panel to be insulated from the surrounding field context automatically, so that the trap that has already caused two defects becomes structurally impossible.
21. As a library maintainer, I want each migrated module to keep its existing props, so that the migration cannot break a consumer.
22. As a library maintainer, I want each migrated module to keep its existing panel class names, so that the screenshot baselines remain meaningful.
23. As a library maintainer, I want the tooltip to take only the geometry and keep its own dismissal policy, so that hide-on-scroll is preserved rather than silently converted to follow-on-scroll.
24. As a library maintainer, I want the modal to keep delegating to the platform dialog, so that a correct adapter is not replaced with a hand-written imitation.
25. As a library maintainer, I want the list of intended behaviour changes stated in advance, so that a reviewer can tell an improvement from a regression.
26. As an agent implementing the command palette, I want an existing surface primitive, so that I do not add a ninth copy of the plumbing. **Answered by contradiction, not fulfilled — see Further Notes.**
27. As an agent implementing free-text date entry, I want the picker panels already migrated, so that I am changing one kind of thing at a time.
28. As an agent implementing inline table-cell editing, I want an existing surface primitive, so that the editor popover inherits dismissal and focus behaviour for free.
29. As a maintainer reviewing this migration, I want each module migrated in its own reviewable step, so that a regression can be traced to one module.
30. As a consumer of `@umriss/ui`, I want panels to behave identically across the library, so that my application feels coherent without work on my part.

## Implementation Decisions

**Two seams, deliberately.** The element seam owns everything that needs a document: the portal, event listeners, focus restore, and the aria wiring. The geometry seam is a pure function taking an anchor rectangle, a panel size, viewport dimensions, a placement and an offset, and returning a resolved position plus whether it flipped. The split exists because a jsdom environment reports every element as zero-sized, so positioning cannot be exercised through the element — while events, focus and attributes work there normally. Both halves become testable instead of neither.

**The geometry function is internal.** It is not added to the package's public interface. The element is, following the handoff's plan for this work package.

**The element interface follows work package B.4 as written**, including the open state and its change callback, the anchor reference, additional references that count as inside, placement, offset, width behaviour, focus-restore opt-out, role, and label. That specification is sound and this spec does not relitigate it.

**Amendment one: the acceptance criterion changes.** The handoff requires this migration to produce no visible behaviour change. That is not achievable, because the nine modules currently disagree with each other; unifying them necessarily changes behaviour wherever a fix is absent today. The criterion becomes: no behaviour change other than the following, each of which is intended and must be reviewed deliberately.

- The single date picker and the date-time picker gain horizontal clamping at the right viewport edge, which they do not have today.
- All panel modules gain vertical flipping when there is insufficient space below the anchor. Only the tooltip has this today.
- The combobox gains focus restore on dismissal, which the other eight already have.
- Clamping begins working on first open. Today the position is computed before the panel mounts, so a hard-coded fallback width is always what paints.
- A surface anchored inside a dialog renders above that dialog rather than behind it.
- Dismissal by outside pointer input and dismissal by Escape stop diverging in what they reset.

**Amendment two: the primitive resets the field context inside its surface.** The handoff records, as a rule with no exceptions, that any form element rendered inside a panel must be wrapped so it does not inherit the surrounding field identity — and records that forgetting this has already caused two defects. A rule that has been broken twice is a locality failure. The primitive applies the reset itself, so the trap stops depending on memory.

**Stacking becomes a named scale.** The current literals are replaced by tokens with documented ordering. A surface whose anchor lies inside a dialog is portalled into that dialog rather than into the document body, which is what makes it render above rather than behind.

**Reposition policy is a property of the surface, not a global rule.** Panels follow their anchor on scroll and resize, as eight of them do today. The tooltip hides instead, as it does today. This is expressed as an explicit choice rather than an accident of which module you are reading.

**Repositioning is scheduled rather than synchronous.** Today each of eight copies sets state directly from every scroll event. The primitive coalesces to one update per frame.

**The panel entrance animation is defined once** and the five duplicate keyframe definitions are removed. Reduced-motion handling is unified on the existing global token rather than the current mixture of three mechanisms.

**Migrated modules keep their interfaces and their panel class names.** No public prop is added, removed or renamed by this work. Positioning, stacking and animation properties move out of the individual panel stylesheets into the primitive; everything else in those stylesheets stays.

**Migration order is one module per reviewable step**, beginning with the tooltip because it takes only the geometry, then the menu, combobox, multi-select and table filter, then the four pickers. The demo is checked after each.

**The modal and the toast are not migrated.** The modal's trap, restore, Escape and background inerting come from the platform dialog element, which is a thin adapter over a deep platform mechanism and is the correct shape already. The toast is a fixed-corner live region with no anchor.

## Testing Decisions

**What makes a good test here.** Geometry tests call the pure function with numbers and assert numbers. Behaviour tests render a surface, dispatch real events, and assert what a user or assistive technology would observe: whether the surface is present, where focus sits, what the trigger announces. No test asserts on internal class names, private helper names, or the shape of a position object as it passes through the element.

**Modules under test.** The geometry function directly, with no DOM. The element for dismissal, focus restore and aria, in jsdom. Migrated modules get no new unit tests; they are covered by their existing screenshot and interaction tests, which is the point of keeping their interfaces and class names unchanged.

**Prior art.** For the pure half, the charts package's arithmetic tests are the model — plain functions, plain assertions, no environment. For the element half there is no prior art in this repository, because nothing here has been tested with a rendering library before; the testing library is already a dependency and is currently imported by nothing. This work establishes that pattern, so keep it small and legible.

**Geometry coverage priorities.** Clamping at both horizontal edges; flipping when space below is insufficient and space above is sufficient; not flipping when neither is sufficient; correct behaviour when the panel is larger than the viewport; the measured-size path, so the first-open fallback defect cannot return.

**Behaviour coverage priorities.** Outside pointer input dismisses; pointer input on the trigger or a declared inside element does not; Escape dismisses and returns focus to the anchor; the trigger's expanded state and controlled-surface reference appear and disappear with the surface.

**Regression safety.** The existing screenshot baselines are the guard for the eight modules that keep their appearance. They must pass unchanged except where an intended behaviour change above alters what is rendered — those, and only those, may be regenerated, and each regeneration must be justified in the change description. The nine interaction tests must not lose a passing test; the two that are currently red for an unrelated checkbox reason stay red.

**Manual acceptance.** The handoff lists the checks for this work package — open position, clamping with a narrow window, following on scroll, outside click, Escape with focus return, no dismissal when clearing, no width jumping. Run them per migrated module. They remain necessary because layout is the one thing the automated tiers cannot assert.

## Out of Scope

- **The modal and the toast.** Neither migrates.
- **Scroll locking.** No module has it today and this work does not add it.
- **Exit animations for panels.** Panels unmount immediately today; this work does not add choreography.
- **The combobox's redundant third dismissal path** and other per-module internal inconsistencies, except where the shared behaviour above necessarily replaces them.
- **The multi-select's chip-fitting measurement**, which reads element widths and needs its own treatment.
- **Any change to a migrated module's public interface.**
- **Free-text date entry, the command palette, inline cell editing** — all later work packages that build on this one.
- **The picker value contract** and **the relocation of shared picker modules**, which are separate specs.
- **The checkbox interaction defect** keeping two interaction tests red.

## Further Notes

This is work package B.4 from the library handoff, which the review agreed should come before the packages that depend on it — free-text dates, the command palette, the segmented control, inline cell editing. The review's disagreement was about risk, not dependencies: this migration touches nine modules of behavioural code, and the package's current test surface cannot detect a regression in any of it. Hence the sequencing below.

Recommended order across the review's five candidates: pure-logic seams first, because it builds the test harness; then the relocation of shared picker modules, which is mechanical and settles the picker folder; then the picker value contract; then this. The table model is independent of all of them and can run in parallel at any point.

The reason this spec runs after the picker relocation is narrow but practical: both touch the same four picker files, and doing the mechanical move first means this migration edits a folder that has stopped changing shape underneath it.

Two decisions here are worth recording as architecture decisions once the repository has somewhere to record them: portalling into the nearest dialog ancestor rather than always into the document body, and treating reposition policy as a per-surface property rather than a global rule.

### Amendment, 1 Sep 2026: story 26 was answered by contradiction

`command-palette` shipped, and `CommandPalette` does **not** consume `Popover`.
This is recorded here rather than left to a future reader, because a delivered
spec carrying a story that reads as unmet is worse than one carrying a story
that was answered the other way.

The story assumed the palette was an anchored surface. It is not. It is a
centred window over the whole application, and the substance of `Popover` —
anchor geometry, edge clamping, vertical flipping — is precisely the part a
centred window has no use for. What the palette does need is the top layer and a
real focus trap, and this spec decided (story 24) that those stay with the
platform `<dialog>`. Putting the palette on `Popover` would have meant
re-implementing by hand the focus trap that `showModal()` gives away.

The prediction was wrong; the work was not. Nine modules did migrate onto the
primitive and the reasoning behind stories 21–25 and 27–30 stands unchanged.
What the palette did take from this spec is its rule rather than its code: the
entrance-and-exit routine of the `<dialog>` is now one internal hook
(`lib/dialogChoreographie.ts`) shared by `Modal` and `CommandPalette`, taken at
the second copy instead of the ninth — which is the lesson this spec exists to
teach.
