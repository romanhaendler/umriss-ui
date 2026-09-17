# Spec: A command palette that feels like the system's

Status: done

Origin: `/grill-with-docs` session, 31 Aug 2026. The brief: lift the demo shell's jump palette into a library component, and make it "as convincing as the search on macOS or iPadOS". Clarified mid-session: the goal is the look and feel, not the functional reach.

Sequencing: `pure-logic-seams` and `popover-seam` are both delivered; this is the work package they both named as a dependant. Nothing blocks it.

Tickets: `.scratch/command-palette/issues/` — eight, all `done`.
Glossary: five terms added to `CONTEXT.md` under **Finding**.
ADR: `docs/adr/0012-a-translucent-material-needs-a-floor.md`.

Prose is English per `CONTEXT.md`, identifiers German.

---

## Problem Statement

The demo shell has a jump palette. It opens on ⌘K or `/`, filters twenty-one entries by substring, and moves a highlight with the arrow keys. It is about a hundred and fifteen lines living inside the shell module, and it is the only interactive thing on the page that the library does not ship.

Two problems, and they are different in kind.

The first is that it is in the wrong place. It is a component by every measure the library uses — it has state, a keyboard protocol, an aria contract, an empty state and a dismissal policy — and it is the single most-used control in the demo. It has no unit test, no module boundary and no way for a consumer of `@umriss/ui` to have one. Three earlier specs anticipated it by name as a later work package and built the foundations it was supposed to land on.

The second is that it does not feel the way the maintainer wants it to feel. Set it beside Spotlight and the gap is not one thing, it is eight, and none of them is functionality:

- It matches by substring. Type `dtp` and nothing comes back, though `DateTimePicker` is right there. Type `picker` and four entries come back in outline order, with no notion that one of them is a better answer than the others.
- Nothing moves. It appears hard, at a fixed size, and it disappears hard.
- It is full before you have typed anything. All twenty-one entries stand there at rest, so the list can only ever shrink — the growth that makes the system palette feel alive is impossible by construction.
- It is a form. Twenty-eight-pixel rows in the small type size, a name on the left and a group name on the right, opaque white, twelve-pixel corners. It reads as a select panel that happens to be centred, not as a search window.
- The material is wrong and cannot be right, because the token set has no translucency and no radius above twelve pixels.
- Nothing explains why a result is a result once matching stops being literal.
- There is no notion of a best answer, no grouping, no icons.
- It has no pointer behaviour at all, which is the one thing it currently gets right by accident and would lose the moment rows became interactive.

The maintainer can describe the target in one word — Spotlight — and the library has no vocabulary, no tokens and no seam that would get there.

## Solution

Ship a `CommandPalette` in `@umriss/ui`, and rewire the demo shell onto it as its first consumer.

Functionally it stays small, deliberately: one list of items handed in as a prop, each of which may carry an action. No sources, no asynchrony, no preview pane, no calculator. Everything that was cut is functional reach, and none of it is visible.

What it gains is the eight things above:

**A real matcher.** A pure module scores a query against a name by subsequence rather than substring, and returns both a rank and the character runs that matched. `dtp` finds `DateTimePicker`; a hit at a word boundary outranks one mid-word; a contiguous run outranks a scattered one; a short name outranks a long one at equal quality. The matched characters are then drawn in the accent colour, so a fuzzy result looks reasoned rather than random.

**A choreography.** The panel enters with a short scale-and-fade, grows and shrinks as the result count changes, and leaves instantly. Reduced motion collapses all three to a jump.

**An empty rest state.** Before a character is typed the panel is only the field — which is what makes the growth visible at all.

**A result-list anatomy.** Taller rows, the name in a larger step of the type scale, an optional icon slot, the group in small secondary type on the right, a full-width highlight, and group headers the arrow keys pass over.

**A material.** The token set grows by one radius step and one translucent surface, introduced properly in both themes, so the panel can be a floating pane over a blurred page rather than a white box. This is a library-wide styling decision and gets an ADR.

**A pointer policy.** The keyboard owns the highlight until the pointer actually moves, so that a list re-rendering under a resting cursor cannot steal the row the arrow keys had chosen.

The demo shell deletes its own copy and gains an exception, written down, to its own rule about not being built from the parts it exhibits.

