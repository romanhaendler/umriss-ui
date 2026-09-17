# Spec: The table as a surface people work in

Status: done

Superseded by: `.scratch/umriss-table/spec.md` (ADR-0017). Kept for its reasoning; the pure modules it produced move to `@umriss/table` unchanged.

Origin: library inventory, 23 Aug 2026 — rank 2 of four. Extends `table-model`, which is already delivered. Not covered by the library handoff, except that its inline-cell-editing package assumes some of what this establishes.

Sequencing: unblocked — the model and its stateful companion already exist and own the pipeline, so this can start immediately. Depends on the removable tag from `foundation-primitives` for the active-filter strip; that one item can be stubbed if the two run in parallel, but the strip should not ship with a hand-built chip.

---

## Problem Statement

The table model gave the pipeline a home. Filtering, sorting and paging happen in one place, in a fixed order, with the guarantees written down. That was the right first move, and it is finished.

What it did not change is the shape of the interaction. The model owns what the developer used to assemble by hand; it does not yet own anything the *user* does to a table beyond searching, sorting one column and turning pages. Everything else a person expects to be able to do to a dense table is still absent, and absent in a particular way: not missing from the markup, missing from the model, so that adding it in an application means keeping a second pile of state beside the model and hoping the two agree.

A user cannot hide a column. In a table with fourteen columns of which they care about five, that is the difference between a usable view and a horizontal scroll. They cannot reorder columns, so the two they compare constantly stay eleven columns apart. They cannot widen a column whose contents are clipped, because widths are whatever the browser decides. They cannot open a row to see the detail behind it; the only way to see more is to navigate away and come back, losing the filter and the page. They cannot see, as a set, what they have filtered to — the search box holds its text and the column filters hold theirs, and nowhere does the table say "you are looking at 43 of 1,204 rows because of these three conditions", nor offer to clear them.

They cannot share what they are looking at. A view assembled from a search term, a sort, a page size and three column filters exists only in one browser tab; the link in the address bar describes none of it. This is the one that costs most in practice, because the workaround is a screenshot pasted into a message with a paragraph of instructions for reproducing the view.

They cannot get the data out. The rows are on screen, filtered exactly as wanted, and the only route to a spreadsheet is selecting the visible page with the mouse. They cannot sort by two things at once, so "by department, then by budget descending" is not expressible. And past a few thousand rows the only strategy is paging, because every filtered row is rendered.

Each of these is a normal expectation of a table in an administrative application. Taken together they are the difference between a component that displays data and a surface people work in.

## Solution

Extend the model. Almost all of this is state the model should own rather than markup the application should write: which columns are visible and in what order, how wide each is, which rows are expanded, how many sort levels are active. Put it there, and the additions compose with what already exists — they serialise together, they reset together, and the visible column count that the empty state and the footer already derive keeps being derived correctly without anyone maintaining it.

Nine additions. Seven are extensions of the model and its companion and touch rendering only to consume what the model returns. Two genuinely change rendering: column widths, which is the first thing to modify the header cell, and virtualisation, which needs its own scroll container and is the one item that may reasonably be delivered separately.

Two constraints frame the work. The model stays synchronous and stays client-side: it operates on rows it is handed, and there is no server-driven mode. And the library keeps holding no business logic — it renders an active filter and removes it, without knowing what the filter means, exactly as it renders a status badge without knowing that a status is green.

## User Stories

