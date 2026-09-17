# 04 — The segment under the pointer

Status: done

Spec: `.scratch/judging-values/spec.md`
Blocked by: 03

## Scope

Making a state band answer the question the reader is actually asking it.

- **A state series' hit is the segment containing the pointer's x**, not the
  nearest point. A new pure function beside `nearestIndex`: the largest index
  whose x is at or below the target, and nothing when the target lies before the
  first point.
- **The existing `nearestIndex` is not reused and not modified.** Every other kind
  asks "which point is closest" and that answer stays correct for them.
- **The tooltip entry for a state carries its segment**: start, end and state
  code, as an optional field on the existing tooltip point type, documented as
  present exactly for state series. Not a second type.
- **Duration is not a field.** It is the difference of two numbers the entry
  already carries, and formatting it requires knowing what the x axis means —
  which charts does not. The caller's renderer computes and formats it; the demo
  shows how.

## Acceptance

- Pure tests: a target in the left half, the exact middle and the **right half**
  of a segment all report that same segment. The right-half case is the whole
  ticket — it is where `nearestIndex` gives the wrong answer, and it is the
  assertion that stops someone reusing it.
- Pure tests: a target before the first point reports nothing; a target beyond the
  last point reports the last segment; a target exactly on a boundary reports the
  segment that starts there, not the one that ends there.
- Pure tests: a hole is reported as a hole, not as the segment before it.
- A browser test in the existing charts interaction suite: hovering a state band
  reports the segment under the pointer, and reports a **different** segment when
  the pointer moves to another one within the same band. Count the reports; do not
  compare a resulting state.

## Notes

The right-half assertion is the reason this is a separate ticket rather than two
lines in 03. Written as a pure test it takes four lines and it permanently closes
the most plausible wrong implementation.

The browser half is not belt-and-braces. The interaction suite drives real pointer
events against a real canvas, and a hit rule that is correct in arithmetic and
wired to the wrong series in the scene passes every unit test in the package.
