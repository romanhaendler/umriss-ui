# 06 — The glyph, the wording, the tile, the record

Status: done

Spec: `.scratch/tree-view/spec.md`
Blocked by: 02, 03, 04, 05

## Scope

Everything that makes the tree part of the library rather than a component that
happens to live in it.

- **The chevron joins the shared glyph set**, drawn to the specification — the
  nominal box, stroke weight `1.4`, `currentColor`, stroke rather than fill,
  rounded caps and joins, and hidden from assistive technology.
- **The table's existing inline chevron stays where it is.** It is drawn at a
  stroke weight the specification does not permit, and redrawing it would move a
  screenshot baseline it has not earned. The glyph document's own precedent is
  that such glyphs were left alone; **record it in that document's list of known
  divergences**, naming the weight and the reason. That list is what the document
  is for.
- **Wording through the wording seam**: opening and closing a branch, the
  checkbox's accessible name, the search field's placeholder, and the empty state
  when nothing matches. Every entry present in the default German dictionary, an
  individual override falling back to the default rather than rendering a key.
- **A demo tile**, in the library's demo, showing a tree someone would actually
  build: several levels, a branch with children checked in part so the
  indeterminate state is visible, a checked branch, an active node, and the search
  narrowing it.
- **Screenshot baselines** for the tile in both themes.
- **The tile joins the automated accessibility sweep.**
- **A capability record** for the tree — each behaviour with the level it is
  proven at, in the form the charts package uses. Claim no level that is not
  actually in place.

## Acceptance

- The new glyph satisfies every point of the specification, and the glyph
  document's divergence list names the table's chevron with its weight and the
  reason it was left.
- No existing screenshot baseline moves — including the table's, which is the
  point of leaving its chevron alone.
- The tile's baselines exist in both themes and show all three checkbox states.
- The wording tests cover the new entries, including that an override of one entry
  leaves the others at their defaults.
- The accessibility sweep passes on the new tile, **or** the delivery report says
  plainly that it could not be run and why.
- The capability record names no behaviour that is not implemented and claims no
  proof level that does not exist.

## Notes

**The accessibility sweep currently cannot run.** `@axe-core/playwright` does not
resolve from this package, which also breaks the package's type check and any full
browser run. This predates this work entirely. Fix it if the fix is small, and if
it is not, say so in the delivery report rather than quietly dropping the
acceptance point — a sweep that was not run is a fact about this delivery, not a
detail.

The tile is documentation as much as it is a test. A file tree or a category
structure someone would recognise beats four levels of Node A / Node B: the
indeterminate state in particular only makes sense when the thing above it is
something a person would want to check.

The glyph decision is the one to read carefully rather than shortcut. The
temptation is to migrate the table's chevron too and re-baseline "just those two
screenshots". The glyph document already faced that trade-off and chose the other
way, and following a documented standard beats an instinct — the divergence list
exists precisely so that this stays a recorded decision instead of an oversight.
