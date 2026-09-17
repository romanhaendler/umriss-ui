# Spec: Shared building blocks for the range panel

Status: done

Origin: the "biggest remaining win" noted after the five architecture specs — with its estimate corrected. Also closes story 10 of `picker-shared-modules`, which the code review found unimplemented.

---

## Problem Statement

The two range pickers still hold four byte-identical blocks between them: the shared property set handed to the twin calendars, the preset column, the two-month calendar pair, and the trigger with its clear button. A change to how a range panel is shaped has to be made twice, and the two copies have already drifted once before — the right-edge clamp landed in two of four pickers and not the others.

One of these is a gap against an existing spec. `picker-shared-modules` said a range module takes "the shared calendar property set"; it never moved, and the code review caught it.

## Correcting the earlier estimate

This work was previously described as making the date-time range picker a composition of the plain range picker, deleting roughly 60% of a 570-line file. That estimate does not survive contact with the code, for three reasons, and the smaller scope below is what is actually available.

- The files are 281 and 526 lines, not 369 and 573. The popover migration already removed the overlap that figure counted.
- The handoff forbids the change that would unlock composition. A.5 §5: the two-click logic — immediate commit and close in the plain picker, focus into the first time field in the date-time picker — is "der Kern des Alleinstellungsmerkmals und darf durch kein Arbeitspaket verändert werden."
- Composition by rendering one picker inside the other is not possible regardless. The panel bodies interleave: the footers differ, the band derivation differs (a draft start versus two committed days), and the calendars sit at different nesting depths because the date-time picker puts a time block beside them.

What remains is a locality refactor worth roughly 90 lines of duplication, not a depth win. It is worth doing because it gives the range panel's shape one home; it is not worth overselling.

## Solution

Four shared building blocks, all internal, all inside the picker folder:

- **The calendar property set** becomes a factory in the range module — the piece `picker-shared-modules` already specified.
- **The preset column** becomes its own module, taking the presets, a predicate for which one is active, and what to do when one is chosen.
- **The two-month pair** becomes its own module, owning the right-hand month and the window arithmetic that keeps the pair coherent.
- **The trigger** becomes its own module, taking the rendered value as content, because that is the only part that genuinely differs between the two.

Both range pickers compose these. Neither changes what it does.

## User Stories

1. As a library maintainer, I want the calendar property set defined once, so the twin calendars in both range pickers are configured identically by construction.
2. As a library maintainer, I want the preset column defined once, so a change to how presets look lands in both pickers.
3. As a library maintainer, I want the two-month pair defined once, so the window arithmetic and the pair's markup cannot drift apart.
4. As a library maintainer, I want the range trigger defined once, so the clear button, the aria wiring and the invalid state are shared.
5. As a library maintainer, I want each picker to keep its own footer, so the day counter and the time block stay where they belong.
6. As a library maintainer, I want each picker to keep its own commit timing, because the handoff forbids changing it.
7. As a library maintainer, I want the band derivation to stay with each picker, because a draft start and two committed days are genuinely different states.
8. As an end user, I want the two-click behaviour to be exactly what it was, so nothing I rely on moves.
9. As a maintainer reviewing this, I want every screenshot baseline to pass unchanged, because that is the proof the extraction was faithful.
10. As an agent adding a comparison range later, I want one place that defines what a range panel looks like.

## Implementation Decisions

**Everything here is internal.** No public export is added, removed or renamed. `@umriss/ui`'s interface is untouched.

**Placement follows the ownership rule** already established: these are shared by modules that all live in the picker folder, so they live there too.

**The calendar property set is a factory, not a component.** It takes what the calendars need — the active day and its setter, the band bounds, the preview end, the hover reporter, the pick handler — and returns the object both calendars are spread with. It carries the `ohneFremdmonat` and `value: null` decisions that both pickers make identically.

**The two-month pair owns the right-hand month.** It derives the second month itself and routes navigation through the existing window function, so neither caller repeats that.

**The preset column takes a callback, not a value.** What a preset means differs — the plain picker commits day boundaries, the date-time picker applies its own resolution — so the column reports the chosen preset and the caller decides.

**The trigger takes its content as a node.** The date-time picker special-cases a range inside one day and prints times; the plain picker prints two dates. That is the only real difference, so it is the only thing passed in.

**The focus-follows-active effect is deliberately NOT extracted.** The two versions differ for a reason: the date-time picker must not steal focus back from a time field or the commit button. Merging them would need a predicate parameter that exists only to describe the difference, which is the abstraction earning nothing.

**Nothing changes about behaviour.** Not the commit timing, not the two-click rule, not the footers, not a class name.

## Testing Decisions

**What makes a good test here.** This is an extraction, so the primary evidence is that nothing changed: the screenshot baselines and the interaction tests must pass untouched. Any baseline movement is a defect in the move, not a result to accept.

**Modules under test.** The calendar property factory is a pure function and gets asserted directly — that the two calendars receive the same configuration is the whole point of moving it. The three rendering modules get no new unit tests; their appearance is covered by the screenshots and their behaviour by the existing interaction tests.

**Prior art.** The pure-module tests already in `packages/ui/tests-unit/`, and behind them the charts package.

**Regression safety.** Every screenshot baseline passes unchanged, with no regeneration. Every currently passing interaction test still passes; the two red checkbox tests stay red.

## Out of Scope

- **Any change to the two-click logic, the commit timing or the footers.** Forbidden by A.5 §5.
- **Making the date-time range picker a composition of the plain one.** Not possible without the above.
- **The focus-follows-active effect**, deliberately left duplicated.
- **The band derivation**, which is genuinely different in each picker.
- **Any public interface change.**
- **The remaining aria wiring on triggers**, which stays with each caller.

## Further Notes

The honest summary of this work is that it buys locality, not depth. The four blocks are markup and configuration, and the modules that hold them have interfaces nearly as wide as their bodies. What justifies them is the deletion test: remove them and roughly ninety lines reappear in two places that have already drifted apart once.

The estimate that motivated this work was wrong, and the correction is recorded here rather than quietly dropped, so a future reader does not go looking for the missing 60%.
