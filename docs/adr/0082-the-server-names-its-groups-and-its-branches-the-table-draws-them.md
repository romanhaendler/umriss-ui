# The server names its groups and its branches; the table draws them

Status: accepted
Date:   2026-10

Amends ADR-0072.

ADR-0072 made the server mode a table that asks and is answered. It left two
things out because they are made of rows the table does not hold: the groups of
a million rows, and the children of a branch nobody has loaded. This ADR gives
both the same shape - the table reports what it needs, the application names
the answer, the table computes nothing over rows it does not have.

## Groups from the server

Grouping is a view of the whole set, so the whole set's server answers it.

- **The request carries the grouping.** `TableRequest` gains `grouping` (the
  column ids, outermost first, `[]` by default) and `folded` (the paths of the
  folded groups, `[]` by default). Both are in `requestKey`, so `answers` is
  compared on them, and changing the grouping resets to page one and clears the
  folds - a path names a group of the grouping it was made under - and sends one
  request. A path is the one the view carries; `groupPath(values)` writes it, so
  a server finds a group's fold without parsing a string. The three warnings that
  grouping was "passed over in server mode" go.
- **The answer names its group lines.** `groups`, beside `rows`, holds one entry
  per group the page shows, the outer group before the groups inside it:
  `path` (the values from the outermost level to its own, the value as the
  column's value is - a `Date` for a date), `count` (the rows below it over every
  match), `totals` (by column id, as the footer's `totals`) and `at` (the index in
  `rows` before which its line stands). A page that begins inside a group names
  that group again with `continued: true`, as the browser repeats its headers
  above such a page; they take their room from the page, which the server cuts.
- **A page counts lines.** Headers and rows alike, as the grouped table in the
  browser does (ADR-0042), so `rowCount` counts lines while grouped and the
  pages, "n of m" and the fitted page (ADR-0080) read it as they read rows. A
  folded group comes without its rows; the innermost of several levels, which
  stands on its first row, comes as one folded line when no row of it is on the
  page.
- **The application names the answer; the table computes nothing.** It reads the
  lines out of `groups` (`answeredLines`) and draws them with the parts of the
  browser's grouping - level, fold, label, count, aggregates under their columns.
  A group's selection box and the share bar are not drawn: a server group holds
  rows the table does not, and a share needs the whole.
- **A wrong answer is shown plain.** `groups` missing for a page that has rows, or
  not fitting the grouping (a path longer than the levels, an `at` out of order, a
  row outside every group), warns once in development with the first thing wrong
  and shows the rows ungrouped. An answer to another grouping than the current
  (`answers.grouping`) is the old one still standing and is drawn ungrouped
  without a word.
- **A fold is a request.** Folding a group changes `folded` and asks the server;
  the table keeps the folds of groups on other pages, which it cannot know.

## Lazy branches

(Ticket 40 writes this part: a branch whose children are not loaded, and the
application that loads them on opening.)

## Considered Options

- **A pull contract per level, as AG Grid's server-side row model has it
  (`getRows` for the groups, then again for each group's rows).** Rejected for the
  reason ADR-0072 gave against `getRows`: the table would own fetching, ordering
  and the cache of a tree of requests, and a page would be several answers that
  may not belong together.
- **One array of lines, `{ kind, ... }` in reading order, instead of `groups` beside
  `rows`.** Rejected: the rows are the application's rows with their keys, and a
  selection, a current row and an export read them as they are; a lines array
  would wrap every row to say where a header stands. `at` costs the server one
  number per group.
- **The table counts the groups from the rows it holds.** Rejected: that is a
  count and a sum over one page called the group's.

## Consequences

An application that passes no `grouping` sees no change, apart from two members
in the request. A server that ignores `grouping` and `folded` answers ungrouped,
and the table says nothing about it unless `groups` is also missing while a
grouping is set. Selecting a group, folding all groups, and exporting a grouped
page are the server groups' follow-up and are not part of this decision.
