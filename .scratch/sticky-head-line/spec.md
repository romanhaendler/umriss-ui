# A sticky header row keeps its line while the rows scroll

Status: done
Date:   2026-10-20
Origin: a report from the maintainer: on a page with no card and no background
of its own, a scrolled table lets a row run out of view right under its header
row, with nothing between them. Reproduced the same day on the `sticky-parts`
example of the Width and pinning page, in Chromium and WebKit.

## Problem Statement

A table with `stickyHeader` holds its header row while the rows scroll, so the
column names stay in view. At rest a strong hairline separates the header row
from the first row. As soon as the reader scrolls by a single pixel, that line
is gone: the header row stays where it is, but its line scrolls away with the
rows. The rows then run out under the header row with nothing between them -
a sliver of the topmost row, the bottom of its checkbox and the descenders of
its text, stands directly against the column names.

Inside a card the frame's edge and surface soften it. On a page with no card
and no background of its own, it reads as a rendering fault: the header row
seems to float, and the reader cannot tell where the head ends and the rows
begin.

The cause is the table's collapsed border model. In a collapsed table a
border belongs to the table's grid, not to the cell that declares it; a sticky
cell moves, its border does not. The same model has a second effect in WebKit:
there the line under the header row is painted twice at rest and stands twice
as dark as in Chromium.

## Solution

The header row of a sticky table draws its line itself, so the line stays with
the header row wherever the rows have scrolled. At rest the table looks as it
does now: the line stands on the same pixel row, in the same colour, in light
and dark. Scrolled, the line stays under the column names and the rows
disappear beneath it. In WebKit the line is now as light as in Chromium.

A table without `stickyHeader` is not touched.

## User Stories

1. As a reader of a table with a sticky header row, I want the line under the header row to stay while I scroll, so that I can see where the head ends and the rows begin.
2. As a reader, I want the rows to disappear beneath the line rather than against the column names, so that a half-hidden row does not look like a rendering fault.
3. As a reader scrolling slowly, I want no moment in which a sliver of a row stands directly against the header row, so that scrolling looks calm.
4. As a reader of a table placed on a bare page, with no card and no background, I want the header row to look as finished as it does inside a card, so that the table does not depend on its surroundings to look right.
5. As a reader of a table inside a card, I want nothing to change at rest, so that a table I already know looks the same.
6. As a reader in the dark scheme, I want the line to stay in dark exactly as in light, so that both schemes behave alike.
7. As a reader on a display at 1x, 1.5x or 2x, I want the line to stay at every zoom, so that a fractional zoom does not bring the fault back.
8. As a reader in Safari, I want the line under the header row as light as in Chrome, so that the table's lines have one weight across browsers.
9. As a reader of a grouped table with a sticky header row, I want the group headers that stick beneath the header row to keep looking as they do now, so that the fix does not disturb the grouping's own lines and its stuck shadow.
10. As a reader of a table with pinned columns and a sticky header row, I want the line to run under the pinned header cells as well, so that the line is unbroken across the whole width.
11. As a reader of a table with a sticky row header, scrolling both ways, I want the corner where the header row meets the name column to keep its line, so that the corner looks like the rest of the header row.
12. As a reader of a virtualised table with a sticky header row, I want the line to stay while the virtual window redraws its rows, so that a large table behaves like a small one.
13. As a reader of a table in grid mode, I want the Active cell's ring and the line under the header row not to fight, so that the focus stays readable when the Active cell is in the first row.
14. As a reader using forced colours, I want the line under the header row to remain visible, so that the head stays separated in high contrast too.
15. As a reader whose table has a sorted or filtered column, I want the header cell's own marks to stay as they are, so that the line does not cover a sort indicator or a filter mark.
16. As a reader of a compact table, I want the line to stay at the compact pitch too, so that density does not change the behaviour.
17. As a reader who resizes a column by its grip, I want the grip to stay usable, so that the line drawn on the header cell does not catch the pointer.
18. As an application developer, I want to keep writing `stickyHeader` and nothing more, so that the fix reaches every table without a change on my side.
19. As an application developer who styles the table from my own stylesheet, I want the header row's line to keep its token, the strong hairline, so that a theme that changes the token changes this line too.
20. As an application developer, I want a table without `stickyHeader` to render exactly as before, so that the fix carries no risk for tables that never scroll.
21. As a maintainer, I want one browser test that scrolls a sticky table and finds the header row unchanged, so that the line cannot quietly scroll away again.
22. As a maintainer, I want the test to need no stored image of its own, so that it holds in every engine and at every scale without a baseline to renew.
23. As a maintainer, I want the renewed screenshots of sticky tables limited to the WebKit change of the line's weight, so that a review sees only the intended difference.

