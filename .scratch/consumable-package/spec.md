# Spec: What a second application needs before it can adopt the library

Status: done

Origin: library inventory, 23 Aug 2026 — rank 3 of four. Not covered by the library handoff, which specifies components rather than the package around them.

Sequencing: independent of `foundation-primitives` and `table-surface`; can run in parallel with either. One ordering constraint runs forward rather than back: the density switch of handoff work package B.13 should land *after* the root provider exists, because the provider is where a density choice belongs, and delivering B.13 first would mean building a second mechanism for it.

---

## Problem Statement

Everything the library has been asked for so far has been a component. That is why the package around the components has never been decided, and why a second application adopting it would have to re-answer questions the first one answered privately.

Where does a theme come from? The library ships both themes as token layers and states, correctly, that choosing between them belongs to the application. But it offers nothing to choose *with*, so every application writes the same handful of lines against the root element, and every application decides independently whether to follow the system setting or remember a preference. The same is about to happen to density: work package B.13 introduces a compact mode with no place to put the choice.

Where do overlays go? The popover seam knows to portal into the nearest dialog ancestor, which is a genuinely good answer to a real problem. It is also a decision the library made silently, and an application embedding the library inside a host page it does not control has no way to say otherwise.

What language is this? German, everywhere, in two different ways. The locale is fixed at twelve points across five modules — date formats, time formats, number formats, percentage formats, the collator that orders text. And German wording is embedded in eleven components as accessibility labels and visible strings: clear the entry, previous month, next month, close the message, rows per page. Neither is wrong. Both are invisible, and neither is written down as a decision, which means the twelve points become twenty as new components arrive, and the day someone needs to change one of them they will change nine of them and ship the other three.

What do the glyphs come from? Each component draws its own, inline. There is no shared set, so there is no stroke width, no optical size and no corner treatment that a new glyph has to match — only whatever the nearest existing component happened to do. This is the kind of drift that is invisible for a year and then obvious all at once.

Is it accessible? Keyboard operation and accessibility attributes are declared part of the definition of done, and the components honour that carefully. But nothing checks. The test suite has four levels — pure unit tests, component behaviour tests in a simulated document, a rendering smoke test over the demo, and screenshots plus interaction tests in a real browser — and none of them would notice a missing label, a broken focus order or a colour pair that fails contrast in the dark theme. The infrastructure to check exists and is running; only the check is absent.

What version is this? The package says nought point one point nought, has no changelog of its own, and has no publishing step. Today that is harmless, because there is one consumer and it is in the same repository. The moment there is a second, every upgrade becomes a wager about what changed.

## Solution

Decide the package, not more components. Five pieces, each small, each removing a question a second consumer would otherwise have to answer for itself.

A root provider that holds the choices the library currently leaves lying around: theme, density, where overlays are portalled, how toasts are configured, and how values are formatted and worded. It is optional in the strict sense — every component keeps working with no provider above it, using exactly today's defaults — because anything else would be a breaking change dressed as an improvement.

One seam for formatting and wording, replacing the twelve scattered locale fixings and giving the eleven components' embedded strings a single overridable home. German remains the only language the library ships, and that is now a written decision rather than an accident of implementation.

One glyph set, so that the next drawing has something to match.

Accessibility checks in the run that already exists, plus a contrast check over the token pairs in both themes.

A release process: meaningful versioning, a changelog for the package, a publishing step.

And one thing recorded rather than built: the library targets client-rendered applications. Server rendering is not a goal, the client-boundary annotations that a server-rendering framework would require are deliberately absent, and writing that down closes a question that would otherwise be re-asked every time someone notices.

## User Stories

