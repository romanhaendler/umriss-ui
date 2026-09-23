# A calculation a reader can follow and redo

Status: ready-for-agent
Date:   2026-09-23
Origin: grilling session on a new component for showing calculations step by
step. Vocabulary in `CONTEXT.md`, "Calculations"; the declaration form in
ADR-0027. Assessment, freshness, absent values and wording are reused from
`core` unchanged.

## Problem Statement

A plant screen shows a figure — an OEE of 82 %, a cost per piece, a yield — and
the operator who doubts it has nowhere to go. How the number came about lives
in a spreadsheet, a report or someone's head. Where an application does show
the working, it is hand-written text beside the number, and nothing makes the
text and the number agree: a page can say "412 ÷ 450" and show a figure that
was computed from something else.

An application developer has no building block for this. A table has no
notion of one row being derived from others; a stat shows one figure and not
its origin.

## Solution

A new package, `@umriss-ui/calculation`, depending on `@umriss-ui/core` only.
The caller writes a **Calculation** as nested elements — operators with their
**Operands** as children, **Givens** as leaves — and the package evaluates it
and shows the derivation top to bottom, each line with its formula in names
and in numbers and its result. Because the package performs every operation it
shows, what stands on the screen cannot disagree with the number.

The lead case, for the demo and the tests, is OEE:

```tsx
<Calculation aria-label="OEE, early shift">
  <Product label="OEE" format="percent" target={0.85}>
    <Quotient label="Availability" format="percent">
      <Difference id="runtime" label="Run time" unit="min">
        <Given id="planned" label="Planned production time" value={450} unit="min" />
        <Given label="Downtime" value={38} unit="min" />
      </Difference>
      <Ref to="planned" />
    </Quotient>
    <Quotient label="Performance" format="percent">
      <Product label="Ideal run time" unit="min">
        <Given label="Ideal cycle time" value={0.8} unit="min/pc" />
        <Given id="total" label="Total count" value={480} unit="pcs" />
      </Product>
      <Ref to="runtime" />
    </Quotient>
    <Quotient label="Quality" format="percent">
      <Given label="Good count" value={461} unit="pcs" />
      <Ref to="total" />
    </Quotient>
  </Product>
</Calculation>
```

## User Stories

1. As an operator, I see how a figure was derived, line by line, down to the
   numbers it came from.
2. As an operator, each line shows the formula in names and in numbers, so I
   can follow it and redo it.
3. As an operator, I can fold a derivation away and open it again.
4. As an operator, a folded derivation that hides something not ok says so.
5. As an operator, a quantity that misses its target or violates a limit shows
   its verdict the way every other value in the library does.
6. As an operator, I see where a given number came from and how old it is.
7. As an operator, a missing number shows as missing, along with every figure
   that depends on it and the reason — never as zero.
8. As an operator, when rounded numbers on screen do not reproduce the rounded
   result exactly, I am told so rather than left to find it.
9. As an operator, hovering a quantity shows me its operands and the places it
   is used.
10. As a screen-reader user, each line is read as a sentence and each
    derivation is a disclosure I can open.
11. As an application developer, I write a calculation as it will be shown,
    without names for anything that is used once.
12. As an application developer, a reference to a quantity that does not exist
    fails at once with a message naming the ones that do.
13. As an application developer, I can build a calculation from data with
    `.map` inside an operator.
14. As an application developer, I can put an explanation and content of my own
    (a sparkline, a link) beside any quantity.

## Implementation Decisions

- **Declaration (ADR-0027).** Nested elements, read through their props before
  rendering. `<Calculation>` has exactly one child, the **Result**; more is a
  development error. `id` on any quantity makes it referable; `<Ref to>` stands
  for it as an operand. A dangling reference, a cycle through references, or an
  element the calculation cannot read (a caller's own wrapper component) is a
  development error with a message saying which.

- **Operators.** `Sum`, `Product`, `Difference` take two or more operands;
  `Difference` computes a − b − c. `Quotient` takes exactly two. Any other count
  is a development error. No formula text, no operator of the caller's own.

- **Quantity props.** `label`; `unit` as a label the caller writes, never
  converted or checked; `format` (`percent` presents a plain ratio) and the
  number of fraction digits through core's formats; `target` and `limits`,
  assessed through core's `assess()`; an explanation in plain text; a slot for
  the caller's own content, which never takes part in the calculation. A
  `Given` has `value` and optionally `source` and `asOf`, the latter giving it a
  **Freshness** through core.

- **Evaluation.** Full precision throughout; rounding happens only in
  presentation. An absent operand makes every quantity that depends on it
  absent, with verdict `unknown` and a reason ("… is missing"); a quotient by
  zero is absent with its own reason. Nothing is carried on as zero.

- **Approximation mark.** When the operands as shown, computed with the
  operator, do not give the result as shown, the result carries "≈".

- **Line.** The label, `= formula in names`, `= formula in numbers with
  units`, the result right-aligned in tabular figures, then its assessment.
  A reference shows the referred quantity's label and number, not its
  derivation; the derivation stands once, where the quantity is defined —
  where the caller placed it.

- **Folding.** Every derived quantity's derivation can be folded. Initially the
  level directly under the result is open and everything below it folded. The
  fold state is the component's own. A folded quantity whose derivation holds a
  worse verdict than its own shows the worst one as a quiet marker, not as a
  colour of the line (compare **Indeterminate** in the tree). Nothing unfolds
  by itself when data changes.

- **Hover coupling.** Hovering or focusing a quantity marks its operands and
  every place it is used, references included.

- **Accessibility.** A nested list. Each line has an accessible sentence built
  from wording entries — "Availability equals Run time divided by Planned
  production time, equals 412 min divided by 450 min, equals 91.6 percent,
  above target 90 percent". Derivations open through disclosure buttons.

- **Wording.** Operator words, the reasons for absence, the approximation note
  and the disclosure labels are new entries in core's wording, English and
  German.

- **Package.** `@umriss-ui/calculation`, depending on `@umriss-ui/core` only; its
  own demo built from the shared shell (ADR-0020). `CLAUDE.md`,
  `CONTEXT.md`'s opening paragraph and `docs/README.md` name it alongside the
  other packages.

## Testing Decisions

- Evaluation is a pure function from the read declaration to evaluated
  quantities and is tested as one: each operator, operand order, absence
  propagation, division by zero, the approximation mark.
- Declaration errors — dangling reference, cycle, wrong operand count, more
  than one result, an unreadable child — each have a test asserting the
  message.
- Rendering tests through the OEE case: formula lines, reference lines, initial
  folding, the worst-verdict marker, the accessible sentence.
- The package joins the existing image and accessibility checks of the demos.

## Out of Scope

- What-if: editable givens. When it comes, it is controlled — the calculation
  reports an intent and the caller holds the values (as ADR-0023).
- Unit algebra or unit checking.
- Min, max, mean, rounding as operators; formula strings; caller-defined
  operators.
- More than one result per calculation.
- Attributing a result's verdict to a cause ("OEE is low because of quality").
- A value-based builder API beside the elements (ADR-0027).
- Invoices as a product; one may be a demo example at most.

## Further Notes

Terms introduced for this spec: **Calculation**, **Quantity**, **Result**,
**Given**, **Operator**, **Operand**, **Derivation**, **Reference** — all in
`CONTEXT.md`. Deliberately avoided because they are taken: *input* (a core
component), *operation*, *step*, *value*, *line*.