## User Stories

### Finding

1. As a user of the palette, I want to type an abbreviation like `dtp` and find `DateTimePicker`, so that I do not have to remember how a name is spelled in full.
2. As a user of the palette, I want a match at the start of a word to rank above a match in the middle of one, so that the obvious answer is the first answer.
3. As a user of the palette, I want a contiguous run of matched characters to rank above a scattered one, so that closer matches win.
4. As a user of the palette, I want a shorter name to win over a longer one at equal match quality, so that `Table` beats `TableFilterStrip` for the query `table`.
5. As a user of the palette, I want matching to ignore case and to ignore leading and trailing whitespace, so that a hurried keystroke does not cost me a result.
6. As a user of the palette, I want the group name to be searchable alongside the item name, so that typing `struktur` shows me what lives under that heading.
7. As a user of the palette, I want the characters my query matched to be visibly marked in the result, so that I can see why an unexpected result is there.
8. As a user of the palette, I want results to appear on the same keystroke I typed them, so that the list never lags behind the field.
9. As a user of the palette, I want the list never to flicker or reflow between keystrokes, so that typing fast feels continuous.
10. As a user of the palette, I want an empty query to show nothing rather than everything, so that the window is a search field and not a menu.
11. As a user of the palette, I want a query with no results to say so plainly in one line, so that I know the search ran and found nothing.
12. As a consumer of the library, I want to hand an item a weight that feeds into its rank, so that I can implement frequency or recency myself without the library keeping a memory of its own.

### Moving

13. As a user of the palette, I want the arrow keys to move the highlight down and up, so that I never have to reach for the mouse.
14. As a user of the palette, I want the highlight to wrap at both ends, so that reaching the last result and pressing down returns me to the first.
15. As a user of the palette, I want group headers to be skipped by the arrow keys, so that pressing down always lands on something choosable.
16. As a user of the palette, I want the highlighted row scrolled into view as I move, so that keyboard navigation never leaves the highlight off-screen.
17. As a user of the palette, I want Enter to choose the highlighted result, so that finding and choosing are one gesture.
18. As a user of the palette, I want the highlight to stay on the same result while I keep typing, as long as that result still matches, so that refining a query does not lose the thing I had already found.
19. As a user of the palette, I want the highlight to return to the first result when the one I had is gone, so that it is never on nothing.
20. As a user of the palette, I want Escape to close the window, so that I can back out without choosing.
21. As a user of the palette, I want focus returned to whatever I was on before opening, so that I do not lose my place on the page.
22. As a user of the palette, I want a click outside the panel to close it, so that dismissing works the way every other surface in the library works.
23. As a user of the palette, I want the row under the pointer to highlight when I move the mouse, so that the window is usable without the keyboard.
24. As a user of the palette, I want the pointer **not** to steal the highlight while I am typing, so that a list shrinking under a resting cursor cannot move my selection out from under me.
25. As a user of the palette, I want a click on a row to choose it, so that pointer use is a single gesture too.

### Feeling

26. As a user of the palette, I want it to appear with a brief scale-and-fade rather than a hard cut, so that it reads as arriving rather than as a page repaint.
27. As a user of the palette, I want the panel to grow as results appear and shrink as they disappear, so that the window responds to what I type rather than standing at a fixed height.
28. As a user of the palette, I want it to close instantly with no exit animation, so that dismissing feels light rather than reluctant.
29. As a user of the palette who prefers reduced motion, I want every one of those three to become an instant change, so that the setting is honoured rather than softened.
30. As a user of the palette, I want the panel to float on a translucent material over a dimmed page, so that it reads as a layer above the application rather than a card inside it.
31. As a user of the palette, I want a rounded pane larger than the library's card radius, so that it looks like a system window rather than a form panel.
32. As a user of the palette, I want the query in large light type, so that the field is the window rather than a control inside it.
33. As a user of the palette, I want result rows tall enough to scan, so that the list reads as results rather than as options.
34. As a user of the palette, I want results grouped under quiet headers, so that a list of fifteen has structure without needing to be read in full.
35. As a user of the palette, I want an icon slot on each row for consumers that have icons, so that the row anatomy does not have to change later to gain one.
36. As a user of the palette, I want a footer that names the three keys, so that the keyboard protocol is discoverable on first use.
37. As a user of the palette on a dark theme, I want the material, the dimming and the highlight to be resolved for dark as deliberately as for light, so that neither theme is the afterthought.
38. As a user of the palette, I want the list to cap its height and scroll rather than growing without limit, so that a long result set cannot push the window past the viewport.

