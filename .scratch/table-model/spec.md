# Spec: A model for the table

Status: done

Superseded by: `.scratch/umriss-table/spec.md` (ADR-0017). Kept for its reasoning; the pure modules it produced move to `@umriss/table` unchanged.

Origin: `/improve-codebase-architecture` review, 23 Aug 2026 — candidate 02. Not covered by the library handoff.

Sequencing: run after `pure-logic-seams`, which establishes the pure-module pattern this follows. Independent of the picker work; the two can proceed in parallel.

---

## Problem Statement

The table in `@umriss/ui` supplies chrome. Everything that makes a table a table — filtering, sorting, paging, summing, and knowing which rows are selected — belongs to whoever calls it.

The interface costs about twenty-five props to learn, and buys back one styled element per prop rather than one behaviour the caller no longer has to write. The sort direction prop is decoration: it renders an arrow and an accessibility attribute, and nothing sorts. The sort callback carries no column identity, so every call site closes over the column itself. Nothing prevents two columns from both claiming to be the sorted one.

The consequences show up as rules nobody wrote down. Filter before sort before slice, or the page contents are wrong. Reset the page to one after any change to the filter, the sort, or the page size — an instruction repeated five separate times in the one place that calls this table. Take selection identifiers from the filtered set rather than the visible page, or selecting all silently means selecting this page. Keep the empty-state column span in step with the number of columns by hand, because the table never learns how many there are. A page count of zero puts the module into a state that contradicts itself: the status line reads "page 1 of 1" while the next-page control is disabled.

None of this is testable. The pipeline lives inside a demo file, closed over component state, so the only coverage is a browser clicking a column header and reading the first row. And the selection semantics — the genuinely subtle part, where selecting all of a filtered set must preserve choices outside it — are asserted only by the two interaction tests that have been red since the package arrived.

## Solution

Give the table a model: one module that takes rows and a description of the columns, and returns the view — filtered, sorted, paged, summed, with selection resolved.

The model is pure. It performs no rendering and holds no state; a thin companion holds the state and calls it. The caller passes rows in and spreads the result into the markup it already writes.

The rendering modules stay exactly as they are, composed from a table, header cells and data cells. This is deliberate. The caller's table code is roughly forty-seven lines of pipeline and a hundred and sixty-nine lines of markup, and the markup is full of genuinely custom cells — miniature charts, fill bars, status badges, formatted currency. A columns-as-data rendering interface would fight all of that and break every call site. Columns are described as data for the *pipeline*, which needs to know how to read and compare a value; they stay compositional for *rendering*, which needs to stay open.

The review that produced this spec drew the caller shrinking to almost nothing. That was directionally right and quantitatively wrong: the pipeline moves, the markup does not.

Alongside the model, the interface defects above get fixed — sort carrying column identity, the contradictory zero-page state, the page reset, the column span.

## User Stories

