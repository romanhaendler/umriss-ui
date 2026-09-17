# Spec: The primitives the library still expects the application to build

Status: done

Origin: library inventory, 23 Aug 2026 — rank 1 of four. Not covered by the library handoff; every item here is absent from work packages B.1–B.15.

Sequencing: independent of everything else in flight. Nothing here touches an existing component, so it can run in parallel with the picker work and with `table-surface`. One consumer relationship runs forward: `table-surface` needs the removable tag from this spec for its filter strip.

---

## Problem Statement

The library is unusually complete where it is strong. Dense tables, four date and time pickers, a searchable select, a multi-select that measures its own width — all of it built to one concept and one token set. That strength makes the holes elsewhere harder to see, because nobody expects a library this thorough to be missing a text area.

It is. There is no multi-line text field of any kind. A form built from this library can take a name, a number, a date, a choice from a list and a yes-or-no tick, and then has to stop, because the moment it needs a comment or a description the application drops out of the library and writes a bare element with hand-rolled styling that approximates the paper-and-ink look. The same is true of a radio group: there is a checkbox for independent choices and a select for long lists, and nothing for the case in between, where three or four options each need a line of explanation and a segmented control would be the wrong shape.

There is nowhere to put a message that stays. Toasts are transient and live in a fixed corner; they are the right answer for "saved" and the wrong answer for "this view shows data as of the twelfth" or for a summary of what went wrong in a form. Applications therefore build their own coloured panel, and each one picks its own padding, its own tone mapping and its own icon.

Three things exist inside the library but are not available from it. A removable chip with a hover cross and arrow-key navigation is fully built — welded inside the multi-select, reachable only by using a multi-select. A hairline divider is re-declared as a private rule in module after module rather than existing beside the stack and the grid as the third layout primitive. And screen-reader-only text, which accessibility work needs constantly, has no helper at all, even though keyboard operation and accessibility attributes are declared part of the definition of done.

Finally, the concept the whole system rests on — typographic strictness, numbers in mono, micro-labels in spaced capitals — is expressed as global base styles and as private rules inside components, but not as anything an application can reach for. So the application invents its own heading scale, and the strictness frays exactly where the library stops.

The common shape: each of these is small, and each one, when missing, forces a consuming application to build an approximation that will not match. The cost is not the work; it is that the approximations accumulate until the application no longer looks like the library.

## Solution

Add eight small primitives, each following the five rules already written down for new components: forward the reference and the class name and the rest, support both controlled and uncontrolled use, treat keyboard operation and accessibility attributes as part of being finished, hold no business logic, and use tokens rather than raw values.

Everything here is additive. No existing component changes, no existing property is renamed, no existing markup moves. That is a deliberate constraint rather than an accident of scope: the handoff's standing instruction is that nothing existing may get worse, and this work has no reason to test it.

Two temptations are explicitly declined. The removable tag is built fresh rather than lifted out of the multi-select, and the multi-select keeps its own internal chip untouched; unifying them is a follow-up, not a precondition. And the arrow-key navigation the radio group needs is built the way the calendar, the menu, the tabs, the combobox and the multi-select each build it, rather than being extracted into a shared helper first. Both extractions are worth doing. Neither is worth doing in the same change that introduces eight new components, because both would turn a purely additive change into a refactor of the components the handoff protects most carefully.

## User Stories

