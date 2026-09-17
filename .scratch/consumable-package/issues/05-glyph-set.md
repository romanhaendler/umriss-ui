# 05 — One glyph set

Status: done

Spec: `.scratch/consumable-package/spec.md`

## Scope

A shared glyph set drawn to a single specification: one nominal size, one stroke
width, current colour, no fills, one corner treatment.

Today each component draws its own glyphs inline. There is no stroke width and
no optical size that a new glyph has to match — only whatever the nearest
existing component happened to do. That is drift which is invisible for a year
and then obvious all at once.

## Acceptance

- The set exists, with the specification written down beside it.
- Existing inline glyphs are migrated **only where the migration is provably
  pixel-identical**. Where a component's glyph differs from the specification,
  leave it and record the difference in the delivery report.
- No screenshot baseline moves.

## Notes

The "pixel-identical only" rule is the whole safety of this ticket. A migration
that quietly changes twenty glyphs is exactly the kind of change the handoff's
standing instruction forbids, and the screenshot baselines are the guard: a
migration that changes a glyph shows up as a changed picture, which is precisely
the signal that should stop it rather than be re-baselined.

The recorded list of glyphs that differ from the specification is a deliverable,
not a footnote. It is the input to whatever later decides whether to align them.

No behavioural tests. Correctness here is visual.

## Comments

**Implemented, Aug 2026.** The set lies in `packages/ui/src/lib/glyphen/`, the
specification as a comment above it and in short form in
`packages/ui/GLYPHEN.md`.

The specification in six points: nominal size `0 0 10 10`, stroke width 1.4,
`currentColor`, no fill, round caps, `aria-hidden`. The 1.4 is not the most
beautiful weight but the most frequent — with six of the eight crosses in the
stock it was already there.

**Only what could be taken over pixel-identically was taken over.** The proof is
the screenshot suite: 91 Playwright tests green, not a single baseline moved.
Eleven glyphs in 17 places; the biggest single gain is the small cross, which
stood identically in the code six times.

**The list of divergences is the real deliverable** and stands in full in
`GLYPHEN.md`. The finding in one sentence: the same cross shape exists in the
stock in **three** versions (weight 1.4 six times, 1.5 in the alert, 1.6 in the
tag, plus a fourth at nominal size 8 on the multiselect chip), and the same
right-pointing arrow has different paths in the calendar and in the table row.
That is exactly the drift the ticket suspected.

Not aligned — deliberately. A move that quietly changes twenty characters would
be the change the baselines are meant to prevent.

### Follow-up to the review: too much taken over

The spec review showed that the first version violated the second half of the
acceptance: "Where a component's glyph differs from the specification, **leave
it** and record the difference." What had been taken over was everything that
could be taken over pixel-identically — and thus also the close cross (nominal
size 12), the paging arrows (weight 1.5) as well as the calendar leaf and the
clock (nominal size 14, weight 1.3).

That is taken back. The set now contains only `KreuzGlyph`, `PlusGlyph` and
`MinusGlyph` — the three that satisfy the specification. Everything else has
stayed where it was, and stands in `GLYPHEN.md`.

The reason is not literal-mindedness: a set that collects its own exceptions is
no longer a standard but a drawer — a new character could then invoke any
exception at all. The price is visible and deliberate: the close cross still
stands twice, in modal and toast, the clock twice in both time pickers. These
duplications are the entry in the list that is meant to trigger the later
alignment.

The glyphs now also pass their ref through (README, principle 1).
