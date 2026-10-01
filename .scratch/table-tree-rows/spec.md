# Tree rows: drilling down a hierarchy inside a table

Status: ready-for-agent
Date:   2026-10-01
Origin: "Tree data" in `.scratch/comparison-roadmap/spec.md` ("Later"), and an
outside draft (`~/cc/hr/umriss-table-tree-rows.md`) cut down in conversation to
what a drill-down needs. Vocabulary in `CONTEXT.md`, "Trees" (**Node**,
**Branch**, **Leaf**, **Level**, **Flattening**, **Indeterminate**) and "Tables"
(**Row header**, **Filtered set**, **Grouping**, **Row group**). Related:
ADR-0004 (a flat accessibility tree), ADR-0005 (what cannot be checked),
ADR-0017 (columns by composition), ADR-0029 (a row group's form follows its
level), ADR-0032 (what umriss is not), ADR-0034 (grid only on request).

## Problem Statement

Many data-dense screens show a hierarchy whose every level carries the same
figures: an organisation of units under units, regions with their places, cost
centres under cost centres. The hierarchy is not even: one division is five
levels deep, a staff unit one; one country has states, another goes straight to
its cities. The reader compares figures level by level and drills into the
branch that looks wrong.

umriss offers two halves of this and no whole. `TreeView` walks a hierarchy of
any depth, but a node is one label - figures written into it stand in no column
and cannot be sorted, searched or exported. `Table` has columns, but its
**Grouping** builds levels from values of the rows, stops at three levels
(ADR-0029) and computes every group figure itself. An uneven hierarchy the
application already holds, with figures of its own on every node, does not fit:
its levels are not values of the leaves, a missing level becomes a group "without
value", and a unit's figure is the application's, not a sum the table makes.

The caller today builds one table per level and a breadcrumb to step between
them, and loses the overview: the comparison across levels and siblings at a
glance.

## Solution

`useTable` takes nested rows. One option names the children of a row; the table
shows the roots, and every **Branch** gets a fold in its **Row header** that
opens the next level beneath it, indented. Columns, sorting, search, filters,
selection, row detail, export and virtualisation keep working, each with one
rule for the tree stated below.

```tsx
const t = useTable(units, {
  rowKey: (u) => u.id,
  childRows: (u) => u.children,
  defaultBranches: 1,
});

<t.Table ariaLabel="Organisation">
  <t.Column value="name" label="Unit" rowHeader />
  <t.Column value="budget" label="Budget" />
  <t.Column value="spent" label="Spent" />
</t.Table>
```

`childRows` is the only thing a caller writes for the tree. No new component.

## User Stories

1. As a head of controlling, I want to see the top units of my organisation as rows with their figures, so that I read the whole at a glance.
2. As a head of controlling, I want to open one unit and see its sub-units beneath it, indented, under the same columns, so that I compare a unit with its parts.
3. As a head of controlling, I want to open a branch five levels deep and still read every figure under its column header, so that depth costs me no orientation.
4. As a reader, I want a branch and a sibling leaf of the same level to start their labels at the same indent, so that I see which rows stand on one level.
5. As a reader of an uneven hierarchy, I want a branch that is two levels deep beside one that is five, without empty levels in between, so that the structure stands as it is.
6. As a regional manager, I want countries with states and countries without them in one table, so that I need no placeholder rows.
7. As a planner, I want to sort by a column and have every level order its own rows by it, so that the hierarchy stays intact.
8. As a planner, I want rows without a value in the sorted column to stand last within their level, as in a flat table.
9. As a planner, I want to search for a name and see the matching rows together with the rows above them, so that I see where a match sits.
10. As a planner, I want the rows shown only for a match beneath them to look different from the matches, so that I tell finding from path.
11. As a planner, I want the tree to stand as it did before once I clear the search, so that searching does not rearrange my open branches.
12. As a planner, I want column filters to follow the same rule as the search, so that a filter does not orphan a row from its parents.
13. As a planner, I want "43 of 1,204" to count the matching rows across all levels, so that the number means what it says.
14. As a reader, I want to open all branches at once and close them all again, so that I switch between overview and detail in one step.
15. As a reader, I want Alt-click on a fold to open or close it together with its siblings, as on a group header.
16. As an application developer, I want to say how many levels stand open on the first render, so that the table starts at the depth my users drill from.
17. As an application developer, I want the open branches in the stored view, so that a user finds the tree as they left it.
18. As an application developer, I want a stored branch that no longer exists to fall out of the view, so that stale views do not break.
19. As an analyst, I want the footer aggregate of a tree to count each figure once, so that a parent and its children are not summed together.
20. As an analyst, I want the footer to say that it sums the top level, so that I know what the number stands for.
21. As an analyst, I want to export the tree with a first column "Level", every row of the filtered tree in reading order, open or not, so that the spreadsheet keeps the hierarchy.
22. As a user, I want to select rows on any level, so that I act on units as well as on their parts.
23. As a user, I want "select all" to mean the filtered set across all levels, as in a flat table.
24. As a keyboard user, I want to reach every fold with Tab and open it with Enter, Space or the right arrow, close it with the left arrow, and get to the parent's fold with the left arrow on a closed one, as on a group header.
25. As a keyboard user in grid mode, I want the arrows to keep walking the cells, and the fold to be reached with Enter like any control in a cell.
26. As a screen reader user, I want to hear each row's level, and on a branch whether it is open, so that I know where I am without seeing the indent.
27. As a screen reader user in grid mode, I want the table announced as a tree grid with level, position and set size on every row.
28. As a screen reader user, I want a fold and a row-detail expander on the same row to have different names, so that I know which one I press.
29. As a screen reader user, I want a path row to say that it is one, since its colour alone tells me nothing.
30. As a user who reduces motion, I want the fold to switch without turning.
31. As a user of a large hierarchy, I want a virtualised tree to scroll as smoothly as a flat table of the same row count.
32. As an application developer, I want a development warning when two rows on any levels share a key, so that the fold and the selection do not break silently.
33. As an application developer, I want a development warning when I combine tree rows with grouping or pagination, so that I learn why they are passed over.
34. As an application developer whose data comes flat with a parent id, I want a recipe in the documentation that nests it, so that I need no option of the table for it.
35. As an application developer, I want a documentation page that tells me when to use tree rows, grouping or `TreeView`, so that I choose the right one.

