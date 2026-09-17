# 02 — The alarm list as a surface

Status: done

Spec: `.scratch/shopfloor-instruments/spec.md`
Blocked by: 01

## Scope

`<AlarmList>`: the model made operable.

- **Acknowledgement of one alarm and of a selection**, reusing the existing
  selection helper so that "all filtered" versus "this page" behaves as it does
  everywhere else in this library.
- **The component reports the size of the set it would acknowledge** before
  acting. Whether that becomes a confirmation is the application's decision — a
  confirmation the operator cannot switch off is its own hazard in a flood.
- **A flood is marked, not hidden.** All forty rows are there; the marking says
  they arrived together.
- **A chattering type shows its count**, so one flapping sensor occupies one row's
  worth of attention rather than forty.
- **Standing duration is visible**, derived from the passed reference time.
- **One polite live region** reporting the count of standing unacknowledged
  alarms. Not each arrival: a list that announces forty arrivals during a flood
  gets switched off, and then it announces nothing at all. The count is the
  actionable fact.
- **Priority is carried in text as well as colour**, like everything else in this
  library.

## Acceptance

- jsdom: the live region is polite, contains the count of standing unacknowledged
  alarms, and updates when that count changes — and does **not** update when an
  unrelated alarm is acknowledged elsewhere in the list.
- jsdom: priority is present in the row's text, not only in its styling.
- A new browser interaction file, beside the existing per-surface files (basis,
  table, virtual, tree): acknowledging one alarm fires **once**; acknowledging a
  selection of five fires with five keys; acknowledging the same selection twice
  fires twice. **Count the calls.** Comparing the resulting set cannot distinguish
  working once from working twice.
- A browser test: the reported set size matches the selection, and matches the
  filtered set rather than the visible page when the selection is "all filtered".
- A screenshot tile showing all four lifecycle states, a flood marking and a
  chatter count, in both themes.
- axe passes at WCAG 2.1 AA in both themes with no new suppression entry.

## Notes

The live region is where this can go wrong quietly. An assertive region, or one
that announces each arrival, is worse than none: the first thing an operator does
with a screen reader that shouts during a flood is turn it off, and then the
useful announcement is gone too. Polite, and the count only.

Reuse the selection helper rather than building an acknowledgement selection. The
rules about filtered-versus-visible are already settled there and re-deciding them
here would give the same interface two behaviours.
