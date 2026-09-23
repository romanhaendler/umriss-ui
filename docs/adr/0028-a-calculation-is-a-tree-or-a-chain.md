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

Both forms share one look: a statement on a surface of its own, in the
material of the library's other data surfaces - the surface colour, the edge, a
medium radius, rows of one height divided by hairlines.

- **Fixed columns**: label, names, operator, number, unit, assessment. The
  number is right-aligned in the monospace token with tabular figures, the unit
  has a column of its own so that numbers align on their last digit. The
  monospace token only - the library ships no fonts (ADR-0021), and nothing may
  depend on one face's measures.
- **The outermost statement stands as on paper** and does not fold: a tree's
  operands with their operators, a chain's interims one under another. The
  **Result** closes it as its last row on the sunken surface, heavier and larger,
  its number underlined twice - the accountant's mark for the final figure; without a
  number, no mark, which would read as an equals sign. A chain's Result is its
  last interim and opens beneath itself like every interim.
- **Everything else opens beneath the row that was clicked**, and that row
  never moves. Row and derivation become one group on the sunken surface; a
  line in the accent falls from beneath the row's disclosure through the rows
  it opened, and the derivation closes with a rule and "= label" - it says
  whose it is twice: attached, and by name. In a chain the derivation of an
  interim starts with the interim before. A group inside a group draws its own
  line, and the outer one stays in view to its left. Inside a group there are
  no hairlines: the surface holds the rows together.
- **The disclosure** is a quiet square with an angle before the label, as the
  library's expanders are; the whole row opens it for the pointer, the button
  is what the keyboard and a screen reader reach. Leaves keep its width, so
  every label starts in line. Only a derivation indents, and only its label;
  its numbers recede to the secondary colour.
- **A folded row shows the formula it hides**, in names, in a column of its
  own beside the label ("= Run time ÷ Planned production time"), or how many
  operands there are where there are more than four. Open, it shows none. The
  formula in numbers is in the sentence only.
- **The assessment is a badge**, core's: the verdict's word in its tone, or the
  reason a number is missing. The target stands beside it in words; the worst
  verdict inside a folded row as a quiet dot and word. "≈" stands before the
  number, and its explanation is a tooltip, not a sentence on every row; the
  row's sentence carries it for a screen reader, as it carries the worst
  verdict inside a folded row.
- **At most two rows per quantity**: only what a quantity says about itself -
  explanation, source, freshness, the caller's aside - stands beneath its label.
- **Hover coupling is a flat band across the whole row**; the falling lines
  lie above the rows, so no band covers them. A closing row lights up only
  where its own quantity is meant. A reference keeps its label in italics.
- **The component measures its own width**, not the window's: narrower than
  34 rem - a phone, a side panel - the names of a folded row give way, the
  label takes the free width, and verdict and target move beneath it. It
  therefore takes the width it is given; `className` and `style` size the
  surface.

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
looked as if it belonged to anything. **Bare text on the page**, the second:
no surface, uneven rows with notes beneath many of them, every label a dotted
link - correct, and not the standard of the library it stands in. **A result above its operands**, as
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