## Implementation Decisions

### The rows and their children

- **`childRows?: (row: Z) => readonly Z[] | undefined`** on the automatic-mode
  options of `useTable`. One row type on every level: the columns are declared
  once (ADR-0017); a hierarchy whose levels differ in kind is a union type the
  caller's columns read, and a column a level has no value for shows the
  **Absent** value.
- A row is a **Branch** when `childRows` returns an array, a **Leaf** when it
  returns `undefined` - the rule of core's `NodeReader`. An empty array is an
  empty branch: no fold, as `allBranches` leaves it out.
- `rowKey` must be unique across all levels; the development check uses core's
  `duplicateKey`.
- The flattening comes from core's `treeModel`. No second implementation of
  "visible in reading order".
- Data with a parent id is nested by the caller; the documentation shows the
  few lines. No `parentKey` option in this step.

### One seam in core

- `treeModel` matches a search today by `label` text alone. The table matches by
  its searchable columns and its column filters. `NodeReader` gains
  **`matches?: (node: K) => boolean`**: when given, a search runs and the
  predicate decides the match - the search text is not read, since a table
  filters by its conditions without any text. The table hands it in only while
  a search or a condition is set. The path rule, the open-without-writing rule
  and everything else stay as they are.
  Additive; `TreeView` is untouched.

### The tree pipeline in the model

- Order: pre-filter → sort each level → flatten through `treeModel` with the
  table's match predicate → window (virtual). No page step.
- The pre-filter applies per row: a row it does not admit is gone with its
  subtree.
- Sorting: every level sorted on its own by the same sort levels, siblings among
  siblings; a child never moves out from under its parent. The sorted children
  are handed to `treeModel` through the reader, memoised per rows and sort.
