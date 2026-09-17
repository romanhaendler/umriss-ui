# Spec: One contract for what the pickers emit

Status: done

Origin: `/improve-codebase-architecture` review, 23 Aug 2026 — candidate 04.

Sequencing: run after `picker-shared-modules` and before `popover-seam`. See Further Notes.

---

## Problem Statement

The four pickers present interfaces that look like each other and mean different things.

The largest of them, the date-time range picker, has an interface that is the exact set union of the plain range picker's and the date-time picker's — the same property names, the same defaults, the same documentation comments, not one new property. But the invariants are not the union. The plain range picker guarantees that both ends of an emitted range are at local midnight and that the start never falls after the end; the date-time range picker emits exact instants. The two share the same standard presets constant, and it produces day boundaries at midnight in one and end-of-day at one minute or one second before midnight in the other. A developer who reads a union-shaped interface and assumes union-shaped meaning is wrong, and nothing in the type tells them so.

The plain date picker is inconsistent with itself. Choosing a day from the grid emits local midnight. Pressing the "today" button in the same panel emits the current moment, complete with hours, minutes and seconds. One property, two shapes of value, no indication which one you got.

Smaller asymmetries sit alongside these. The date-time picker is the only one of the four without a size property. Its "now" action bypasses the daylight-saving resolver that every other path goes through. Its daylight-saving choice resets only when the panel opens, so moving to a different ambiguous day within one session keeps the earlier answer. And the clear control can be pressed while the panel is open, which empties the value but leaves a panel still seeded from the value that no longer exists.

None of these is a crash. They are the kind of defect that reaches a consumer's data and is discovered much later, and the interface gives them no way to see it coming.

## Solution

Decide, once, what shape of value leaves each picker, and put that decision in one place that all four use.

A normalisation module owns the question. Each picker declares which contract it follows — day-granular for the two date-only pickers, instant-granular for the two that include a time — and every path that emits a value goes through it. That includes the grid, the footer buttons, the presets and the clear control, which is where the current inconsistencies live.

The standard presets stop producing different results in different pickers. They describe day boundaries, and each picker applies its own declared contract to them, so the presets mean one thing and the picker decides how to express it.

The invariants then get written into the interfaces that carry them, because an invariant a caller must know is part of the interface whether or not it appears in the type. Alongside that, the small asymmetries are closed: the missing size property is added, the "now" action goes through the same resolver as everything else, the ambiguous-time choice resets when the day changes rather than only when the panel opens, and clearing while the panel is open leaves a coherent state.

## User Stories

1. As a developer using a date picker, I want every emitted date to have the same shape, so that I do not have to normalise defensively in my own code.
2. As a developer using a date picker, I want choosing a day and pressing "today" to produce the same kind of value, so that one property does not carry two contracts.
3. As a developer using a range picker, I want both ends of a range to follow a documented granularity, so that I know whether I am receiving midnight or an instant.
4. As a developer using a range picker, I want the start never to fall after the end, so that I do not have to sort what I receive.
5. As a developer using both range pickers, I want the shared presets to mean the same thing in each, so that switching from one picker to the other does not silently change my data.
6. As a developer using the date-time range picker, I want its documentation to state where its meaning differs from the plain range picker, so that a union-shaped interface does not imply union-shaped semantics.
7. As a developer using the date-time picker, I want a size property, so that it matches its three siblings in a dense form.
8. As a developer using any picker, I want the invariants stated in the interface, so that I can rely on them without reading the implementation.
9. As a developer using the date-time picker, I want the "now" action to resolve through the same daylight-saving path as every other value, so that it cannot produce a value the other paths could not.
10. As an end user, I want the presets in the date-time range picker to cover whole days, so that "last seven days" does not quietly exclude the final evening.
11. As an end user picking a time on a day when the clocks change, I want a consistent answer, so that the value I confirm is the value I chose.
12. As an end user, I want moving to a different ambiguous day to ask me again which occurrence I mean, so that an earlier answer is not silently reused.
13. As an end user, I want clearing the value while the panel is open to leave the panel in a sensible state, so that I am not looking at a calendar seeded from a value that no longer exists.
14. As a library maintainer, I want one module that owns value normalisation, so that a change to the rule cannot land in two of four pickers.
15. As a library maintainer, I want to assert day-granular normalisation directly, so that midnight truncation is proven for every path.
16. As a library maintainer, I want to assert instant-granular normalisation directly, so that seconds are included or excluded exactly as configured.
17. As a library maintainer, I want to assert the ordering rule, so that a backwards selection provably comes back ordered.
18. As a library maintainer, I want to assert each standard preset against a fixed reference date under both contracts, so that the two range pickers provably agree on what a preset means.
19. As a library maintainer, I want to assert that normalisation is idempotent, so that applying it twice cannot shift a value.
20. As a library maintainer, I want to assert normalisation across a daylight-saving transition, so that truncating to midnight on a day with no midnight cannot produce a wrong instant.
21. As a library maintainer, I want to assert that every emitting path goes through the module, so that a future path cannot bypass the contract.
22. As a library maintainer, I want the behaviour changes here listed explicitly, so that a reviewer can distinguish a fix from a regression.
23. As an agent implementing free-text date entry, I want a settled contract for emitted values, so that the parser's output has one target shape.
24. As an agent implementing free-text date entry, I want the presets and the parser to agree on what a day boundary is, so that typing a range and picking a preset produce the same value.
25. As a maintainer reviewing a change to a picker, I want a failing unit test to name the contract that broke, so that a data-shape defect is caught before release rather than in a consumer's database.

## Implementation Decisions

