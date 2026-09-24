# 05 — Selecting a group, the keyboard and the treegrid

Status: ready-for-agent
Type: task

Blocked by: 04
Spec: `.scratch/table-grouping/spec.md` (Q11, Q12)

## Scope

- Tri-state checkbox on headers and spans over the group's rows in the filtered
  set — other pages and folded groups included. Bulk actions unchanged.
- `role="treegrid"` when grouped, with `aria-level`, `aria-expanded`,
  `aria-setsize`, `aria-posinset`; the fold's accessible name from the wording
  (value, count).
- Left/right fold and unfold, as the core tree view does it (looked at, not
  imported); Alt-click and Alt+arrow for all siblings.
- Focus survives folding: a folded group's focused row hands focus to the group.

## Acceptance

- Tests for selection across pages and folds, the ARIA attributes on every line
  kind, and the keys.
- axe clean on every grouped demo example.