### Consuming

39. As a consumer of `@umriss/ui`, I want a command palette I can hand a list of items to, so that I do not write the ninth copy of this control.
40. As a consumer of `@umriss/ui`, I want the palette controlled by an `open` prop like the modal, so that opening it is my decision and my shortcut.
41. As a consumer of `@umriss/ui`, I want a ready-made hook for the ⌘K/Ctrl+K and `/` bindings, including the rule that `/` must not fire while a text field has focus, so that I do not re-derive that guard and get it wrong.
42. As a consumer of `@umriss/ui`, I want an item to be able to carry an action rather than only a destination, so that the same window can run a command and jump to a place.
43. As a consumer of `@umriss/ui`, I want every user-facing string to come from the existing `Wortlaut` seam, so that I can rewrite the copy without forking the component.
44. As a consumer of `@umriss/ui`, I want the palette to use the library's tokens exclusively, so that it inherits my theme rather than imposing one.
45. As a consumer of `@umriss/ui`, I want the new material and radius tokens to be public, so that my own overlays can match the palette instead of approximating it.

### Accessibility

46. As a user relying on a screen reader, I want the field announced as a combobox controlling a listbox, so that the window is described by a pattern I already know.
47. As a user relying on a screen reader, I want the highlighted result announced as I move through the list, so that arrow keys tell me where I am.
48. As a user relying on a screen reader, I want group headers associated with the results beneath them, so that structure is heard and not only seen.
49. As a user relying on a screen reader, I want the window announced as a modal dialog with a name, so that I know the rest of the page is unavailable.
50. As a user relying on a screen reader, I want the result count announced when it changes, so that I know typing narrowed the list without having to arrow through it.
51. As a keyboard-only user, I want focus trapped inside the window while it is open, so that Tab cannot take me to the page behind it.
52. As a maintainer, I want the open palette to pass the same axe check the rest of the demo passes, so that the new component is held to the standard already in force.

### Maintaining

53. As a library maintainer, I want the matcher to be a pure module taking a query and a name and returning a rank and match spans, so that ranking is proven by calculation and not by typing into a browser.
54. As a library maintainer, I want the tie-break rules asserted explicitly, so that a change to the scoring formula fails a test rather than quietly reordering results.
55. As a library maintainer, I want the keyboard protocol asserted in jsdom, so that wrap-around, header skipping and highlight stability are covered without a browser.
56. As a library maintainer, I want the pointer-versus-keyboard rule asserted in a real browser, so that the one rule jsdom cannot express is still covered.
57. As a library maintainer, I want the demo shell to lose its private copy entirely, so that there is exactly one palette in this repo.
58. As a library maintainer, I want the shell's rule about not being built from the exhibited parts to gain a written exception rather than a silent one, so that the next reader is not left guessing whether it was an oversight.
59. As a library maintainer, I want the existing Playwright tests for the palette to keep passing or to be changed with a stated reason, so that an intended behaviour change is distinguishable from a regression.
60. As a library maintainer, I want the modal and the palette to share one dialog entrance-and-exit routine, so that the exit timing cannot drift apart between them.
61. As a library maintainer, I want the limits of the contrast test against a translucent surface stated in advance, so that nobody later assumes a check exists that cannot exist.

## Implementation Decisions

### The domain model, and one collision to resolve

`CONTEXT.md` already binds **Hit (Treffer)** to chart hit-testing: the data point a pointer position resolves to within a series. The demo's palette calls its search results `treffer`. Two meanings, one grep, in a workspace whose glossary exists precisely to prevent that. The palette gives way, because the charts meaning is older, narrower and load-bearing.

Four terms enter the glossary:

