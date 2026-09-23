# A calculation is written as it is shown

Status: accepted
Date:   2026-09

A **Calculation** is declared by nesting: each operator is an element, its
children are its **Operands** in order, and a **Given** is a leaf. What the
caller writes is the derivation the reader sees — the nesting is the fold
structure, the child order is the operand order (numerator before
denominator). `<Calculation>` has exactly one child, the **Result**.

```tsx
<Calculation>
  <Quotient label="Availability" format="percent">
    <Difference id="runtime" label="Run time" unit="min">
      <Given id="planned" label="Planned production time" value={450} unit="min" />
      <Given label="Downtime" value={38} unit="min" />
    </Difference>
    <Ref to="planned" />
  </Quotient>
</Calculation>
```

A quantity used in two places is defined once, where the caller places it, and
stands everywhere else as a **Reference** by `id`. The calculation reads its
children's props directly and evaluates before it renders.

## Considered Options

**Quantities as values** — `const runtime = difference("Run time", planned,
downtime)`, then `<Calculation result={oee} />`. Fully typed, references
cannot dangle and cycles cannot be written, because a quantity cannot exist
before its operands. Rejected because it reads as configuration rather than as
the derivation it produces — the complaint that started ADR-0017 — and the
aim of this package is that writing a calculation is as easy as reading one.

**An object keyed by name** with mapped types checking the operand names.
Checkable, but the types nest and the errors are unreadable.

**Following ADR-0017** and binding through a hook. That ADR's reason for not
reading children's props is typing against the row type; a calculation has no
row type, so the reason does not carry over and the hook would buy nothing.

## Consequences

Two things TypeScript no longer checks, and both fail loudly on the first
render instead: a `Ref` naming no quantity (the message lists the ids that do
exist), and a cycle through references. A caller's own component wrapping
`Given` or an operator inside a calculation cannot be read and is a
development error with a message saying so; `.map` over data inside an operator
works, because it yields elements, not wrappers. There is one way to declare a
calculation; a value-based builder beside it would be a second.

*Added 23 Sep. 2026:* ADR-0028 adds a second form, the **Chain**, beside
the tree written here; the last sentence above now holds per form.