## Implementation Decisions

- The change lives entirely in the table's stylesheet; no component, prop, hook or type changes, and the package's API listing stays as it is.
- Only the sticky case changes. Under `stickyHeader`, the header cell's own bottom border is made transparent - it keeps its width, so the table's layout and the measured head height that the sticking group headers stand under (`--u-table-head`) do not move - and the header cell draws the line as a pseudo-element of its own: absolutely placed along its bottom edge, the full width of the cell, carrying a 1px border in the strong hairline token, and taking no pointer.
- The line is drawn as a border, not a background: a border stays visible in forced colours, a background does not.
- The line is not drawn as a `box-shadow`: Chromium does not paint a box-shadow on a cell of a collapsed table (the stylesheet already records this for the pinned blocks' edge shadows).
- The pseudo-element stands one pixel below the header cell's own box. In a collapsed table the grid's line lies just outside the cell; placed at the cell's bottom edge, the drawn line would stand one pixel higher than the line at rest does today.
- The header cell's `::after` is free; the pinned blocks' edge shadow uses `::before` on the same cells and is left alone.
- The table keeps `border-collapse: collapse`. Switching the whole table to separate borders would fix this one line and move every other line of the table; that is out of proportion.
- A candidate implementation of exactly this stands uncommitted in the working tree of `main` at the time of writing; the agent checks it against this spec and the tests below rather than starting over.

## Testing Decisions

- A good test here describes what a reader sees, not which CSS draws it: the header row must look the same scrolled as at rest. It does not read computed styles, class names or pseudo-elements.
- The seam is one Playwright browser test in the table's browser feature tests, beside the existing test that the row header sticks while scrolling sideways. It opens the `sticky-parts` example on the Width and pinning page, takes an image of the header row including the one pixel row beneath it at rest, scrolls the table's scroll area down by part of a row and by more than a row, and expects both images to equal the one at rest. Comparing against its own image at rest needs no stored baseline, so it holds in every project and scheme the suite runs.
- The existing screenshot tests of the examples with a sticky header row are renewed where they change. Expected: no change in Chromium; in WebKit the line under the header row is lighter, since it is no longer painted twice. Any other difference is a defect, not a baseline to accept.
- Prior art: the sticky row header test in the browser feature tests (scrolls the same example sideways and checks what stays in view), and the grid test that the keys keep the Active cell clear of the sticky head and the pinned block.
- `pnpm check table` passes; it covers lint, types and unit tests, none of which can see this change but all of which must stay green.

## Out of Scope

- The line under a sticky group header, the stuck shadow under it, and the pinned blocks' edge shadows - they already draw on their own cells.
- A shadow under the header row while rows lie beneath it, as the group headers have. It would be a design change, not a fix.
- Changing the table's border model from collapsed to separate.
- The other lines of a collapsed table that WebKit may paint twice. Only the line under the header row is in scope.
- Sticky heads in other packages: only `@umriss-ui/table`'s stylesheet is touched.

## Further Notes

- Running the visual suite: at the time of writing, the installed Playwright looks for a Chromium build that is not in the local browser cache, and every visual test fails at launch in about a millisecond. `pnpm exec playwright install chromium webkit` brings the expected builds; the suite is then run on a quiet machine, under `caffeinate`, with `DEMOS=table`.
- The changelog entry at release is a fix in `@umriss-ui/table`: a sticky header row keeps its line while the rows scroll, and in Safari the line no longer stands twice as dark.

## Comments

### Delivered - 2026-10-20

On the branch `sticky-head-line`, two commits: the fix with its test, and the
test's scroll offsets rounded to whole pixels.

- The line is drawn as the spec decides, with one addition: the pseudo-element
  carries the surface as its background. The strong hairline is translucent,
  and without a surface under it the scrolled rows showed through the line;
  the new test caught it.
- The browser test compares the header row and the pixel row of its line,
  clipped to whole pixel rows, at rest and scrolled by half a row and by a row
  and a half. Red against the old stylesheet, green with the fix, in
  `table-light`; the file skips behaviour tests in `table-dark`.
- No screenshot baseline changed: the full table suite ran 678 passed, 220
  skipped. The visual suite has no WebKit project, so the WebKit claims above
  (the line painted twice at rest, the lighter baselines) come from a manual
  check only and were not part of the suite.
- Left as they were, after review: a stuck group header still meets the header
  row with no line between them - the tone of the group header separates them,
  and the baseline was the same before the fix. The sticky rules reach a table
  nested in a row of a sticky table, as `.sticky .th` did before this change.