1. As an end user, I want to hide columns I do not need, so that a wide table fits my screen without horizontal scrolling.
2. As an end user, I want to reorder columns, so that the two figures I compare can sit next to each other.
3. As an end user, I want my column choices to survive a page change and a re-sort, so that arranging the table is worth doing.
4. As an end user, I want to widen a column whose contents are clipped, so that I can read a long name without hovering it.
5. As an end user, I want to double-click a column edge to fit it to its contents, so that I do not have to drag to find the right width.
6. As an end user, I want to open a row and see its detail below it, so that I can check something without losing my filter and my page.
7. As an end user, I want to open several rows at once, so that I can compare their detail.
8. As an end user, I want to open and close a row from the keyboard, so that the detail is not mouse-only.
9. As an end user, I want to see every condition currently narrowing the table as a set, so that I understand why I am looking at 43 rows instead of 1,204.
10. As an end user, I want to remove one condition without touching the others, so that widening a search is one click rather than a reconstruction.
11. As an end user, I want to clear all conditions at once, so that getting back to everything is one action.
12. As an end user, I want the address bar to describe the view I have built, so that I can send someone a link instead of a screenshot and instructions.
13. As an end user, I want a link I was sent to open the same view for me, so that we are provably looking at the same rows.
14. As an end user, I want the browser's back button to return me to my previous view, so that exploring a table does not become a one-way trip.
15. As an end user, I want to export what I have filtered to, so that I can continue in a spreadsheet without re-doing the filtering there.
16. As an end user, I want the export to contain the columns I chose to see, in the order I put them, so that it matches the view I built.
17. As an end user, I want the exported file to open correctly in a German spreadsheet, so that decimal commas and umlauts survive the trip.
18. As an end user, I want to sort by a second column while keeping the first, so that "by department, then by budget" is expressible.
19. As an end user, I want to see which sort level each column holds, so that a two-level sort is legible rather than mysterious.
20. As an end user, I want row actions to be available where the row is, so that acting on a row does not mean selecting it and then travelling to a toolbar.
21. As an end user, I want row actions reachable by keyboard, so that they are not effectively hidden from me if I do not use a mouse.
22. As an end user working with a very large table, I want to scroll through all matching rows rather than page through them, so that scanning does not become a sequence of page turns.
23. As an end user, I want the header and the first column to stay put while I scroll a very large table, so that I can still tell what I am looking at.
24. As a developer using the table, I want column visibility, order and widths to live in the model, so that I do not keep a second pile of state that can disagree with it.
25. As a developer using the table, I want the visible column count to keep being derived, so that the empty state and the footer span correctly no matter what the user has hidden.
26. As a developer using the table, I want one pair of functions that turns the view state into a query string and back, so that I can put it in the address bar without inventing an encoding.
27. As a developer using the table, I want that pair to be independent of any particular router, so that the library does not choose my routing library for me.
28. As a developer using the table, I want a link with a stale or malformed query string to produce a valid view rather than an error, so that an old bookmark degrades gracefully.
29. As a developer using the table, I want the export to be a function that returns text, so that I decide how the file reaches the user.
30. As a developer using the table, I want the export to take the filtered set rather than the visible page, so that it cannot silently export one page of a thousand rows.
31. As a developer using the table, I want to describe my active filters as a list and let the library render and remove them, so that I keep ownership of what a filter means.
32. As a developer using the table, I want single-column sorting to keep behaving exactly as it does now, so that adding a second level costs me nothing at existing call sites.
33. As a developer using the table, I want virtualisation to be something I opt into, so that a small table does not pay for a large table's machinery.
34. As a designer reviewing the product, I want the row action column to use the library's quiet gesture — dim at rest, full on hover or focus — so that a table at rest stays calm.
35. As a designer reviewing the product, I want the column menu, the resize affordance and the expander to be drawn from the existing tokens, so that the table does not acquire a second visual vocabulary.
36. As a library maintainer, I want the query-string encoding proven by a round trip, so that a view provably survives being turned into a link and back.
37. As a library maintainer, I want the export tested against values containing the separator, quotation marks and line breaks, so that a single awkward cell cannot corrupt a file.
38. As a library maintainer, I want multi-level sorting tested for stability across levels, so that the second level provably decides only ties in the first.
39. As a library maintainer, I want visible-column derivation tested against hiding and reordering together, so that the two features cannot interact wrongly.
40. As a library maintainer, I want virtualisation's compatibility with the sticky header and sticky first column proven, so that the feature that helps large tables does not break the features that make them readable.

## Implementation Decisions

