# A calculation is a tree or a chain

Status: accepted
Date:   2026-09

ADR-0027 wrote every calculation as a **Tree**. That suits OEE and reads badly
for a costing sheet: each interim result is the first operand of the next, so a
sheet with four interim results is four levels of JSX and four levels of
indent, where paper has one flat column. A sum of fifteen items fares no
better: its line repeats all fifteen in two formulas above the fifteen lines
that already list them.

A calculation therefore has two forms, both written as elements. A **Chain** is
read top to bottom: a first quantity, then `Plus`, `Minus`, `Times` or
`DividedBy`, each working its operand into the value before it, strictly in
order, and **Interims** that name the value where they stand. It ends with an
interim; that interim is the chain's value.

```tsx
<Calculation aria-label="Offer price A-2041">
  <Chain>
    <Given label="Direct material" value={1840} unit="€" />
    <Plus label="Material overhead" value={220.8} unit="€" />
    <Interim label="Material cost" />
    <Plus label="Direct labour" value={960} unit="€" />
    <Plus>
      <Product label="Production overhead" unit="€">…</Product>
    </Plus>
    <Interim label="Production cost" />
    <Times label="Profit mark-up" value={1.08} />
    <Interim label="Net offer price" />
  </Chain>
</Calculation>
```

The two forms mix: an operand in a chain can be a tree, and a chain can be an
operand in a tree. `<Calculation>` keeps exactly one child, either form.

Three rules come with the chain:

- **No precedence, and `Times` or `DividedBy` stands alone between two named
  values**: directly after the first quantity or an interim, directly before
  an interim. Otherwise it is a development error. A reader who meets
  `a + b × c` computes `a + (b × c)`; the chain computes `(a + b) × c`. The
  rule makes the case unwritable instead of explaining it, and each interim's
  formula names one kind of operation: plus and minus, or one times or
  divided by.
- **Only an interim shows the running value.** An operand between two interims
  shows its own number. A running value without a name is a number nobody can
  quote; whoever wants to see it sets an interim.
- **A chain starts folded to its interims.** Each interim folds the operands
  since the interim before it, and the sheet of interim results is what a
  reader sees first.

And one rule for the tree: **a sum or product of more than four operands shows
no formula on its line**, only how many operands it has. The operands stand
directly beneath it; a formula of fifteen terms only repeats them. The
number is fixed, not a prop.

## How it is shown

Both forms share one look, and it is a statement of account, not an accordion:

- **The outermost statement stands as on paper**: a tree's operands, a rule,
  the **Result** beneath them with a double rule and the heaviest weight; a
  chain's interims one under another. It does not fold.
- **Everything else opens beneath the line that was clicked**, and that line
  never moves. The derivation is a nested calculation on the sunken surface,
  with a bar that hangs from the line's label, and it closes with a rule and
  "= label" - it says whose it is twice: attached, and by name. In a chain
  the derivation of an interim starts with the interim before. Nested derivations stand inside, each with its own bar, the outer
  bars staying in view.
- **Fixed columns**: label, operator, number, unit. The operator stands before
  the number, the number is right-aligned in the monospace token with tabular
  figures, the unit has a column of its own so that numbers align on their
  last digit. The monospace token only - the library ships no fonts
  (ADR-0021), and nothing may depend on one face's measures. "≈" stands in the
  operator column of a result line, which has no operator.
- **Only a derivation indents, and only its label.** Numbers, operators and
  rules stay in the one number column and recede to the secondary colour; the
  outermost statement keeps full colour.
- **Rules carry meaning, not structure**: one above the outermost result and
  above every closing line, a double rule under the Result, no lines between
  rows.
- **The label is the disclosure**, with a quiet angle after it. A folded
  quantity shows its formula in names beneath the label ("= Run time ÷
  Planned production time"), or "15 operands" where there are more than four; open, it
  shows none - its derivation beneath it is the formula. The formula in
  numbers is in the sentence only.
- **At most two rows per quantity**: beneath the label, formula, reason,
  explanation, source, freshness and the caller's aside; beneath the number,
  verdict and target.
- **As wide as its content**, the label column growing to a measure and then
  wrapping; full width only by the caller's `className`.
- **Hover coupling is a flat band** from the label's indent, so that the bars
  stay in view; a reference keeps its label in italics.

The first two departures from a pure accounting sheet are deliberate: the
formula beneath a folded label is the reason to unfold it, and the content
width replaces the leader dots paper needed for its fixed width.

## Considered Options

**Signs only** — a chain that only adds and subtracts, with multiplication
inside an operand. The honest term would have been *subtotal*. Rejected
because a costing sheet multiplies on the sheet itself (a mark-up, a VAT
factor), and the rule on times and divided by removes the danger of a
calculator tape at the price of one development error.

**A calculator tape without the rule.** Everything left to right, anything
allowed. Rejected for `a + b × c`.

**A sign prop on the existing elements** — `<Given sign="+">`. No new tags, but
`<Product sign="×">` reads as nonsense, and the tree's operators would mean two
things.

**Derivations opening upward**, the result beneath its operands at every
level. It was the first design of this ADR and was dropped on sight: the line
a reader clicked moved down the screen, and an opened derivation no longer
looked as if it belonged to anything. **A result above its operands**, as
ADR-0027 shipped it. It reads as an
accordion - a chevron before every line, each level indenting the whole row -
and gives tree and chain two looks. **A column per nesting level** (the
accountant's inner column) is the clearest separation of levels and too wide
for OEE's three.

**The chain instead of the tree.** OEE written as a chain loses the one thing a
tree shows: that availability, performance and quality are three independent
factors.

## Consequences

ADR-0027's "there is one way to declare a calculation" no longer holds; what
holds is that there is one way per form, both as elements, and still no
value-based builder. The model needs a sum with signed operands (`a + b − c`),
which the tree's `Difference` (`a − b − c`) is not. Evaluation, absence, the
approximation mark and assessment are unchanged: an interim is a derived
quantity like any other.