1. As a developer adopting the library, I want one place to configure it, so that I am not assembling the same four decisions from scratch that the previous adopter assembled.
2. As a developer adopting the library, I want the library to work with no configuration at all, so that trying it out costs nothing.
3. As a developer adopting the library, I want configuring it to be additive rather than required, so that upgrading to the version that introduces the provider changes nothing for me.
4. As a developer adopting the library, I want to set the theme through the library, so that I stop writing the same lines against the root element.
5. As a developer adopting the library, I want to say "follow the system setting" and have that keep working when the setting changes, so that I do not write a listener myself.
6. As a developer adopting the library, I want to set the density in the same place as the theme, so that the two global appearance choices are configured alike.
7. As a developer adopting the library, I want to say where overlays are portalled, so that I can embed the library inside a host page whose structure I do not control.
8. As a developer adopting the library, I want to configure the toast area once, so that its position and timing are a product decision rather than a per-call one.
9. As a developer adopting the library, I want to override a piece of wording without forking a component, so that "clear the entry" can say what my product calls it.
10. As a developer adopting the library, I want to override formatting behaviour in one place, so that a product-wide change to how figures read is one change.
11. As a developer adopting the library, I want the German defaults to remain the defaults, so that overriding is a choice rather than an obligation.
12. As a developer adopting the library, I want the library to say plainly that it targets client-rendered applications, so that I find out before I try to server-render it rather than after.
13. As a developer adopting the library, I want a changelog, so that I can read what an upgrade will do to me.
14. As a developer adopting the library, I want versions that mean something, so that I can tell a safe upgrade from a risky one without reading a diff.
15. As a developer adopting the library, I want a publishing step, so that consuming the package does not require a path reference into someone else's checkout.
16. As a library maintainer, I want the locale fixed at one point instead of twelve, so that a new component cannot quietly add a thirteenth.
17. As a library maintainer, I want the embedded wording collected in one place, so that I can see the whole vocabulary the library puts on screen.
18. As a library maintainer, I want the formatting seam covered by tests, so that consolidating it provably changes no output.
19. As a library maintainer, I want a shared glyph set, so that the next glyph has a stroke width and an optical size to match rather than a nearest neighbour to guess from.
20. As a library maintainer, I want accessibility checked automatically over the demo, so that a missing label is caught by the suite rather than by a user.
21. As a library maintainer, I want the check to run in both themes, so that a problem that exists only in the dark theme is not invisible.
22. As a library maintainer, I want colour pairs checked for contrast, so that a token change that makes muted text unreadable fails rather than ships.
23. As a library maintainer, I want the accessibility check to run in the existing browser suite, so that I am not maintaining a fourth kind of test.
24. As a library maintainer, I want the provider's absence tested explicitly, so that "optional" is proven rather than intended.
25. As a library maintainer, I want the consolidation of formatting to be provably output-identical, so that a refactor of twelve call sites cannot silently change a date format.
26. As a designer, I want every glyph in the library drawn to one specification, so that a row of controls does not show three different stroke weights.
27. As a designer, I want the theme choice to be something the product can expose to its users, so that a preference control is a matter of calling the library rather than reimplementing its mechanism.
28. As an end user of a product built on the library, I want my theme preference respected however the product chose to decide it, so that the interface matches the rest of my system or my stated choice.
29. As an end user relying on assistive technology, I want the library's accessibility promises to be verified rather than asserted, so that the parts I depend on keep working release after release.
30. As an end user with low vision, I want text and its background to stay legible in both themes, so that a visual refresh does not cost me readability.

## Implementation Decisions

**The provider is optional and its absence is the tested default.** Every component must render and behave exactly as it does today with no provider above it. This is non-negotiable: the package has a consumer, and a provider that becomes mandatory is a breaking change. The provider supplies values; components read them through a hook that returns defaults when there is nothing to read.

**The provider holds five things:** the theme, the density, the portal target for overlays, the toast configuration, and the formatting-and-wording configuration. It holds nothing else. In particular it does not become a place to put component defaults in general — the moment it can configure a button's default variant, it stops being a small decision and becomes a second API surface.

**Theme handling covers the three states the library already implies:** an explicit light choice, an explicit dark choice, and following the system setting. Following the system setting means subscribing to it, so that a change while the application is running is honoured. The provider writes the attribute the token layers already key off; the token layers themselves do not change. Whether a user's preference is remembered between visits stays the application's decision, exactly as the readme already says.

**Density is configured here rather than by a separate mechanism.** Work package B.13 should read from the provider. This spec does not implement the compact token set — that is B.13's job — but it does establish where the choice lives, which is why the ordering note at the top matters.

**The portal target is a setting with today's behaviour as its default.** The popover seam's rule about portalling into the nearest dialog ancestor stays, because it solves a real stacking problem; the setting lets an application that needs a different root say so.

**Formatting and wording become one seam.** It carries the formatters currently constructed at twelve points across five modules and the strings currently embedded in eleven components. Its default is German, and German is the only language shipped. An application may override individual entries; it may not select a different bundled language, because there is no other bundled language. This is a decision, not a limitation to be worked around: making the library multilingual would mean parameterising the pickers' week start, date formats and time notation, which is a substantially larger piece of work with no current demand.

The consolidation must be output-identical. Every formatter that moves must produce the same string for the same input as it does today, including the details that are easy to lose: the two-digit padding, the offset label used for the ambiguous hour at the end of summer time, the collation used to order text, the thousands separator that appears only on leaving a field. Where a component constructs a formatter privately today, the seam construction replaces it; where it caches formatters, the seam caches them.

**Wording is exposed as a dictionary of entries, not as a translation function.** Entries are named for what they label, and every entry the library uses is present in the default dictionary. A missing override falls back to the default rather than rendering an empty string or a key.

**One glyph set,** drawn to a single specification: one nominal size, one stroke width, current colour, no fills. Existing inline glyphs are migrated onto it *only* where the migration is provably pixel-identical; where a component's glyph differs from the set's specification, leave it and record the difference. A migration that quietly changes twenty glyphs is exactly the kind of change the handoff's standing instruction forbids.

**Accessibility checking joins the existing browser suite** rather than becoming a fourth kind of test. It runs over the demo's tiles in both themes. The demo is already the seam through which every component is exercised, which is what makes this cheap. Findings that are genuine defects are fixed as part of this work; findings that are demo-only artefacts are fixed in the demo; findings that are disagreements with the checker are suppressed individually with a written reason, never wholesale.