1. As a developer building a form, I want a multi-line text field from the library, so that a comment field looks like the rest of the form instead of like a bare browser element.
2. As a developer building a form, I want the text field wired into the surrounding field context automatically, so that its label, its description and its invalid state work the way every other input does.
3. As a developer building a form, I want the text field to grow with its content up to a limit I set, so that a long entry does not become a two-line scroll box.
4. As a developer building a form, I want an optional remaining-character count, so that a length limit is visible before it is hit rather than after.
5. As a developer building a form, I want to choose whether the field can be resized by hand, so that a field inside a fixed panel cannot be dragged out of its layout.
6. As a developer building a form, I want a radio group, so that a small set of mutually exclusive options can each carry a line of explanation.
7. As a developer building a form, I want the radio group to move focus with the arrow keys and to expose exactly one stop in the tab order, so that it behaves the way the rest of the library behaves.
8. As a developer building a form, I want the radio group to skip disabled options while navigating, so that the keyboard cannot land somewhere the mouse cannot.
9. As a developer building a form, I want the radio group laid out in a row or a column, so that two short options and six long ones both read well.
10. As an end user filling in a form, I want an option's explanation to be read out with the option itself, so that I do not have to guess what the choice means.
11. As a developer building a page, I want a resting message component, so that a standing note about the data does not have to be a toast that disappears.
12. As a developer building a page, I want the message to carry the same four tones the status label already uses, so that a warning looks like a warning everywhere in the product.
13. As a developer building a page, I want the message to take a title, a body and an optional row of actions, so that "what happened" and "what to do about it" sit together.
14. As a developer building a page, I want to be able to make a message dismissible, so that an informational note can be cleared without leaving the page.
15. As an end user relying on a screen reader, I want an urgent message announced and a merely informational one not to interrupt me, so that the tone of the message reaches me too.
16. As a developer building a filter bar, I want a removable tag as its own component, so that I do not have to use a multi-select in order to get one.
17. As a developer building a filter bar, I want the tags to be reachable and removable with the keyboard, so that clearing a filter does not require a mouse.
18. As a developer laying out a page, I want a divider primitive beside the stack and the grid, so that a separating hairline is a token decision rather than a private rule I copy.
19. As a developer laying out a page, I want the divider available vertically and with an optional label, so that a toolbar separator and a labelled section break come from the same place.
20. As a developer working on accessibility, I want a helper for text that only a screen reader hears, so that I stop re-deriving the hiding technique in every project.
21. As a developer building a toolbar, I want a button group, so that related actions read as one control rather than as three buttons that happen to be adjacent.
22. As a developer building a toolbar, I want a split button, so that a main action can carry its variants without a separate menu button beside it.
23. As an end user, I want the split button's main action to be reachable in one click and its variants in two, so that the common case stays fast.
24. As a developer building any page, I want text, heading and link primitives bound to the type scale, so that the typographic hierarchy the design concept rests on does not have to be re-invented per application.
25. As a developer building any page, I want the link primitive to carry the accent treatment and the focus ring, so that links look interactive for the same reason everything else does.
26. As a designer reviewing the product, I want a new component to sit on the same control heights, radii and spacing steps as the existing ones, so that a form mixing old and new components has one rhythm.
27. As a designer reviewing the product, I want every new component correct in both themes, so that the dark theme does not lag a release behind.
28. As a designer reviewing the product, I want every new component to respect the reduced-motion setting, so that the library's own rule holds for its newest parts.
29. As a library maintainer, I want each new component represented in the demo, so that the living documentation stays complete and the smoke test covers the new surface.
30. As a library maintainer, I want the keyboard behaviour of the radio group, the split button and the tag proven by interaction tests, so that the parts with real behaviour are not guarded only by pictures.
31. As a library maintainer, I want the appearance of the purely presentational additions guarded by screenshots in both themes, so that a token change cannot silently break them.
32. As a library maintainer, I want this work to leave every existing component byte-identical, so that a regression in the pickers or the table cannot be attributed to it.
33. As a developer adopting the library, I want the form layer to be complete enough that no form needs a hand-built field, so that the library's coverage is something I can rely on rather than check.

## Implementation Decisions

**Everything is a new component; nothing existing is modified.** This is the defining constraint. If a change to an existing component appears necessary, it is a signal that the new component is being shaped wrongly, and the reasonable response is to note it and shape the new component differently.

**The multi-line text field** binds to the surrounding field context the way the single-line input does, taking its identifier, its description reference and its invalid state from the context unless given explicitly. It carries the two-size convention. It supports optional growth with its content up to a caller-supplied maximum, an optional remaining-character indicator tied to the native length limit, and explicit control over whether the browser's resize handle is offered. It does not get a clearing cross; the cross is a single-line gesture and would sit wrongly against a growing box.

**The radio group** owns the selected value and renders its options from a description that carries a value, a label, an optional explanation line and an optional disabled flag. It exposes exactly one tab stop, moves the selection with the arrow keys, wraps at the ends, skips disabled options and lays out in a row or a column. The explanation line is associated with its option so that assistive technology reads them together. Its keyboard handling is built inside the component, matching the pattern the other components use; a shared helper was considered and declined for this change.

**The resting message** takes a tone from the same four-way vocabulary the status label uses, plus the neutral default, and renders a title, a body and an optional action row. It can be made dismissible. Its accessibility role follows its tone rather than being a caller decision: the two urgent tones announce assertively, the informational ones do not interrupt. The palette comes from the existing subtle semantic surfaces, so that a warning message and a warning badge are visibly the same warning.

**The removable tag** is a standalone element with a label, an optional removal action and an optional tone. When rendered in a group it participates in arrow-key navigation with a single tab stop, and the removal action is reachable by keyboard. The multi-select's internal chip is left alone. Unifying the two is a sensible follow-up and is out of scope here.

**The divider** joins the stack and the grid as a layout primitive: horizontal or vertical, drawn from the hairline tokens, with an optional centred label. Existing private hairline rules are not migrated onto it in this change.

**The screen-reader-only helper** hides content visually while leaving it available to assistive technology, with the usual provision that it becomes visible when it receives focus, so that a skip link works.