**The seam is the existing model and its companion.** Seven of the nine additions are extensions of them. Nothing here introduces a second source of truth for view state, and nothing here adds a parallel state container in the rendering layer.

**The column descriptor grows, and only in ways the pipeline or the view state needs.** It gains a human-readable label, because the column menu has to name the column and the export has to write a header; a flag for whether it may be hidden, so that an identifier column can be pinned as always-present; a flag for whether it may be resized; and a default width. It still says nothing about how a cell renders. The existing separation — columns as data for the pipeline, compositional for rendering — is the reason this stays cheap, and it holds.

**Column visibility and order become model state,** and the model returns the visible column descriptors as an ordered list. The column count the empty state and the footer already derive comes from that list, so hiding a column keeps them correct with no further work. The column menu is a rendering component built on the existing menu and popover seam; it does not own the state.

**Sort becomes an ordered list of levels** rather than a single value. Activating a column without a modifier replaces the whole list with that one column; activating with a modifier appends a level, or cycles that level's direction if the column is already in the list, or removes it at the end of the cycle. A single-level list is the existing behaviour exactly, so existing call sites see no change. The header cell shows a small rank indicator only when more than one level is active. The accessibility attribute for sort direction is set on every sorted column, which is correct: the previous rule that exactly one column may claim to be sorted was a fix for two columns disagreeing, not a prohibition on genuine multi-level sort.

**View state and the query string are one pure pair of functions,** one that turns the view state into a query string and one that turns a query string back into view state. The parsing direction is total: unknown keys are ignored, malformed values fall back to defaults, a hidden-column list naming columns that no longer exist drops those names. The companion takes an optional adapter so the application decides how and when the address bar is written. The library does not depend on a router and does not touch history itself.

**Export is a pure function returning text.** It takes the filtered set and the visible column descriptors, and produces delimiter-separated text in German conventions: semicolon as the field separator, comma as the decimal separator, values containing a separator, a quotation mark or a line break quoted and escaped, and a byte-order mark so that a German spreadsheet opens it as the right encoding without an import dialogue. It writes column labels as the header row. The library returns the text; handing it to the user as a file is the application's decision, because that is where the browser, the filename and the timing belong.

**The active-filter strip renders a list the application supplies.** Each entry carries a label, a value description and a way to clear it; the strip renders them as removable tags and offers clearing all. The library never inspects a filter, because deciding that a filter on a status column means something is business logic. The strip sits in the existing toolbar and uses the removable tag from `foundation-primitives`.

**Row expansion is a set of open row keys in the model,** plus a rendering component for the detail row that spans the visible column count. The expander is a real button with the standard expanded and controls attributes; several rows may be open at once. The detail row's content is entirely the caller's.

**Row actions are a trailing cell** that follows the library's quiet gesture: dim at rest, full opacity when the row is hovered *or* contains focus. Tying visibility to focus as well as hover is what keeps the actions reachable from the keyboard rather than merely present in the accessibility tree. Overflow goes into the existing menu.

**Column widths are the first change to the header cell.** A drag handle on the trailing edge resizes; a double-click fits the column to its content. Widths are model state, so they serialise with everything else. The resize handle must not interfere with the existing sort activation on the header, which means the handle owns its own hit area and stops the event.

**Virtualisation is opt-in and is the only item that may be delivered on its own.** It requires its own scroll container and must remain compatible with the sticky header and the sticky first column, which is the hard part and the reason it is sized larger than everything else here. When it is on, paging is off; the two are alternative strategies for the same problem and offering both at once produces a control that contradicts itself.

**The model stays synchronous and client-side.** There is no mode in which sorting or paging is delegated to a server. This was considered and decided against: the data these tables show fits in the client, and virtualisation covers the size case that would otherwise motivate it. Recording the decision here so it is not re-opened by inference.

## Testing Decisions

