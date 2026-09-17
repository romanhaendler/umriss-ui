# 03 — Active-filter strip

Status: done

Blocked by: `.scratch/foundation-primitives/issues/04-removable-tag.md`

Spec: `.scratch/table-surface/spec.md`

## Scope

A strip in the existing table toolbar that shows every condition currently
narrowing the table as a set, and offers to clear them.

- Renders a list the **application supplies**. Each entry carries a label, a
  value description and a way to clear it.
- Renders the entries as removable tags; offers clearing all.
- Shows the count relationship — how many rows match out of how many there are.

The library never inspects a filter. Deciding what a filter on a status column
*means* is business logic and stays with the application, exactly as the library
renders a status badge without knowing that a status is green.

## Acceptance

- Demo: the table tile with a search term and two column filters active, showing
  the strip, removing one condition, and clearing all.
- Interaction test: removing one condition leaves the others intact.
- Screenshot baselines in both themes, including the empty case where the strip
  is absent rather than present-and-empty.

## Notes

Blocked on the removable tag. If the two run in parallel the strip can be built
against a stub, but it must not ship with a hand-built chip — that would create
the second implementation this ordering exists to prevent.

Watch the combined weight: this strip, the column menu and the row action column
all add furniture to a table whose design concept is quietness. Each is
justified; all three at once may not be. See the note at the end of the spec.