**One normalisation module, placed with the pickers** under the ownership rule established by `pure-logic-seams` and applied by `picker-shared-modules`: shared by all four pickers, all of which live in one folder, so it sits in that folder rather than in the package's cross-cutting library directory.

**Two contracts, declared per picker.** A day-granular contract truncates to local midnight and is used by the plain date picker and the plain range picker. An instant-granular contract preserves the chosen time and is used by the date-time picker and the date-time range picker. Each picker declares which it follows; the module applies it.

**Every emitting path goes through the module.** Grid selection, footer actions, preset activation and the clear control. This is what closes the current gap where the grid and the "today" button in one panel disagree.

**Range ordering belongs to the module.** The rule that the start never follows the end is applied in one place for both range pickers. The two currently express it separately, and one of them compares whole instants while the other compares days — a difference that is correct but unmarked. Under one contract per picker the comparison granularity follows from the contract rather than from which file you are reading.

**The presets describe day boundaries and nothing else.** They stop encoding an end-of-day time. Each range picker applies its declared contract to the preset's boundaries, so the day-granular picker produces midnight-to-midnight and the instant-granular picker produces the start of the first day to the end of the last. This is the change that makes one shared constant mean one thing.

**The invariants are documented on the interfaces that carry them.** For each picker: the granularity of emitted values, the ordering guarantee for ranges, and for the date-time pickers the fact that an emitted instant may differ from the wall-clock time entered when that wall-clock time does not exist or occurs twice.

**Daylight-saving outcomes stay internally resolved.** The resolver distinguishes an ordinary time from one that does not exist and one that occurs twice, and today only the rendered panel tells the user which case they are in — the caller receives an instant and no indication. Surfacing that to the caller as data is a real interface question and is deliberately deferred; it is documented instead. What does change is that the "now" action stops bypassing the resolver, and that the choice between two occurrences resets when the selected day changes rather than only when the panel opens.

**The clear control leaves a coherent state.** Clearing while the panel is open either closes the panel or reseeds it; the panel must not remain open seeded from a value that has been removed.

**The date-time picker gains a size property**, matching its three siblings, with the same two values and the same default.

**These are behaviour changes and are listed for review.** Emitted values change for: the plain date picker's "today" action, which begins emitting midnight; the date-time range picker's presets, whose ends move from one minute or second before midnight to the end of the day under the declared contract; and the date-time picker's "now" action, which now resolves. Panel state changes for: the ambiguous-time choice resetting on day change, and clearing while open. Nothing else changes.

## Testing Decisions

**What makes a good test here.** A test calls the normalisation module with a value and a contract and asserts the value that comes back. It uses a fixed reference date and a fixed time zone. It does not mount a picker to find out what a picker emits, and it does not assert on panel internals.

**Modules under test.** The normalisation module, directly. The presets under both contracts, since the whole point is that they agree. The pickers themselves get no new unit tests; the paths that emit are covered by asserting the module they now all call, and the panels are covered by the existing screenshots.

**Prior art.** Follow the pattern `pure-logic-seams` establishes in this package, and behind it the charts package's arithmetic tests: pure functions, plain assertions, no environment, one test file per module.

**Determinism.** Every test passes its own reference date. The daylight-saving cases are asserted against specific transition dates in the German time zone, matching how the existing resolver is meant to be exercised.

**Coverage priorities.** The presets under both contracts first, because that is the defect most likely to reach a consumer's data unnoticed. Then day-granular truncation on a transition day, where midnight may not exist. Then idempotence. Then ordering with a backwards selection under each contract.

**Regression safety.** Screenshot baselines may move where a listed behaviour change alters rendered text — the date-time range picker's preset footer is the likely one. Each moved baseline must be justified against the list above; any movement not on the list is a defect. The interaction tests must keep passing, and the two that are red for the unrelated checkbox reason stay red.

**A test that the contract cannot be bypassed.** Assert that each picker's emitted value satisfies its declared contract, driven through the module rather than through the panel. This is the test that stops a future fifth emitting path from quietly reintroducing the current inconsistency.

## Out of Scope

- **Surfacing daylight-saving outcomes to the caller as data.** Documented, deliberately deferred.
- **Minimum and maximum date bounds, or a per-day selectable predicate.** None exists today and none is added.
- **Any validation model.** The range pickers are designed to have no error state and that stays true.
- **Free-text date entry**, which depends on this contract being settled.
- **The popover plumbing** in these four files, which is the popover seam spec.
- **Relocating the shared picker pieces**, which is the preceding spec.
- **Making the date-time range picker a composition of the plain range picker** rather than a fork. It requires changing when the plain range picker commits, which is a larger behaviour change.
- **Redesigning the calendar's interface** to hold its own state.
- **Locale.** German formatting is assumed throughout and is not parameterised here.

## Further Notes

Of the review's five candidates this is the one whose defect can reach a consumer's data rather than only costing maintenance. A union-shaped interface whose invariants are not the union is worse than an obviously different one, because it invites a correct-looking assumption.

This runs after the relocation spec so that it changes meaning in files that have stopped moving, and before the popover work so that the largest migration lands on pickers whose emitted values are already settled.

Recommended order across the five candidates: pure-logic seams, then the picker relocation, then this, then the popover seam. The table model is independent and can run in parallel at any point after the first.

The decision worth recording as an architecture decision, once the repository has somewhere to record them, is the two-contract model itself: that day-granular and instant-granular are the only two shapes a picker emits, that presets describe day boundaries and the picker applies its contract, and that no emitting path may bypass the module.

The terms this introduces — a value contract, day-granular and instant-granular emission — are new vocabulary and belong in a glossary when one exists.