**Contrast checking is a pure function over the token pairs,** not a browser check. It takes the pairs the design actually uses — body text on surface, secondary text on surface, muted text on surface, muted text on sunken, each semantic colour on its subtle surface, the primary button's foreground on its background, the accent on both grounds — and asserts a minimum ratio for each, in both themes. Pure, fast, and it fails at the point a token changes rather than at the point a screenshot is regenerated.

**Versioning, a package changelog and a publishing step.** The repository already keeps a changelog at its root; the package gets its own, describing what changed for a consumer rather than what changed in the repository. Version numbers become meaningful, which given a nought-point release means minor for additions and patch for fixes, with the understanding that anything that changes existing behaviour is called out explicitly whatever the number does.

**The client-only target is recorded, not implemented.** The library targets client-rendered applications. The annotations a server-rendering framework would need are deliberately absent, and the package documentation says so, so that a prospective consumer discovers it by reading rather than by debugging. Nothing is built for this; the deliverable is the written decision.

## Testing Decisions

**What makes a good test here.** Most of this work is consolidation, and the test that matters for consolidation is a proof that nothing changed. For the formatting seam that means asserting the same outputs the scattered implementations produce today, written down before the move rather than after. For the provider it means asserting that the no-provider case is the current behaviour. Tests that assert the *shape* of the new configuration are near-worthless; tests that assert the *output* are the whole point.

**The formatting seam is the heaviest coverage and the easiest.** It is pure. Date formats, time formats with and without seconds, the combined format, the offset label, number formatting at each decimal precision, the percentage format, and text collation. There is prior art directly adjacent: the existing number and time modules already have unit tests, and the charts package is the wider precedent for pure modules with plain assertions.

**Write the characterisation tests first, against the current scattered implementations,** then move the implementations, then confirm the tests still pass unchanged. Doing it in the other order proves only that the new code agrees with itself.

**The provider gets three kinds of test.** That a component with no provider behaves as it does today — this is the important one and it should exist for at least one component of each kind that reads configuration. That a provider with a given theme produces the corresponding attribute. That a wording override reaches the component that uses the entry and that a partial override falls back for the entries it omits.

**The contrast check is a unit test over the token pairs,** run for both themes, asserting a minimum ratio per pair. It reads the token values from the stylesheet rather than duplicating them, so that it fails when a token changes rather than when someone remembers to update the test.

**The accessibility check extends the existing browser suite,** covering the demo's tiles in both themes. It is a new spec file in that suite, not a new test level.

**The glyph set gets no behavioural tests.** Its correctness is visual, and the existing screenshot baselines are the guard: a migration that changes a glyph shows up as a changed picture, which is exactly the signal that should stop it.

**Regression safety.** Screenshot baselines must not change as a result of this work. If any do, the change is either a glyph migration that was not pixel-identical or a formatter that was not output-identical, and in both cases the correct response is to revert that part rather than to accept the new baseline.

## Out of Scope

- **Any language other than German.** Decided; the seam exists to make the German fixing explicit and overridable, not to introduce translation.
- **Locale-dependent week start, date order or time notation.** These stay German.
- **Server rendering and the annotations it requires.** Decided against; the deliverable is the written decision.
- **The compact token set**, which is handoff work package B.13. This spec establishes where the density choice lives; B.13 defines what it does.
- **Per-component style entry points**, so that a consumer using three components can load three stylesheets. Considered and left alone: the package's stylesheet is small, and splitting it would complicate the build for a benefit nobody has asked for.
- **Exporting the design tokens to other platforms.**
- **A separate theming package**, or brand-level theming beyond overriding token values, which already works.
- **Component defaults in the provider.** It configures the five listed things and nothing else.
- **Migrating glyphs that are not pixel-identical to the shared set.**

## Further Notes

The five pieces here are genuinely independent and should be delivered separately. The order that gets the most value soonest is the formatting seam first — it is the one that gets worse with time, because every new component adds another fixing — then the provider, then the contrast check, then the accessibility check, then the glyph set, then the release process whenever a second consumer actually appears.

The formatting seam is also the riskiest, and the risk is entirely in the details. The time handling around the change to and from summer time is the most carefully built logic in the package, and it constructs its own formatter for the offset label. Moving that is the one place where "output-identical" must be verified rather than assumed, and it is worth writing those characterisation tests before touching anything else.

A note on the provider's optionality. It will be tempting, once the provider exists, to start requiring it — the code is simpler if configuration is always present. Resist that for as long as the package has consumers that do not use it. A library whose components work standalone is a library that can be adopted one component at a time, and that is worth more than the simplification.

The terms this introduces — a formatting seam, a wording dictionary, a portal target, the distinction between an explicit theme and a followed one — are new vocabulary for the project and belong in a glossary when one exists. The client-only target and the German-only decision are both architecture decisions in the proper sense and should be recorded as such once the repository has somewhere to record them; they are exactly the kind of thing that gets re-litigated annually when it lives only in a spec.
