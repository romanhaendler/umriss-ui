# 07 — The shell moves over

Status: done
Blocked by: 04, 05, 06

Spec: `.scratch/command-palette/spec.md`

## Scope

Delete the shell's private palette — roughly a hundred and fifteen lines — and
render `CommandPalette`, fed from the flat view of the outline. The shell keeps
its own jump function; the palette only reports which id was chosen.

The shell's head comment carries a rule: it is deliberately not built from the
parts it exhibits, so that a fault in an exhibit cannot take the surroundings down
with it. **This ticket breaks that rule once and must say so there**, with the
reason: the palette's quality is only legible in daily use, the shell is the only
place in this repo where it is used daily, and a matcher that feels wrong is
invisible in a demo tile and obvious by the fiftieth ⌘K. A silent exception here
leaves the next reader unable to tell an intention from an oversight.

The four existing Playwright tests for the palette stay. Two of them assert
behaviour this work package intentionally changes — the rest state means the list
is empty before typing, and substring matching becomes subsequence matching.
Amend them, and state in the test file which change was intended, so that a
reviewer can tell an improvement from a regression.

Add the browser-level confirmation of ticket 06: with the pointer parked over the
list, typing must not move the highlight to the row that slides under it.

## Acceptance

- The shell contains no palette implementation of its own.
- The `Palette` function and its stylesheet block are gone, not commented out.
- The head comment carries the exception and its reason.
- The four existing Playwright tests pass, amended where behaviour changed, each
  amendment carrying a stated reason.
- New Playwright test: pointer parked, typing, highlight unmoved.
- The open palette still passes axe.
- ⌘K and `/` still open it, with the guard intact.

## Notes

This is the ticket where the whole thing is first usable, and therefore the one
where the answer to "is it as good as macOS" is actually available. Use it before
declaring it done — fifty openings, not five. The findings belong in the spec's
record, not in a silent adjustment.