- **Candidate (Kandidat)** — one thing the palette can find. It is the caller's data: a name, optionally a group, an icon and a weight. It is not a **Node** and not an **Option**; those belong to the tree and to select lists.
- **Find (Fund)** — a candidate that matched the current query, together with its rank and its match spans. Derived on every keystroke, never stored. This is the word `Treffer` would have been.
- **Match span (Fundstelle)** — a half-open run of character indices in a candidate's name that the query matched. It exists so that the renderer can mark them; it is the reason the matcher returns a structure and not a boolean.
- **Rank (Rang)** — how well a candidate matches, deciding order among finds. Not **Verdict (Bewertung)**, which is what a value is against its limits; not **Severity (Stufe)**; not **Priority (Priorität)**. Three scales already exist in this glossary and none of them is this one.

The existing `Wortlaut` key `keineTreffer` stays as it is. It belongs to the combobox and the multi-select, and it is a user-facing German sentence rather than an identifier for the concept. The rule the glossary states is about what to grep for in code.

### The matcher

A new pure module, `suche`, sitting beside `optionen` in the library's shared logic, following the pattern `pure-logic-seams` established: inputs as arguments, results returned, no React.

It exposes finding over a list, and behind it the scoring of a single name. The shapes, which encode the decisions more exactly than prose:

```ts
interface Fundstelle {
  von: number;  // Index in `name`, einschliesslich
  bis: number;  // Index in `name`, ausschliesslich
}

interface Fund<K> {
  kandidat: K;
  rang: number;
  fundstellen: readonly Fundstelle[];
}
```

Scoring is subsequence matching with a deterministic bonus-and-penalty formula. The rules, in the order they matter:

- Every character of the query must appear in the name, in order. Otherwise there is no find at all.
- A character matched at a word boundary — position zero, after a separator, or at a lower-to-upper case change — scores higher than one matched mid-word. This is what makes `dtp` find `DateTimePicker`.
- A character matched immediately after the previous match scores higher than one matched after a skip.
- Unmatched characters cost, so a shorter name outranks a longer one at equal match quality.
- The candidate's optional weight is added last. The library never derives or persists it.
- Ties break by the candidate's incoming order, so the outline order still shows through where scoring has nothing to say.

Matching runs over the name and the group name. A find carries spans only for the name; a group-only match ranks lowest of all finds and marks nothing.

The formula is an internal decision, not part of the public interface. What is public is the ordering behaviour, and that is what the tests assert.

### The component

`CommandPalette`, exported from the package barrel. Public interface in English like every other component, internals in German like every other component — the `ComboboxOption` / `AuswahlOption` precedent.

It is **controlled**: `open` and `onClose`, exactly as the modal. Opening is the consumer's decision. Alongside it ships a hook that binds ⌘K/Ctrl+K and `/` and carries the guard the demo already wrote by hand — `/` must not open the palette while focus is in an input, a textarea or a contenteditable. That guard is the kind of detail every consumer would otherwise rediscover through a bug report.

An item carries an id, a label, an optional group, an optional icon and an optional weight. Choosing emits the id; whether that navigates or runs a command is the consumer's business. This is what keeps "places" and "commands" one concept rather than two.

### The surface

The palette owns a native `<dialog>` and calls `showModal()`. Not `Popover`, despite story 26 of `popover-seam` naming the command palette as a reason to build it. That story is answered by this spec rather than fulfilled: `Popover` is the primitive for an **anchored** surface, and its whole substance — anchor geometry, edge clamping, vertical flipping — is exactly what a centred, unanchored window does not use. What the palette needs instead is the top layer, a real focus trap and Escape, and `popover-seam` itself decided those stay with the platform dialog. Using `Popover` here would mean re-implementing the focus trap that `showModal()` gives for free.

It is not built on `Modal` either: the modal is a sheet with a header, a body, a footer and three sizes, and parameterising it into a second shape would make one component carry two anatomies.

What the two **do** share is the entrance-and-exit routine — set `showModal()` on open, run the exit choreography, then close for real, and skip the choreography under reduced motion. That is extracted into one internal hook and used by both. Leaving a second copy would repeat the mistake `popover-seam` was written to fix, at the exact scale at which it starts: the second copy.

### The tokens

Two additions to `tokens.css`, in both themes:

- A radius step above `--u-radius-lg`, for the pane.
- A translucent material: a surface fill with alpha plus the blur that goes under it. Dark gets its own values rather than an inversion.

