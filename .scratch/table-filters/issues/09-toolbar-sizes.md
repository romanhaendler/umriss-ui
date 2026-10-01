# 09 — One size for the toolbar

Status: done
Type: feature

Blocked by: 08

Spec: `.scratch/table-filters/spec.md` ("The table toolbar"). Asked for by the
user on 1 Oct 2026 on the rendered Filter page: a multiselect of one's own stood
taller than the search beside it, and nothing in the toolbar could be sized.

## Decided

- `Toolbar` takes `size`, `"sm"` (the default, as before) or `"md"`. Every part
  the table puts into it follows: `Search`, `ColumnMenu`, `Export`, "Reset", the
  bulk actions, "New row". Each of `Search`, `ColumnMenu` and `Export` takes
  its own `size`, which wins; outside a toolbar they stay `sm`.
- The core fields a caller puts beside them take the same two sizes:
  `MultiSelect` and `Combobox` gain `size` (`Input`'s precedent: `sm` | `md`,
  default `md`). `Select` keeps `selectSize` - `size` is the native element's
  own.
- In a toolbar, a part is as wide as its content unless it says its own width:
  core fields are 100 % wide and took a line of their own. The search keeps its
  fixed width.
- A page of its own, **Toolbar controls**, after Toolbar: controls at the
  toolbar's size, a larger toolbar, and a dispatcher's bar with three controls,
  the table's parts and a chip from a quick filter beside the table.

## Acceptance

- Unit tests: without a size everything is `sm`; at `md` search, column menu,
  export and "Reset" follow; a part's own size wins.
- No existing baseline moves. New baselines: the page head and the three
  examples of Toolbar controls, and its first example under forced colours.
  The two Filter examples with a multiselect (06, 07) move, since it takes
  `size="sm"` there now.
