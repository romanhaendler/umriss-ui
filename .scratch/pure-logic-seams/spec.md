# Spec: Pure-logic seams for @umriss/ui

Status: done

Origin: `/improve-codebase-architecture` review, 23 Aug 2026 — candidate 03 ("Lift the pure logic to module scope"), the review's top recommendation.

---

## Problem Statement

`@umriss/ui` has almost no tests, and not because nobody wrote them. The logic worth testing is not reachable.

The package ships 4,913 lines behind roughly twenty exports, and its entire test suite is one jsdom smoke test that mounts the demo and asserts the page contains the word "Komponentenübersicht". Two of the nine Playwright interaction tests have been red since the package arrived. The screenshot tests only compare resting pixels.

The reason is structural. Predicates, parsers, comparators and projections are written inside React function bodies, closed over component state. To assert that the German notation `1.234,50` parses to `1234.5`, a test must mount an element, fire a synthetic change event, fire a blur, and read the input's value back — six hops to exercise three pure functions. Some logic cannot be reached at any price: the Combobox filter closes over a query state that has no prop to drive it.

The cost is already visible. The hardest correctness in the package — resolving a wall-clock time across a daylight-saving transition — was verified with throwaway Node scripts and has no standing test. A fix landed in two of the four pickers and not the other two, and nothing caught it. The maintainer cannot change this code with confidence, and neither can an agent.

The sibling package shows what the alternative looks like: `@umriss/charts` moved its arithmetic out of React into separate modules and has 73 unit tests. `@umriss/ui` already did this for date helpers and then stopped.

## Solution

Move the pure logic out of the React bodies and into modules that take their inputs as arguments and return results — so a test can call them directly.

Four such modules, grouped by domain concept rather than by the element that happens to use them:

- **`zahl`** — German number notation: parsing, formatting, clamping, and step arithmetic.
- **`optionen`** — option-list logic: the filter predicate, the set algebra behind select-all / select-none / invert, and active-index navigation.
- **`raster`** — the calendar month grid: cell generation, Monday-first offset, range-band resolution, and arrow-key stepping.
- **`skala`** — value-to-geometry projection for the data-visualisation marks.

Each is imported by the React module that used to contain the logic. No public interface changes. No visual change. Nothing a consumer of `@umriss/ui` receives is altered.

The point is not tidiness. It is that after this change there is somewhere for a test to stand, and every later work package — the free-text date parser, the popover primitive, the command palette, the table model — lands on a package that can be verified.

## User Stories

1. As a library maintainer, I want to assert that German number notation parses correctly, so that I can trust `1.234,50` yields `1234.5` without mounting a component.
2. As a library maintainer, I want to assert that a parsed value is clamped to its configured minimum and maximum, so that out-of-range input cannot reach a consumer.
3. As a library maintainer, I want to assert that decimal rounding respects the configured precision, so that a two-decimal field never emits a third decimal.
4. As a library maintainer, I want to assert which characters a numeric field accepts under each configuration, so that a zero-decimal field provably rejects a comma and a non-negative field provably rejects a minus sign.
5. As a library maintainer, I want to assert the step arithmetic including the shift multiplier, so that hold-to-repeat stepping cannot drift.
6. As a library maintainer, I want the empty string and a lone minus sign to parse to "no value" rather than to zero, so that clearing a field is distinguishable from entering zero.
7. As a library maintainer, I want a single decision about whether a keystroke emits a clamped or unclamped value, so that one prop does not carry two contracts.
8. As a library maintainer, I want to assert the option filter predicate directly, so that case-insensitivity and whitespace trimming are covered without typing into a DOM input.
9. As a library maintainer, I want to assert that an empty or whitespace-only search term returns the unfiltered list, so that clearing a search restores every option.
10. As a library maintainer, I want to assert the select-all, select-none and invert operations against a filtered subset, so that bulk actions provably never touch options the user cannot currently see.
11. As a library maintainer, I want to assert that bulk actions skip disabled options, so that a disabled option can never be selected indirectly.
12. As a library maintainer, I want to assert that bulk actions preserve selections outside the filtered subset, so that filtering then selecting-all does not silently discard earlier choices.
13. As a library maintainer, I want to assert active-index wraparound in both directions, so that arrowing past either end of a list behaves predictably.
14. As a library maintainer, I want an explicit decision about what the active index becomes when the selected option is absent from the filtered list, so that "not found" is not silently converted to "first item".
15. As a library maintainer, I want to assert that a month grid always yields the same number of cells, so that panel height provably never changes with the month.
16. As a library maintainer, I want to assert the Monday-first offset across month boundaries, so that the first row is correct for a month beginning on any weekday.
17. As a library maintainer, I want to assert grid generation across leap years and daylight-saving transitions, so that date arithmetic is proven rather than assumed.
18. As a library maintainer, I want to inject the reference date used for "today", so that grid tests are deterministic and do not depend on when they run.
19. As a library maintainer, I want to assert that a backwards range resolves to an ordered band, so that the silent-swap rule is verified in one place instead of six.
20. As a library maintainer, I want to assert the difference between a committed range and a hover-preview range, so that the preview band cannot be confused with a selection.
21. As a library maintainer, I want to assert the arrow-key stepping table and the month-spill rule together, so that focus provably never leaves the visible month without the view following.
22. As a library maintainer, I want to assert the sparkline projection arithmetic, so that a flat series does not divide by zero and a series maps into its padded bounds.
23. As a library maintainer, I want to assert the meter clamp, so that values below zero or above one cannot escape as invalid geometry.
24. As a library maintainer, I want each extracted module to live next to the element that owns it, so that locality is preserved and I do not have to hunt for the logic.
25. As a library maintainer, I want logic shared by two or more elements to live in the shared location, so that neither element has to import sideways from the other.
26. As a library maintainer, I want the extraction to leave every public export unchanged, so that the refactor cannot break a consumer.
27. As a library maintainer, I want the extraction to leave rendered output unchanged, so that the existing screenshot baselines still pass and prove it.
28. As an agent picking up a later work package, I want a worked example of the seam shape and the test convention, so that I extend the pattern instead of inventing a new one.
29. As an agent implementing the free-text date parser, I want an established home for pure date logic, so that the new parser has somewhere obvious to land.
30. As an agent implementing the popover primitive, I want a working unit-test harness in this package, so that a nine-module migration is verifiable rather than hopeful.
31. As a maintainer reviewing a pull request, I want a failing unit test to name the rule that broke, so that diagnosis does not start from a red screenshot that only says "the tile changed".
32. As a consumer of `@umriss/ui`, I want the library's parsing and clamping rules to be covered by tests, so that I can rely on them without re-verifying them myself.