The page-dimming behind the panel becomes a token too. It exists today as an inline `color-mix` in the demo stylesheet, which is precisely the local exception this spec refuses to add more of.

The type scale needs nothing: `--u-text-2xl` at 1.5rem is the field size. The motion scale needs nothing: `--u-duration-fast` at 140ms is the entrance, and it already collapses to zero under reduced motion.

A translucent overlay material is a library-wide styling decision, hard to walk back once overlays adopt it, and surprising to a future reader who finds a blur in a token file for industrial screens. **It has an ADR**, 0012, written with this spec rather than after the fact. The trade-off it records: legibility over an arbitrary background versus the layered look, and why the panel keeps a high enough alpha that text never depends on what is behind it. If the visual check in ticket 02 kills the material, that ADR is deleted rather than softened.

### The motion

Three separate behaviours, and they are not one setting:

- **Entrance**: opacity 0→1 with scale 0.96→1 over `--u-duration-fast`, on `--u-ease-out`.
- **Growth**: the list's height animates as the find count changes. The panel is only the field at rest, so the first keystroke is a growth from nothing — the motion the whole choreography exists for.
- **Exit**: none. The dialog closes on the frame it is dismissed.

Row-level stagger is rejected outright, not merely omitted: it photographs well and types badly, because every keystroke restarts it.

Under reduced motion all three become instant, through the existing token collapse and `prefersReducedMotion`.

### The anatomy

Panel width `min(680px, 100vw - 32px)`, held in the upper third as today. Field height around 56px, `--u-text-2xl`, no border, no focus ring — the pane is the focus indicator.

Rows around 38px: optional icon, label in `--u-text-md`, group right-aligned in `--u-text-xs` secondary. Full-width highlight at the new radius. Matched characters in the accent colour.

Group headers in small secondary type, not focusable, associated with their group for assistive technology, skipped by the arrow keys.

The list caps at roughly eight rows and then scrolls; the highlighted row is kept in view with `block: "nearest"`, the combobox's existing behaviour.

The footer keeps the three key hints the demo already shows.

### The pointer rule

The highlight has one owner at a time. The keyboard takes ownership on any arrow key and on any change to the query. The pointer takes ownership only on a genuine `pointermove` — not on `pointerenter`, which fires when the list re-renders beneath a stationary cursor. This is the difference between a palette that works and one that feels right, and it is one flag.

### The demo

The shell's private `Palette` function is deleted. The shell renders `CommandPalette`, fed from `ALLE_EINTRAEGE`, and keeps its own `gehZu`.

Its head comment carries a rule: the shell is deliberately not built from the parts it exhibits, so that a fault in an exhibit cannot take the surroundings down with it. This spec breaks that rule once, and says so there, with the reason: the palette's quality is only legible in daily use, the shell is the only place in this repo where it is used daily, and a matcher that feels wrong is invisible in a demo tile and obvious by the fiftieth ⌘K.

The palette also gains a tile of its own, so that it is photographed and axe-checked like every other component. The tile shows the panel; the shell shows the window.

## Testing Decisions

A good test here asserts what a user of the palette can observe: the order results come back in, what the keyboard does, what is announced. It does not assert the scoring formula's intermediate numbers, the class names, or which effect ran.

**The matcher, in vitest.** The highest-value seam and the only new one. Prior art: `optionen.test.ts` and `raster.test.ts` — pure functions, called directly, no mounting. What is asserted:

- `dtp` finds `DateTimePicker` and `abc` does not.
- Word-boundary hits outrank mid-word hits, on a fixture where nothing else differs.
- Contiguous runs outrank scattered ones.
- The shorter of two equally-matched names wins.
- Case and surrounding whitespace do not change the outcome.
- An empty query returns nothing — the rest-state rule, asserted where it is cheap rather than through a rendered panel.
- Match spans are half-open, in order, non-overlapping, and index the name they came from.
- A group-only match produces a find with no spans, ranked below every name match.
- Weight shifts rank and nothing else.
- Ties fall back to incoming order.

**The component, in vitest with Testing Library.** Prior art: `baumBedienung.test.tsx` for keyboard, `popover.test.tsx` for dismissal and focus. What is asserted:

