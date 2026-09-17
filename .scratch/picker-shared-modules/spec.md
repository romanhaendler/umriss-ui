# Spec: Give the pickers' shared pieces their own home

Status: done

Origin: `/improve-codebase-architecture` review, 23 Aug 2026 — candidate 05.

Sequencing: run after `pure-logic-seams` and before `picker-value-contract` and `popover-seam`. See Further Notes.

---

## Problem Statement

The four date and time pickers share a great deal, and most of it lives in files named after one of the sharers.

The time field, the daylight-saving resolver, the offset label and the digit-padding helper all live in the date-time picker's file, and the date-time range picker imports them from there. The standard presets and the day-counting helper live in the date range picker's file, and the date-time range picker imports them from there too. So the largest picker reaches sideways into two siblings, and two picker files are simultaneously a picker and the library's home for a shared concern.

This leaks outward. The package's public interface re-exports the presets and the day-counting helper from a file named after one particular picker, so a consumer who wants the presets imports the range picker. Meanwhile the calendar — the one piece that was deliberately factored as shared, and which all four pickers use without any of them reimplementing it — is not exported at all. The accidental seams are public and the deliberate one is private.

There is duplication in the same shape. The German date display format is constructed three separate times at module scope, the short format twice, and the time format twice as a fresh allocation on every render. Nothing owns the question of how this product writes a date. The chained two-month window arithmetic that makes the range panels coherent is byte-identical in both range pickers, as is the shared property set handed to the twin calendars.

None of this is broken today. It is the reason the next four work packages will each be harder than they need to be, and it is why a maintainer cannot tell, from a file name, where a shared rule lives.

## Solution

Move the shared pieces into modules that are not named after one of their callers, inside the picker folder where they belong.

Time concerns — the time field, the daylight-saving resolver, the offset label, the padding helper and the resolver's result type — go to a time module. Range concerns — the standard presets, the day count, the chained two-month window arithmetic and the shared calendar property set — go to a range module. Locale formatting — the long date format, the short date format and the time format — goes to a formatting module, constructed once rather than three times at module scope and twice per render.

Every current import path keeps working: the pieces are re-exported from where they live today, so no caller changes and the package's public interface is unchanged in what it offers. What changes is where the definitions sit, and that the package barrel stops sourcing shared values from a picker file.

Nothing here changes behaviour. This is a relocation, and it is deliberately the cheapest of the five candidates, done early so that the two specs which follow are editing a folder that has stopped moving.

## User Stories

1. As a library maintainer, I want shared time logic to live in a file named for time, so that I can find it without knowing which picker happened to define it first.
2. As a library maintainer, I want shared range logic to live in a file named for ranges, so that the same is true there.
3. As a library maintainer, I want no picker importing from a sibling picker, so that changing one picker cannot break another through a hidden dependency.
4. As a library maintainer, I want the package's public interface to source shared values from a shared module, so that a consumer wanting presets does not import a picker.
5. As a library maintainer, I want one definition of the long German date format, so that three module-scope constructions cannot drift apart.
6. As a library maintainer, I want one definition of the short date format and one of the time format, so that the same is true for those.
7. As a library maintainer, I want the time format constructed once rather than on every render, so that two pickers stop allocating a formatter per frame.
8. As a library maintainer, I want a single place that answers "how does this product write a date", so that a future locale question has one place to be asked.
9. As a library maintainer, I want the chained two-month window arithmetic defined once, so that the two range pickers cannot diverge on how their panels scroll.
10. As a library maintainer, I want the shared calendar property set defined once, so that the twin calendars in both range pickers are configured identically by construction.
11. As a library maintainer, I want to assert the day-counting helper directly, so that inclusive range arithmetic is covered.
12. As a library maintainer, I want to assert the daylight-saving resolver directly, so that the hardest correctness in the package finally has a standing test rather than a throwaway script.
13. As a library maintainer, I want to assert the standard presets against a fixed reference date, so that each preset provably produces the range it claims.
14. As a library maintainer, I want to assert the two-month window rule, so that scrolling the range panel is proven rather than eyeballed.
15. As a library maintainer, I want every current import path to keep working, so that this relocation cannot break a caller.
16. As a library maintainer, I want no rendered output to change, so that the existing screenshot baselines prove the relocation was faithful.
17. As an agent implementing free-text date entry, I want an obvious home for the new parser alongside the other shared date logic, so that it does not become a fifth thing defined inside a picker.
18. As an agent implementing the picker value contract, I want the shared pieces already relocated, so that I am changing meaning without also moving files.
19. As an agent implementing the popover seam, I want the picker folder to have stopped changing shape, so that a nine-module migration is not rebasing onto a moving target.
20. As a maintainer reviewing this change, I want it to contain no behaviour change at all, so that review is a matter of checking the move rather than reasoning about consequences.
21. As a consumer of `@umriss/ui`, I want the presets and range helpers to keep working exactly as they do, so that this is invisible to me.

## Implementation Decisions