## Implementation Decisions

**Seam placement is decided by ownership.** Logic used by exactly one element is co-located in that element's folder. Logic used by two or more elements goes in the package's shared library location. This follows the convention the package already uses — the calendar date helpers and the daylight-saving resolver already sit beside their pickers — and matches the planned home for the free-text date parser. It deliberately avoids the sideways-import pattern in which one element imports from a sibling.

Under that rule: `zahl` belongs to the numeric input, `raster` belongs to the date-picker folder, `skala` belongs to the data-visualisation folder, and `optionen` goes to the shared location because both the combobox and the multi-select use it.

**The four modules are internal.** None is added to the package's public interface. `@umriss/ui`'s exports are unchanged by this work. Existing public exports stay public; nothing is demoted.

**Every extracted function takes its inputs as arguments.** No extracted function reads component state, a ref, or the current time. Where the logic currently depends on "now", the reference date becomes a parameter, following the convention already specified for the planned date parser.

**Extracted functions return results; they do not perform side effects.** Nothing extracted calls a change handler, sets state, or touches the DOM. The React module keeps the side effects and calls the pure module for the decision.

**`zahl` owns German numeric notation.** Parsing tolerates thousands separators and a decimal comma and distinguishes "no value" from zero. Formatting is the inverse. Clamping applies the configured bounds and decimal precision. Step arithmetic derives the next value from a base, a direction, a step, and a multiplier. The set of permitted input characters becomes a function of the configuration rather than a regular expression rebuilt inside an event handler.

**One contract for the numeric change handler.** Today a keystroke emits the raw parsed value while blur and stepping emit the clamped value, so the same prop carries two contracts and a consumer cannot tell which it received. This is resolved as part of the extraction: the emitted value is clamped on every path, and the in-progress text remains local to the element so that typing is not disrupted. This is a deliberate, visible behaviour change and is called out here rather than smuggled in.

**`optionen` owns option-list logic.** The filter predicate trims and lower-cases the search term and matches against the option label. The bulk operations are set algebra over the filtered, non-disabled subset, and they preserve selections outside that subset. Active-index navigation wraps in both directions. The "selected option is not in the filtered list" case gets an explicit result rather than collapsing to index zero.

**`raster` owns the month grid.** It generates the fixed-size cell array for a given month with a Monday-first offset, resolves a range band from a start, an optional committed end, and an optional hover preview — including the backwards-order swap — and computes the arrow-key step together with whether the visible month must follow. The existing exported date helpers move into it unchanged.

**`skala` owns value-to-geometry projection.** It maps a series into padded bounds, guards the degenerate zero-span case, and clamps a fractional fill. Path-string assembly stays in the rendering module; only the arithmetic moves.