- Arrow keys move the highlight and wrap at both ends.
- Group headers are skipped.
- The highlight stays on the same item while typing narrows the list, and falls back to the first when that item is gone.
- Enter emits the highlighted item's id; Escape closes and restores focus.
- Aria: combobox on the field, listbox on the list, `aria-activedescendant` following the highlight, an accessible name on the dialog, headers associated with their groups.
- The empty rest state renders no options, and a query with no finds renders the empty line.
- Every string comes from `Wortlaut` — asserted by overriding one and reading it back, as `sprache.test.tsx` already does.

**The browser, in Playwright.** Prior art: `funktionen-huelle.spec.ts`, which already covers the palette in four tests. Those four stay and are amended where behaviour intentionally changed — the rest state means the pre-typing assertions change, and that change is intended and stated. Added:

- The pointer does not take the highlight while typing under a resting cursor. This is the rule jsdom cannot express, because it turns on the difference between `pointermove` and `pointerenter` under a re-render.
- The panel is only the field before typing and taller after.
- The open palette passes axe, as it does today.

**Tokens, in vitest, with a stated hole.** `kontrast.test.ts` reads hex declarations out of `tokens.css` and computes ratios. The new radius is irrelevant to it. The new material is **not checkable by it**, in either direction: it is not a hex value, and its effective background depends on what happens to be behind the panel. The honest response is not to fake a value but to record the limit — the ADR states the alpha floor chosen so that text contrast never depends on the backdrop, and the contrast test is extended to check the label colour against the **opaque** fallback beneath the material. That is a real check of a real worst case, rather than a green tick on an unmeasurable one.

**Screenshots.** The palette tile enters `kacheln.ts` through the outline, as everything does. Whether the translucent panel yields a stable baseline across runs is an open risk: blur is a rendering path that has historically differed between machines even on one platform. If the baseline proves unstable, the tile shows the panel over a flat backdrop, and the material is verified in the shell test by computed style rather than by pixels. This is called out in advance so that a flaky baseline is a known outcome and not a surprise.

## Out of Scope

- **Sources, asynchrony, loading states, race handling.** The palette takes one list. This is the largest thing cut and the reason the rest fits.
- **A preview pane.** Characteristic of Spotlight, and it needs result kinds the palette will not have.
- **A "Top Hit" block.** Ranking earns that promotion once there are real sources; with twenty-one items from one list, it would be a claim the scoring cannot back.
- **Frequency or recency learning, and any persistence.** The weight field is the hook; the memory belongs to the consumer.
- **Search aliases or keyword fields on an item.** Cheap and genuinely useful, but it was not decided in the grilling and is not needed for the look and feel. A later addition, and a compatible one.
- **Calculator, unit conversion, definitions** — every Spotlight behaviour that is a source rather than a surface.
- **Icons for the demo's own twenty-one entries.** The row offers the slot; the demo leaves it empty. A column of twenty-one identical placeholder glyphs looks worse than no column.
- **A second shortcut scheme, or making the shortcut configurable beyond the shipped hook.**
- **Migrating other overlays onto the new material.** The tokens become available; adopting them elsewhere is a separate decision with its own screenshot consequences.

## Further Notes

**On `popover-seam` story 26.** That spec listed "an agent implementing the command palette, I want an existing surface primitive, so that I do not add a ninth copy of the plumbing" as a reason to build `Popover`. This spec does not fulfil it. The reasoning is in Implementation Decisions and is worth restating plainly: the story assumed the palette was an anchored surface, and it is not. The `Popover` work was still right — nine modules did migrate onto it — but this consumer was mis-predicted. Whoever implements this should update that spec's record rather than leave a story standing that was answered by contradiction.

**On the shape of the risk.** Almost none of this is functionally hard. The matcher is a few dozen lines of arithmetic, and the component is smaller than `Combobox`. The risk is concentrated in two places: whether a translucent material can be introduced to this token set without looking foreign next to the rest of the library, and whether the screenshot suite can hold it steady. Both are visual questions that will be settled by looking, not by testing, and both should be looked at early rather than at the end.

