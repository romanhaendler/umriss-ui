# 04 — Emphasis and rule

Status: done
Type: task

Blocked by: none (can run beside 01–03)
Spec: "Solution" (third bullet), "Implementation Decisions" (Emphasis and
rule), "Examples" 11–14, 16; user stories 37–47

## What to build

A writer sets a line apart without CSS: `emphasis="strong"` reads it first,
`emphasis="muted"` lets it recede while it still counts in full, and
`rule="above"` rules off a section that is not an interim. Both props stand on
every quantity - `Given`, the tree's operators, the chain's line tags and
`Interim` - inside an opened derivation and with metrics too. On the Result
either is a development error naming the quantity. Emphasis does not change
the sentence. Drawn with existing tokens (ADR-0045); in forced colours strong
keeps its weight, muted falls back to `GrayText`, the rule stays visible.

## Acceptance

- [x] Both props on `QuantityProps`, documented for the props tables.
- [x] Rendered tests: the props reach the row on a given, a tree operator, a
      chain's `Plus` and an `Interim`, inside an opened derivation, and with
      metrics; the sentence is unchanged; `emphasis` and `rule` on the Result
      each throw a message naming it.
- [x] Examples "A stronger line", "A quieter line", "A rule above",
      "Emphasis inside a group" (on the Calculation page, or a page Emphasis
      if that grows too long), and "The Result takes no emphasis" on What can
      go wrong.
- [x] Screenshot and forced-colours baselines for the new examples; numbers
      on emphasised lines still align on their last digit.

## Comments

Done - see the delivery report in `spec.md`.