**The React modules become thinner but keep their interfaces.** Each affected element imports its pure module and keeps its props, its rendered markup, and its class names exactly as they are.

**Existing module-scope exports are consolidated, not duplicated.** The date helpers already exported from the calendar module move into `raster` and are re-exported from their current location so that existing importers are unaffected.

**Lint coverage is extended to this package as part of this work.** The repository's lint configuration currently scopes every rule to the charts package, so none of the ui package is checked — the React hooks rules included. This is a prerequisite, not a nicety: the extraction changes hook dependency arrays, and two existing defects in this package are of exactly the kind those rules catch.

## Testing Decisions

**What makes a good test here.** A test calls an extracted function with arguments and asserts its return value. It does not mount anything, does not reach into a React body, and does not assert on class names, element structure, or internal helper names. If a test needs to know how a function is implemented in order to pass, it is testing the wrong thing. The interface is the test surface: if a rule cannot be exercised by calling the module, that is a signal the seam is in the wrong place, not a reason to reach past it.

**Modules under test.** All four: `zahl`, `optionen`, `raster`, `skala`. Each gets its own test file. The React modules get no new tests in this work — their behaviour is already covered, to the extent it is covered at all, by the existing smoke test and the screenshot suite.

**Prior art.** The charts package is the model. It has eight unit-test files covering ticks, scale, layout, hit-testing, materialisation and scene construction — 73 tests, all pure, no DOM — and they live in that package's unit-test directory under the same runner configuration this package already has. Follow that file layout, that naming, and that granularity. The existing ui smoke test is not prior art for this; it is the thing being supplemented.

**Determinism.** No test reads the current time. Where logic involves "today", the test passes a fixed reference date. This matches the convention the existing visual tests use, where the clock is frozen.

**Coverage priorities.** Favour the cases that are currently unverifiable and historically wrong: German notation round-trips, clamping at both bounds, bulk selection against a filtered subset, month grids across leap years and daylight-saving transitions, and the backwards-range swap.

**Regression safety.** The existing screenshot baselines are the guard that rendered output did not change. They must pass unchanged — no baseline updates as part of this work. A changed baseline means the extraction altered rendering and should be treated as a defect, with one exception: the numeric change-handler contract decided above may alter emitted values, and any resulting demo difference must be reviewed deliberately rather than accepted by regenerating.

**The two red interaction tests stay red.** They fail because Playwright cannot click a visually hidden checkbox input behind its decorative spans. That is unrelated to this work and is not fixed here.

## Out of Scope

- **The table model** (review candidate 02). It is the recommended next step and the same kind of move, but it changes the table's interface and the demo's call site, so it belongs in its own spec.
- **The popover primitive** (work package B.4). This spec exists partly to make that migration verifiable; it does not begin it.
- **The free-text date parser** (work package B.1). This spec prepares its home. It does not implement the grammar.
- **Any change to the public interface of `@umriss/ui`.**
- **Any visual change**, other than as a reviewed consequence of the numeric change-handler contract.
- **Fixing the checkbox interaction that keeps two Playwright tests red.**
- **The picker interface divergences** (review candidate 04) — the union-shaped props whose invariants disagree, and the date picker emitting two differently-shaped values.
- **Relocating the shared picker exports** (review candidate 05), beyond the calendar helpers that move into `raster`.
- **`packages/charts`**, which is a finished V0.

## Further Notes

The review that produced this spec found 48 sites where pure logic sits inside a React body. This spec covers the four highest-value groups. The remainder — toast timing arithmetic, tab and menu index arithmetic, the multi-select chip-fitting algorithm — are left deliberately. The chip-fitting algorithm in particular reads element widths and is untestable in jsdom by construction; it needs a different treatment and probably its own seam.

This work introduces four domain terms that the project has no glossary entry for: `zahl`, `optionen`, `raster`, `skala`. The repository has no `CONTEXT.md` yet. When one is created, these belong in it, along with the distinction between a committed range and a hover-preview range, which currently exists only as an implementation detail of the calendar.

No ADRs exist in this repository, so nothing here contradicts a recorded decision. Two decisions in this spec are the kind worth recording once an ADR directory exists: the ownership rule for seam placement, and the single-contract rule for the numeric change handler.

The handoff document sequences the popover primitive first, on the grounds that four later work packages depend on it. That dependency reasoning is sound. The review's argument for doing this spec first is about risk, not dependencies: the popover work migrates nine modules of dismissal, focus and positioning behaviour across a test surface that cannot detect a regression in any of it. This spec is cheaper, carries no visual risk, and produces the harness that makes the popover migration checkable.