**On what "as good as macOS" turned out to mean.** The brief was about look and feel rather than reach, and the work that followed from it splits roughly in half. The visible half — material, radius, type size, row height, motion, group headers — is the smaller half. The half that reads as polish and is actually behaviour — subsequence ranking, match marking, highlight stability across keystrokes, and the pointer rule — is the larger one. Anyone implementing this who runs short of time should cut from the first list, not the second. A palette with the old material and the new matcher feels close. The reverse does not.

---

## Delivery notes

Written at delivery, not planned. They belong to the record because each one is
a place where the spec above is not quite what shipped.

**Stories 36 and 50 contradict each other, and 50 won.** Story 36 wants the
footer "discoverable on first use"; story 50 and ticket 05 want the panel to be
"only the field" at rest, and ticket 05's acceptance says so as a measurable
height. A footer standing at rest is not "only the field". The rest state wins,
because it is the thing that makes the growth visible at all, and the growth is
the motion this whole package exists for. The footer appears with the first
keystroke — before anyone needs any of the three keys it names. A test names the
conflict at the point of the decision rather than leaving a reader to find it.

**The length cost is 0.5 and not 1.** Found by running the matcher against the
demo's real list: at 1, `dtp` ranked `DateRangePicker` (two word boundaries, 15
characters) above `DatePicker und DateTimePicker` (three word boundaries, 29
characters), because fourteen characters of length outweighed a whole word
boundary. The cost is meant to decide between names of equal quality, not to
overturn a real difference in quality. Pinned by its own test.

**The material's numbers were changed by looking.** The first set (scrim 0.38,
alpha 0.78) was wrong in the light theme: the scrim flattened the page to a mid
grey and the panel landed above it at roughly `#e9e9e9`, so instead of a window
over the application there was a grey slab inside it. Readable throughout — the
floor held — but it looked like a fault. Now scrim 0.30 and alpha 0.86: measured
off the checked-in baseline, the page sits at `#b6b6b6` and the pane at
`#f2f2f3`.

**The tile shows the trigger, not the panel.** The spec says "the tile shows the
panel". It cannot: the screenshot suite photographs `[data-kachel="…"]`, and the
window lives in the top layer, outside every tile. The tile therefore shows the
trigger, exactly as the Modal/ConfirmDialog/Toast tile does, and the window has
its own full-viewport baseline outside the tile loop. Both themes, both checked
in. The blur turned out to be stable across repeated runs, so the fallback
ticket 08 held in reserve was not needed; the computed-style check in the shell
test exists anyway, because it survives the baseline being deleted.

**`Popover` story 26 was answered by contradiction.** Recorded in that spec.

---

## Amendment, 1 Sep 2026: the rest state became the caller's decision

Story 10 — "an empty query to show nothing rather than everything, so that the
window is a search field and not a menu" — is now the **default** rather than
the rule. `CommandPalette` takes an optional `restingItems`, and what stands
there before a character is typed is the caller's list.

Asked for by the maintainer after using it, and it fits the line this spec
already takes elsewhere: story 12 gives the caller `weight` "so that I can
implement frequency or recency myself without the library keeping a memory of
its own". Mechanism here, policy there. Whether a particular window is a search
field or a menu is a fact about that application, not about this component.

It is a **list and not a flag**, and that is the whole of the design. The
interesting question is never "all or none", it is "which". A `showAll` boolean
serves exactly the case it is worst at: the demo shell has twenty-two entries,
and standing them up at rest is literally the defect this package removed. The
same prop that lets the tile show its seven commands lets another caller show
the five most recently used — and a flag cannot express that at all.

What the rest state does **not** get: rank, weight, and match marks. Nothing has
been searched, so there is nothing to score and nothing to mark; the rows stand
in the caller's order. Everything else — arrows, Enter, Escape, the pointer
rule, the growth on the first keystroke — is unchanged.

Both behaviours have a live consumer and a photograph: the shell leaves the rest
state empty, the tile fills it.

**One defect fell out of this** and is worth recording, because it had been
sitting there invisibly. The panel's height was measured in a layout effect,
and `showModal()` runs in the choreography's *passive* effect — which is later.
The measurement therefore read a dialog that was still `display: none` and got
zero. While the rest state was always empty, zero happened to be the right
answer and nothing looked wrong. With `restingItems` the window opened as a bare
strip: the rows were in the tree with no height. The height is now taken from a
`ResizeObserver` on the content, which does not depend on that ordering at all.
