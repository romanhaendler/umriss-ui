# 02 — Showing what cannot be checked

Status: done

Spec: `.scratch/tree-view-reach/spec.md`
Blocked by: 01

## Scope

The interface for the two new states, and the one event the caller needs.

- **A disabled node looks muted and keeps its focus ring.** It is navigable:
  arrow keys reach it, it can be activated, it is a legitimate place for the
  keyboard to be. Only its checkbox is inert — **inert rather than absent**, so
  the column does not shift and the user can see what the state is.
- **An unloaded branch looks like a branch**: it carries a chevron, because there
  is something there. Opening one is reported to the caller and shows a loading
  indication until the data arrives.
- **The accessibility layer tells the truth about both.** A disabled node reports
  that its checkbox is unavailable; an unloaded branch reports that it is a
  branch. Neither is hidden from assistive technology.
- **A filtered tree marks its unloaded branches**, so a user can see where the
  search stopped looking rather than concluding something is absent.
- **The caller is told when an unloaded branch is opened**, and that is all the
  component does about loading. It does not fetch, retry or cancel.

## Acceptance

- In jsdom: a disabled node is in the flattening, reachable by arrow keys, and
  can be activated; its checkbox does not respond to a click and no check is
  reported.
- In jsdom: the checkbox of a disabled node is present, not absent.
- In jsdom: opening an unloaded branch reports it exactly **once** — count the
  calls, do not compare the result.
- In jsdom: an unloaded branch reports itself as a branch to assistive
  technology, and its checkbox does not respond.
- A screenshot of the tile shows a disabled node, an unloaded branch and a
  loading indication, in both themes.
- No existing screenshot baseline moves except the tree's own tile.

## Notes

"Inert rather than absent" is the detail worth care. A missing checkbox reads as
"this node has no checkbox", which is a different statement from "you may not
tick this one" — and it moves everything after it in the row.

The loading indication belongs to the caller's data, not to component state: the
branch is unloaded until the caller says it is not. Do not add a "loading" flag
the component owns; that is the first step towards the component fetching, which
ADR-0005 keeps outside on purpose.

Count the report of an opened branch. The last package shipped a handler that
fired twice and appeared to work because both calls computed the same thing.