- A row **matches** when the search holds for it and every column filter holds
  for it. A row is shown when it matches or a descendant matches. A row shown
  only for a descendant is a **Path row** (`pathOnly` in core's flattening).
- While a search or filter is set, a branch shown for a descendant is open
  without writing the open branches; clearing them leaves the tree as it was.
  A branch that matches itself shows its subtree only as far as it is open.
- The **Filtered set** of a tree is every matching row on every level, path rows
  not; "43 of 1,204" and `rowCount` count it, `filtered` holds it in reading
  order. Selecting all and the export act on it as in a flat table, with the
  export exception below.

### The fold and the row header

- The **Row header** column carries the tree: indent per level, then the fold,
  then the cell. Without a `rowHeader` column the first visible column carries
  it, with a development warning.
- The indent follows `TreeView`: a component-local `--tree-indent` of
  `var(--u-space-4)` times the level. No new public token - there is no
  `--u-table-*` token today, and the tree view's indent is not one either.
- The fold looks and moves as the group header's fold of the same table - the
  table has one glyph for "a level opens here". A leaf keeps the fold's space
  empty so that the labels of one level align. A pinned row header keeps its
  indent. `prefers-reduced-motion` turns the rotation into a switch, as the
  group fold does.
- The fold is a button with `aria-expanded`, named from the wording
  `unfoldBranch(row)` / `foldBranch(row)` ("Unfold rows under {row}") - not
  `expandRowNamed`, which is the **RowDetail** expander's name; both can stand
  on one row and must differ, in German as well ("Zeilen unter {row}
  aufklappen" against "{row} aufklappen").
- Keys on the fold are the group fold's: Right opens a closed branch, Left
  closes an open one and on a closed one moves to the parent's fold; Alt with
  the arrows or Alt-click opens or closes the branch and its siblings.
- A path row stands in `--u-color-text-muted`, as in `TreeView`, and its row
  header carries visually hidden text from the wording (`pathRow`), since its
  tone alone is not read out.

### How a branch looks - decided on the prototype

A branch should read differently from a leaf: its figures summarise, a leaf's
are the detail. The group header's form (sunken tone, medium weight, strong line
above, sticking under a sticky head) cannot simply be taken over: in a deep tree
most rows are branches, and the table would turn into the "every second line a
header" ADR-0029 resolved; a leaf stands on any level of an uneven hierarchy, so
the distinction is branch or leaf, never "the lowest level"; and a branch is a
row of data - selectable, with detail and actions - which a group header is not.

Three candidates, rendered side by side on a real, uneven organisation before
the row header is built - a form is judged rendered, not from a sketch:

1. **Weight only** - a branch in `--u-weight-medium`, a leaf regular.
2. **An open branch heads its rows** - an open branch takes the group header's
   tone and line, a closed one is a row like any other: the nearest precedent,
   as a folded group becomes one line.
3. **Form by level** (ADR-0029) - the roots as heads, below them weight only.

The prototype also renders both ways for levels with more fields (next
section), and whether heads stick under a sticky head on five levels. The
chosen form is recorded here, and in an ADR if it departs from ADR-0029.

### Levels with more fields

One column set for all levels (ADR-0017); the documentation names two ways
for leaves that carry more than their branches:

- **Absent cells** - the row type is a union; a column only leaves fill shows
  the **Absent** value on a branch. Right for a few extra fields.
- **Master/detail** - the tree carries the summarising columns, and a leaf's
  `RowDetail` holds a table of its own with every detail column: the employees
  of a unit, the orders of a place. Right when the details are records of
  another kind. No new API: RowDetail renders anything, on every row.

Different column sets per level in one table stay out: one header row describes
one schema, and sorting, filtering, export and the cell-to-header association of
assistive technology would all read a column that means different things on
different rows.

### Open branches and the view

- State: the keys of the **open** branches - default closed. Snapshot:
  `branches: readonly string[]`, `toggleBranch(key)`, `unfoldAllBranches()`,
  `foldAllBranches()`. Not `expanded`: that belongs to RowDetail, and both can
  hold at once.
- `unfoldAllBranches` opens what core's `allBranches` returns.
- `defaultBranches?: readonly string[] | number` on the options - keys, or a
  depth (`1` = the roots open). It is the default `view` leaves out, as
  `defaultSort` and `defaultGrouping` are.
- `TableView.branches` holds the open keys; a key that no longer occurs falls
  out, as `folded` does.
- The `ColumnMenu` panel offers "Unfold all" and "Fold all" where it offers
  the grouping otherwise - the existing `unfoldAll` / `foldAll` wording the
  grouping menu uses. (There is no per-column menu to put them in.)
- "43 of 1,204" counts every row the tree has on every level, as the rows the
  pre-filter admits do for a flat table.

### Footer and export

- The figures of a row are the application's; the table computes nothing for a
  branch (ADR-0032 - a sum beside the application's would be a second truth).
- A column's `aggregate` or `footer` is computed over the **roots that match or
  carry a match** - never over all rows, which would count a parent and its
  children twice. The footer's tooltip says so (`footerTopLevel`). This is the
  one place where a footer departs from "over the filtered set"; the glossary
  entry for **Filtered set** names it.
- `asCsv` and `Export` write every row of the filtered tree in reading order,
  open or not, path rows included, with a first column from the wording
  (`levelColumn`), 1 for a root. A consumer filtering by level gets a whole level.

### Selection

- Flat: a row on any level is ticked on its own; no cascade, no indeterminate
  state. `selection.keys` holds keys from all levels. "All" means the filtered
  set, path rows not included.

### Roles - both modes

- `role="treegrid"`, read mode included - the precedent of a grouped table,
  which is a tree grid in read mode as well. Every row carries `aria-level` (level + 1), `aria-posinset`,
  `aria-setsize` and on branches `aria-expanded` - core's flattening provides
  each. The arrows keep walking the cells (the umriss grid focuses cells, never
  rows - ADR-0034); the fold is a control in the row-header cell, reached with
  Enter and left with Escape like any other, and then answers the keys above.
- Editing a cell changes nothing in the hierarchy.

A branch row carries `data-branch="open" | "closed"` - the hook for its form.


### Combinations

- **Grouping**: excluded. With `childRows` the column menu offers no grouping, a
  grouping handed in is passed over, with a development warning. Both build
  levels; two at once has no reading.
- **Pagination**: off with `childRows`, with a development warning. A page cut
  through a branch tears rows from their parent; a large tree uses `virtual`.
- **Manual mode**: `childRows` is not part of the manual options - a compile
  error, not a warning.
- **RowDetail** and **RowActions** work on every row, branch or leaf. The detail
  expander stands in its own column before the row header, as today.

### Wording

New entries in `Wording`, English and German, typed: `unfoldBranch(row)`,
`foldBranch(row)`, `levelColumn`, `pathRow`, `footerTopLevel`. The level is
read from `aria-level`, so it needs no words of its own. "Unfold all" and "Fold all" reuse the existing entries.

### Glossary

`CONTEXT.md` gains **Tree rows** (a table whose rows have rows) and **Path row**
(shown only because a descendant matches). Branch, Leaf and Level are the
existing tree terms; the glossary's Level counts a root as zero, aria and the
export count from one - the entries say so.

## Testing Decisions

- A good test drives the public surface - `useTable`'s snapshot, the rendered
  table, the exported CSV - and never reaches into the model's helpers.
- **Core seam**: the `matches` reader in core's tree model tests, beside the
  existing search tests: the predicate decides, the path rule is unchanged,
  without it the label decides as before.
- **Model** (prior art `tableModel.test.ts`, `grouping.test.ts`): sort per level,
  search and filters with path rows and without writing the open branches, the
  filtered set and its count, `defaultBranches` as depth and as keys, keys
  falling out of the view, footer over the roots, export order and level column,
  pre-filter removing a subtree.
- **Types** (`types.test-d.tsx`): `childRows` must return the row type;
  `childRows` with `manual: true` is a compile error.
- **Rendered** (prior art `groupingRender.test.tsx`, `gridMode.test.tsx`,
  `rows.test.tsx`): the fold's keys and Alt-click, the column menu entries, the
  development warnings, treegrid attributes, distinct names of fold and
  expander, axe in read and grid mode.
- **Pass-through** (`passthrough` tests): unchanged - no new root element.
- **Prototype** first, beside this file in `prototype/` (as for the grouping):
  the three branch forms and the two ways for richer leaves, judged rendered by
  the user before the row header is built.
- **Rendered**: a table inside a leaf's RowDetail in a tree keeps its own
  sort, search and export.
- **Visual** (`tests-visual`): five levels of an uneven hierarchy, the chosen
  branch form, a master/detail leaf, a pinned row
  header, path rows, compact density, dark scheme, forced colours.

## Out of Scope

Each of these is a later, separate step:

- Unloaded branches (`hasChildren`, `onLoadChildren`) and their loading state.
- `revealRow` - opening the path to a deep-linked row and scrolling to it.
- Ticks that cascade like the tree view's, with an indeterminate branch.
- Row activation - a click on the whole row (`onRowActivate`), the other way to
  drill down: to a page of its own.
- Figures the table rolls up from leaves to branches (`rollup` per column).
- A `parentKey` option for flat data.
- Grouping inside a tree, pagination of a tree, trees in manual mode.
- Different column sets per level in one table (see "Levels with more
  fields" - absent cells and master/detail cover it); moving rows between
  branches.

## Further Notes

- The demo gets a page "Tree rows" under "Grouping": an uneven organisation five
  levels deep with its employees as master/detail in the leaves, regions with
  and without states as absent cells, search with path rows, the flat-data
  recipe, and "When to use something else" - values the rows share →
  Grouping; a hierarchy without figures → `TreeView`.
- `TreeView` dims path nodes but does not announce them. Whether it should take
  the new `pathRow` wording is a question for the tree view, not this spec.
- The fold beside the RowDetail expander is the place to judge rendered in the
  final polish ticket: two chevrons on one row.
- Changelog: table minor, core minor (the `matches` seam and the wording).
