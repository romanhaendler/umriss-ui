# 01 — The matcher

Status: done

Spec: `.scratch/command-palette/spec.md`

## Scope

A new pure module, `suche`, beside `optionen` in the library's shared logic. No
React, no DOM, inputs as arguments, results returned — the pattern
`pure-logic-seams` established and the reason this ticket comes first.

It answers one question: given a query and a list of candidates, which of them
match, in what order, and which characters matched.

```ts
interface Fundstelle {
  von: number;  // Index in `name`, einschliesslich
  bis: number;  // Index in `name`, ausschliesslich
}

interface Fund<K> {
  kandidat: K;
  rang: number;
  fundstellen: readonly Fundstelle[];
}
```

Matching is by subsequence, not substring. The rules, in the order they matter:

- Every character of the query must appear in the name, in order, or there is no
  find at all.
- A character matched at a word boundary — position zero, after a separator, or
  at a lower-to-upper case change — scores above one matched mid-word. This is
  what makes `dtp` find `DateTimePicker`.
- A character matched immediately after the previous match scores above one
  matched after a skip.
- Unmatched characters cost, so the shorter of two equally matched names wins.
- The candidate's optional weight is added last.
- Ties break by incoming order, so the caller's order still shows through where
  scoring has nothing to say.

Matching runs over the name and over the group name. A group-only match produces
a find that carries no spans and ranks below every name match.

An empty or whitespace-only query returns nothing. This is the rest-state rule,
and it is asserted here — where it costs one test — rather than through a
rendered panel.

The scoring formula is internal. What is public is the ordering, and that is what
the tests pin.

## Acceptance

- Unit tests in the style of `optionen.test.ts`: functions called directly,
  nothing mounted.
- `dtp` finds `DateTimePicker`; `abc` does not.
- Word-boundary above mid-word, on a fixture where nothing else differs.
- Contiguous above scattered, likewise.
- Shorter above longer at equal match quality.
- Case and surrounding whitespace change nothing.
- Empty query returns nothing.
- Spans are half-open, ordered, non-overlapping, and index the name they came
  from.
- Group-only match: a find, no spans, below every name match.
- Weight shifts rank and nothing else.
- Ties fall back to incoming order.
- Nothing outside the new module changes.

## Notes

Resist the urge to reach for a scoring library. The formula is a few dozen lines,
and the value of this ticket is that the rules above are *ours* and are pinned by
name in a test file — a dependency would move them somewhere no test can see.

Each rule above wants its own fixture pair differing in exactly one property. A
test that asserts a whole ordering of ten items proves nothing about which rule
produced it, and fails unhelpfully when one of them changes.

## Comments

**Eine Zahl nachgezogen (1 Sep 2026).** Die Laengenkosten stehen bei 0,5 und
nicht bei 1. Mit 1 stellte `dtp` an der echten Liste der Demo
„DateRangePicker" (zwei Wortanfaenge, 15 Zeichen) vor „DatePicker und
DateTimePicker" (drei Wortanfaenge, 29 Zeichen) - vierzehn Zeichen Laenge wogen
einen ganzen Wortanfang auf. Die Kosten sollen bei gleicher Guete entscheiden
und nicht gegen einen echten Gueteunterschied. Der Fall steht jetzt als eigener
Test in `suche.test.ts`.