**Placement follows the ownership rule established by `pure-logic-seams`:** logic with one owner sits beside it, logic with several sits in a shared location. Every piece here is shared by pickers that all live in one folder, so the shared location is that folder rather than the package's cross-cutting library directory. This matches where the calendar grid module lands and where the planned free-text date parser is specified to go.

**Three destination modules.** A time module takes the time field, the daylight-saving resolver, the offset label, the padding helper and the resolver's result type. A range module takes the standard presets, the day count, the chained two-month window arithmetic and the shared calendar property set. A formatting module takes the long date format, the short date format and the time format.

**The time field moves even though it is not pure.** It is a rendering module, not a function, but it is shared and it currently lives in a file named after one of its two callers. The same reasoning applies.

**Everything is re-exported from its current location.** The picker files that define these pieces today re-export them, so every existing import path continues to resolve. This keeps the change reviewable as a pure move and means the specs that follow do not have to update imports at the same time as they change meaning.

**The package barrel stops sourcing shared values from a picker file.** The presets and the day-counting helper are exported from the range module. What the package offers is unchanged; where it comes from is not.

**The calendar stays internal.** The review observed that the one deliberate seam is the one not exported. Exporting it is deferred rather than done here, because its interface needs design work first: it is fully controlled, so four of its properties exist only because it refuses to hold state, and every caller pays the same seeding code as a result. Publishing that interface would commit to it. This is recorded as a known deferral rather than an oversight.

**The shared picker stylesheet stays as it is.** All five picker files share one stylesheet, which is a real shared seam that works. It is not split here.

**No behaviour changes.** No emitted value, no rendered element, no class name, no property and no default changes. Formatter construction moves from per-render to module scope in two places, which is an allocation change with no observable effect on output.

**The boundary with the calendar grid module is explicit.** The grid module from `pure-logic-seams` owns single-month concerns: cell generation, the Monday-first offset, band resolution and arrow stepping. The range module owns multi-month concerns: the chained two-month window and the shared property set for twin calendars.

## Testing Decisions

**What makes a good test here.** Because this is a relocation, the primary test is that nothing changed: the existing screenshot baselines and interaction tests must pass untouched. Beyond that, the pieces being moved become reachable, and the ones worth asserting get their first tests as part of the move — a relocation that leaves everything still untested has banked none of the benefit.

**Modules under test.** The daylight-saving resolver, the day-counting helper, the standard presets and the two-month window rule. The time field is a rendering module and gets no unit test here; its behaviour is covered by the screenshots and by the interaction tests. The formatting module gets no test beyond what the pieces using it already imply.

**Prior art.** Follow whatever `pure-logic-seams` established in this package. Behind that, the charts package's arithmetic tests are the model: pure functions, plain assertions, no environment.

**Determinism.** The presets and anything else depending on "today" are asserted against a fixed reference date passed in, never against the current time. The daylight-saving resolver is asserted against specific transition dates in the German time zone, which is the case that motivated it.

**Coverage priorities.** The daylight-saving resolver first, and specifically its three outcomes: an ordinary time, a wall-clock time that does not exist because the clock jumped forward, and a wall-clock time that occurs twice because the clock went back. This is the single highest-value test in the package: the logic is hard, it is locale-dependent, it was verified with throwaway scripts, and it is trivially testable as written.

**Regression safety.** Every screenshot baseline must pass unchanged, with no regeneration. Every currently passing interaction test must still pass. Because this spec changes no behaviour, any baseline movement at all is a defect in the move, not a result to accept.

## Out of Scope

- **Any behaviour change.** If a change alters an emitted value or a rendered pixel, it belongs in another spec.
- **The picker value contract** — the divergent invariants, the presets producing different ends in different pickers, the missing size property. That is the next spec and depends on this one.
- **The popover plumbing** in the four pickers, which is the popover seam spec.
- **Exporting the calendar**, deliberately deferred pending interface design.
- **Redesigning the calendar's interface** so that it holds its own view and active-day state, which would remove the seeding code duplicated across four callers. Worth doing; not here.
- **Splitting the shared picker stylesheet.**
- **Free-text date entry**, which lands in the home this spec prepares.
- **The largest range picker existing as a fork rather than a composition.** Making it composable requires changing when the plain range picker commits, which is a behaviour change and belongs elsewhere.

## Further Notes

This is the cheapest of the review's five candidates and deliberately runs early. Two later specs — the picker value contract and the popover seam — both edit these same four files. Doing the mechanical move first means neither of them is relocating files at the same time as it changes meaning, and it means a reviewer of those specs can read a diff that is only about behaviour.

Recommended order across the five candidates: pure-logic seams, then this, then the picker value contract, then the popover seam. The table model is independent and can run in parallel at any point after the first.

The review noted that the largest range picker is a fork of the plain range picker rather than a composition of it, and that roughly sixty percent of a five-hundred-line file would become deletable if the plain range picker did not hard-code committing and closing on the second click. That is the biggest single reduction available in this cluster. It is out of scope here because it changes behaviour, but it is the natural follow-on once the contract spec has settled what these modules emit.

The terms this introduces — a time module, a range module, a formatting module — are new vocabulary for the project and belong in a glossary when one exists, along with the existing distinction between a committed range and a hover-preview range.