**The button group** joins adjacent buttons into one control, squaring the interior corners and collapsing the seam between them into a single hairline. **The split button** composes it: a main action and a trigger that opens the existing menu through the existing popover seam. It does not re-implement anchoring, dismissal or focus return; if it needs behaviour the popover seam does not offer, that is a finding about the seam, not a licence to rebuild it.

**The typographic primitives** are deliberately narrow. They expose only what the token scale already defines — the size steps, the three weights, the three tracking values, the two line heights and the text colours — and refuse arbitrary values. A heading takes a level for its semantics and a size for its appearance, and the two are independent, so that a visually small heading can still be the page's second-level heading. The link primitive carries the accent colour and the focus treatment.

**Sizes follow the existing convention** of a small and a medium variant at the established control heights and radii. The select's historic differently-named size property is not touched and is not used as a precedent.

**Every new component gets a demo tile** in the living documentation, with a header comment on the component explaining its operating logic in a few lines, following the existing pattern.

**The toggle switch is not part of this work.** It belongs to the same foundation and should be delivered alongside, but it is already specified in detail in work package B.6 of the handoff, and duplicating that specification here would create two sources of truth. Treat B.6 as a sibling delivery.

## Testing Decisions

**What makes a good test here.** These components are mostly presentation with a little keyboard behaviour. A good test asserts what a user can observe — that an arrow key moves the selection, that a removal action removes, that a menu opens under its trigger — and never asserts on class names, element nesting or internal state. Where a component has no behaviour beyond rendering, it does not get a behavioural test; it gets a picture.

**The seam is the demo.** Adding a tile is what puts a new component under test, because the existing smoke test renders the demo and the existing screenshot suite photographs each tile in both themes. This is the highest available seam and no new one is needed. Two consequences follow: a tile must exercise the component's states rather than showing one happy example, and new baselines must be reviewed rather than accepted on sight.

**Interaction tests, for the three components with real behaviour.** The radio group: arrow keys move the selection, the group holds one tab stop, disabled options are skipped, wrapping works at both ends. The split button: the main action fires without opening anything, the trigger opens the menu, dismissal and focus return behave as the popover seam promises. The tag: the removal action fires by mouse and by keyboard, and arrow keys move between tags in a group. These extend the existing interaction suite.

**Screenshots, for the rest.** The message in all five tones, dismissible and not; the text field empty, filled, grown, invalid and with a character count; the divider in both orientations and with a label; the button group; the typographic scale. Both themes.

**Unit tests, only where pure logic exists.** There is little: the character-count arithmetic, the growth clamp against the maximum, and the tone-to-role mapping of the message. Test those directly and do not manufacture unit tests for the rest — a shallow test of a presentational component is a maintenance cost with no benefit.

**Prior art.** The existing popover and tooltip tests show how a component-level assertion is written in this package; the existing interaction suite shows how keyboard behaviour is driven. Follow whichever the case fits.

**Fixture data belongs in the test.** Do not assert against strings taken from the demo's content; that coupling is already known to break the suite when demo content is edited.

## Out of Scope

- **The toggle switch**, specified in handoff work package B.6 and delivered as a sibling.
- **The keyboard-key label**, specified in work package B.9.
- **Rebuilding the multi-select on the new tag**, or migrating existing private hairline rules onto the new divider. Both are follow-ups; this change touches nothing existing.
- **A shared arrow-key navigation helper**, considered and declined for this change.
- **Form validation and submission**, which is work package B.12 and builds on this foundation rather than being part of it.
- **A shared icon set.** The new components draw the few glyphs they need inline, as the existing ones do. Consolidating glyphs belongs to the package-consumability work.
- **A file upload field, a colour picker, a rating control.** None is a gap a data-dense administrative interface currently has.
- **Any change to the pickers, the table, the modal, the toast or the menu.**

## Further Notes

The eight items here are small individually and the temptation will be to bundle them into one change. Resist it: they share no code, and delivering them one at a time keeps each set of screenshot baselines reviewable. A reasonable order is the text field first, because it is the most conspicuous absence and the most likely to be needed before this work finishes, then the radio group, then the message, then the four small ones, then the typographic primitives last, because they are the ones most likely to attract debate about scope.

The typographic primitives deserve a note of caution. They are the only item here that constrains rather than adds, and a permissive version of them — one that accepts any size and any weight — would be worse than not having them, because it would legitimise the drift it exists to prevent. If the narrow version turns out to be too narrow in practice, widening it later is easy; narrowing it later is not.

The terms this introduces — a resting message as distinct from a transient one, a tag as distinct from a status badge, a typographic primitive — are new vocabulary for the project and belong in a glossary when one exists.
