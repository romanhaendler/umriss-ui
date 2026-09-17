# 09 — Rubrik Betrieb: four pages, and the closing gate

Status: done

Blocked by: 03, 05

Spec: `.scratch/demo-as-documentation/spec.md`

## Scope

Stat · AlarmList · Sparkline · Meter

The rubric that carries most of the demo's existing prose — four of the seven
`hinweis` paragraphs on the whole page are here — and the one where "Warum so"
is least optional, because these components encode domain decisions a reader
cannot guess from a props table.

**`Stat`.** Its panel already reads like documentation and mostly needs
splitting: a value against its limits; the fourth outcome, where a missing value
is unknown rather than fine; history and target deviation, and why there is no
trend arrow; freshness as a *separate axis* from the verdict. That last one is
ADR-0010 and is the reason a stale value keeps its verdict.

**`AlarmList`.** The lifecycle is the subject: the library receives alarms and
owns what happens next, and never generates them (ADR-0009). Examples should
show an alarm being acknowledged and one going away, not a static list.

**`Sparkline` and `Meter`.** Never shown before. Small pages: what they take,
what they refuse, and the fact that they save colour for meaning.

**JSDoc to write**: Stat 6/14 · AlarmList 4/10 · Sparkline 1/4 · Meter 3/4.

**"Warum so"** — the existing four paragraphs move here verbatim, joined by:
ADR-0006 (the limit model lives in both packages), ADR-0007 (a state is a
number), ADR-0008 (control limits are not specification limits), ADR-0009 (a
lifecycle, not a generation), ADR-0010 (a stale value keeps its verdict). The
reasoning in `.scratch/judging-values/`, `.scratch/shopfloor-instruments/` and
`.scratch/plant-at-a-glance/` is the source for anything not already in an ADR.

**The closing gate.** This is the last rubric, so this ticket flips the JSDoc
gate to failing for the whole documented surface and removes whatever
allow-listing ticket 01 put in to let the migration proceed. After this, a bare
prop anywhere on any page fails `pnpm build:demo`.

## Acceptance

- Four pages; no demonstration left over from the bridge.
- Every `hinweis` paragraph that existed in the old demo is either on a page or
  deliberately dropped, and the handover says which.
- The freshness examples stay frozen against the fixed instant the current panel
  uses, so the baselines do not drift.
- The gate is unconditional: `pnpm build:demo` fails on any undocumented prop on
  any page, with no allow-list.
- `useAktualitaet` is documented on `Stat`.
- `pnpm test:unit`, `pnpm test:visual`, `pnpm lint`, `pnpm typecheck` all pass.
- The spec's `Status:` moves to `done` with a `Delivered:` line naming the
  commits.

## Notes

Colour carries no meaning alone anywhere in this rubric — the verdict is a word
as well as a colour, and the examples must keep showing that. An example that
demonstrates a verdict only by turning orange has documented the wrong thing.

Do the gate flip last, after the four pages are written. Flipping it first turns
this ticket into a hunt through build errors instead of a piece of writing.

## Comments

**Delivered, together with ticket 03** — see the reasoning there: the bridge was
the way to an intermediate state, and there was none.

Every page of this rubric has at least one example; the JSDoc gaps of these
components are closed, and the gate is unconditional for them.

**Addendum from the review.** Two points of the ticket deliberately landed
differently:

* **ADR-0007 is not linked.** The ticket lists it among the ADRs that belong on
  `Stat`. It is about the state band of the *charts*, though — about the fifth
  series kind and about why its accessor yields a number. It has nothing to do
  with `Stat`, and a reference to it would be a false signpost.
  `docs/adr/0006`, `0008`, `0009` and `0010` are linked.
* **`useAktualitaet`** now stands in the page's import line and has its own
  paragraph under "Warum so" — before, it stood there only as a subordinate
  clause, which was too little for "documented on this page".