1. As a developer using the table, I want to describe my columns once, so that sorting knows how to read and compare each one without me writing a comparator per call site.
2. As a developer using the table, I want the sort callback to tell me which column was activated, so that I do not have to close over the column at every header.
3. As a developer using the table, I want only one column to be the sorted column, so that assistive technology is not told that two columns are sorted at once.
4. As a developer using the table, I want the filter, sort and page steps applied in a defined order, so that I cannot assemble them wrongly.
5. As a developer using the table, I want the page to reset when the filter, the sort or the page size changes, so that I am not left on a page that no longer exists.
6. As a developer using the table, I want the current page clamped to the available range, so that an out-of-range page cannot render an empty table.
7. As a developer using the table, I want a page count of zero to produce a coherent state, so that the status line and the paging controls cannot disagree.
8. As a developer using the table, I want the column count derived from my column description, so that the empty state spans the table correctly without me maintaining a number by hand.
9. As a developer using the table, I want aggregates computed over the filtered set rather than the visible page, so that a summary row reports what the user filtered to.
10. As a developer using the table, I want selection identifiers taken from the filtered set, so that selecting all means all matching rows rather than the current page.
11. As a developer using the table, I want selecting all within a filter to preserve selections outside that filter, so that narrowing the view does not discard earlier choices.
12. As a developer using the table, I want to know how many rows are selected in total and whether the visible set is fully selected, without those two answers being confused.
13. As a developer using the table, I want stable behaviour when I pass a freshly built list of identifiers each render, so that correctness does not depend on my memoising it.
14. As a developer using the table, I want to keep composing my own cells, so that charts, bars, badges and formatted numbers continue to work.
15. As a developer using the table, I want the model available on its own, so that I can drive a table that renders nothing like the default one.
16. As an end user, I want the summary row to reflect what I filtered to, so that the totals match what I can see.
17. As an end user, I want selecting all to mean every row matching my filter, including rows on later pages, so that a bulk action does what I expect.
18. As an end user, I want to stay on a valid page after changing a filter, so that the table does not appear empty.
19. As an end user, I want sorting to be stable for equal values, so that rows do not jump around when I re-sort.
20. As a library maintainer, I want to assert the filter predicate directly, so that matching rules are covered without a browser.
21. As a library maintainer, I want to assert the sort comparators for text and for numbers, so that German text ordering and numeric ordering are both proven.
22. As a library maintainer, I want to assert sort stability, so that equal values provably keep their relative order.
23. As a library maintainer, I want to assert the paging arithmetic, including the boundary where the row count is an exact multiple of the page size, so that off-by-one errors are caught.
24. As a library maintainer, I want to assert the empty-result case end to end, so that the zero-page contradiction cannot return.
25. As a library maintainer, I want to assert the aggregate calculation over a filtered set, so that a summary cannot silently report the unfiltered total.
26. As a library maintainer, I want to assert selection across pages, so that the package's most subtle behaviour is finally covered by something that passes.
27. As a library maintainer, I want to assert that bulk selection within a filter preserves outside selections, so that the rule is verified rather than remembered.
28. As a library maintainer, I want to assert the two selection counts separately, so that "all visible are selected" and "how many are selected overall" cannot be conflated.
29. As a library maintainer, I want the pipeline order enforced by the model, so that it stops being folklore recorded in a comment.
30. As a library maintainer, I want the demo's table rewritten onto the model, so that the demo demonstrates the supported way to use it.
31. As an agent implementing inline cell editing, I want an existing model that owns row identity and the visible page, so that an editor knows which row it is editing.
32. As a maintainer reviewing a change to table behaviour, I want a failing unit test naming the broken rule, so that diagnosis does not begin with a changed screenshot.

## Implementation Decisions

**The seam is the data pipeline, not the markup.** The rendering modules keep their compositional interfaces unchanged. Columns are described as data only for the purposes of the pipeline.

**The model is pure and holds no state.** It takes rows, column descriptors, and the current filter, sort, page and page-size values, and returns the derived view. A thin companion holds those values and calls the model, so that the common case needs no manual wiring; callers who already own their state can use the pure model alone.

**Both are added to the package's public interface.** This is an addition; nothing existing is removed or renamed.

**A column descriptor names the column, says how to read its value from a row, and says how to compare two of them.** Comparison covers at least text ordered by German collation and numeric ordering, with a way to supply a custom comparator. The descriptor also carries whether the column participates in free-text filtering. It does not describe rendering.

**The pipeline order is fixed: filter, then sort, then page.** Aggregates and selection identifiers are computed from the filtered set, before paging. This is the rule the caller currently has to know and get right, and it becomes the model's guarantee.

**Sorting is stable**, and exactly one column can be the sorted column at a time. The sort state is a column identifier and a direction, so the activation callback carries identity rather than requiring the caller to close over it. Activating the sorted column cycles its direction; activating another column moves the sort.

**The page is clamped by the model** rather than by the caller, and resets to the first page whenever the filter, the sort or the page size changes. A result set with no rows yields a coherent state in which the status line and the paging controls agree.

**The column count comes from the column descriptors**, so the empty state and any footer row span the table without the caller maintaining a number by hand.