**What makes a good test here.** The same rule the model established: call the function or the companion, assert the returned view. Which rows, in what order, on which page, with which columns visible in which order, with which rows expanded. No mounting, no assertions on class names or element structure. The additions that are genuinely pure — the query-string pair, the export, the multi-level comparator, the visible-column derivation — carry most of the risk and all of them are testable this way.

**Modules under test.** The model, extended. The companion, for the transitions the model cannot express alone: that hiding a column does not change the page, that changing the sort still resets to the first page, that reordering columns leaves the sort intact. The rendering additions get no unit tests.

**Coverage priorities, in order.**

The export, first, because it is the item most likely to be wrong in a way nobody notices until a file reaches a spreadsheet. Test values containing the separator, values containing quotation marks, values containing line breaks, empty values, numbers formatted in German notation, and the header row taken from the column labels. Test that it exports the filtered set and not the visible page — that assertion is the whole reason the function takes the filtered set as its argument.

The query-string pair, second. Test the round trip for a fully populated view state and for an empty one. Test that parsing tolerates unknown keys, malformed numbers, a page beyond the range, a sort naming a column that does not exist, and a hidden-column list naming columns that do not exist. A malformed query string must never throw.

Multi-level sorting, third. Test that a second level decides only ties in the first, that stability holds within the last level, that activating without a modifier replaces the list, that activating with one appends, and that cycling a column out at the end of its cycle leaves the other levels untouched.

Visible-column derivation, fourth, with hiding and reordering applied together, and with the derived column count checked against the result.

Row expansion state and the reset rules, last, as light coverage on the companion.

**Rendering additions are covered where they already would be.** The column menu, the filter strip, the expander, the row action column and the resize affordance each appear in the demo's table tile, which puts them under the existing smoke test and the existing screenshot baselines in both themes. Keyboard behaviour — opening a row, reaching row actions, operating the column menu — extends the existing interaction suite.

**Virtualisation needs its own interaction test** and cannot rely on screenshots, because what it must prove is behavioural: that scrolling reaches rows that were never rendered, that the sticky header and sticky first column stay put, and that keyboard navigation into an unrendered region works.

**Fixture data belongs in the test.** The rule the model's spec established holds: do not assert against strings drawn from the demo's rows.

**Prior art.** The model's own test suite is the direct precedent for everything pure here. The existing interaction suite is the precedent for the keyboard assertions.

## Out of Scope

- **Server-driven filtering, sorting or paging.** Decided against; the model stays synchronous.
- **Grouping and subtotal rows**, and tree-shaped tables. Neither exists today and neither is added.
- **Inline cell editing**, which is handoff work package B.10 and builds on this rather than being part of it.
- **Column pinning beyond the existing sticky first column.**
- **Spreadsheet-native export formats.** Delimiter-separated text only.
- **Persisting the view state anywhere other than the query string** — no local storage, no server-side saved views.
- **Any change to how a cell renders.** Cells stay compositional and stay the caller's.
- **Reading or writing browser history.** The library produces and consumes a query string; the application owns navigation.

## Further Notes

This is nine features in one spec, and it should not be nine features in one change. A sensible order runs cheapest-and-most-independent first: the export, then the query-string pair, then the filter strip, then multi-level sorting — four items that are almost entirely pure functions with their own tests, and none of which touches rendering meaningfully. Then column visibility and order with the column menu, then row expansion, then row actions. Then column widths, which is where the header cell changes. Virtualisation last and possibly separately.

The query-string pair is the item worth doing even if the rest slips. It is small, it is pure, it is testable in isolation, and it converts a table from something a person has in front of them into something they can hand to a colleague. Nothing else in this spec changes what the product can do by as much for as little.

One tension to watch: the column menu, the filter strip and the row action column all add furniture above and beside a table whose design concept is quietness. Each is justified, and all three at once may not be. The demo tile should show them together at least once, so that the combined weight is a thing somebody looked at rather than a thing that accumulated.

The terms this introduces — the view state as a serialisable whole, a sort level, the visible column list as distinct from the column descriptors, the active-filter list — extend the vocabulary the model's spec began and belong in a glossary alongside it.