**Selection folds into the model.** The existing selection hook stays exported and keeps working, and the model composes it. Two behaviours that are currently implicit become explicit and documented: bulk selection operates on the filtered set and preserves selections outside it, and the total selected count and the "all visible selected" flag are separate values with separate meanings. The model does not depend on the caller memoising the identifier list.

**Identifier extraction is part of the column description**, so the model knows row identity without the caller assembling a parallel list.

**The demo's table is rewritten onto the model** as part of this work. It is the only call site and the only place the current pipeline exists, so leaving it hand-assembled would mean shipping a model nothing uses.

**Formatting stays with the caller.** Currency and percentage formatting are presentation and remain in the markup.

## Testing Decisions

**What makes a good test here.** A test calls the model with rows and a state, and asserts the returned view — which rows, in what order, on what page, with what totals and what selection. It does not mount anything and does not assert on class names or element structure. The model's returned view is the whole observable surface; if a test needs more than that, the model is the wrong shape.

**Modules under test.** The pure model. The stateful companion gets light coverage for the transitions the model cannot express on its own — that changing a filter resets the page, that changing page size resets the page. The rendering modules get no new unit tests; their appearance is already guarded by screenshots.

**Prior art.** The charts package is the model to copy: pure modules, plain assertions, no environment, one test file per module under that package's unit-test directory. The `pure-logic-seams` work lands the same pattern in this package first; follow whatever it established.

**Coverage priorities, in order.** Selection across pages and bulk selection within a filter, because that is the package's most subtle behaviour and currently has no passing test at any level. Then paging boundaries, including an exact multiple of the page size and an empty result. Then sort stability and the two comparator kinds. Then aggregates over a filtered rather than a paged set.

**Fixture data.** Use a small purpose-built fixture inside the test, not the demo's data. The existing interaction tests assert literal strings drawn from the demo's rows, which is why editing a demo row breaks the suite; do not extend that coupling.

**Regression safety.** The demo is being rewritten, so its screenshot baselines will change where the rendered output genuinely differs — most likely nowhere, since the markup is preserved, but any difference must be reviewed rather than regenerated on sight. The existing interaction tests must continue to pass, and the two that are red for the unrelated checkbox reason stay red. Their assertions describe behaviour the model now owns, so they are a useful cross-check that the rewrite preserved it.

## Out of Scope

- **A columns-as-data rendering interface.** Rendering stays compositional.
- **Any change to the rendering modules' interfaces**, other than the sort callback carrying column identity and the column span being derived.
- **The table filter's panel behaviour**, which is part of the popover seam work.
- **Inline cell editing**, a later work package that builds on this one.
- **Virtualisation, column resizing, column reordering, grouping, multi-column sort.** None exists today and none is added.
- **Server-driven paging or filtering.** The model is synchronous and operates on rows it is given.
- **Formatting of cell values.**
- **The checkbox interaction defect** keeping two interaction tests red. This work makes the underlying behaviour testable by another route, which is the point, but does not fix the interaction.

## Further Notes

This is the only one of the review's five candidates the library handoff does not already anticipate, and it is the one that converts a genuinely shallow module into a deep one. The handoff's inline-cell-editing package assumes a table that knows its rows and its visible page; that assumption is currently false, and this work is what makes it true.

The review's report drew the caller's code shrinking from two hundred and fifteen lines to about twenty. That overstated the result. Roughly forty-seven lines of pipeline move behind the model; the remaining markup stays, because the cells are custom and should be. The gain is that the forty-seven lines become one interface with tests behind it, and that the five scattered repetitions of the page-reset rule become one guarantee.

Two decisions here are worth recording as architecture decisions once the repository has somewhere to record them: that columns are described as data for the pipeline while rendering stays compositional, and that aggregates and selection are computed from the filtered set rather than the visible page.

The terms this introduces — a table model, a column descriptor, the distinction between the filtered set and the visible page — are new vocabulary for the project and belong in a glossary when one exists.
