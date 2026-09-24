# A row group's form follows its level

Status: accepted
Date:   2026-09

Every table we measured ourselves against gives a row group one form: a line
above its rows, carrying the value, a count and the aggregates. That form is
right for a group of forty and wrong for a group of two. Grouping orders by
customer, where most customers have one or two orders, the prototype needed 25
lines for 13 orders; nearly every second line was a header, and the table no
longer read as a table (`.scratch/table-grouping/spec.md`, "The prototype").

`@umriss-ui/table` gives a **Row group** one of two forms, and the form follows
the group's **level** in the grouping and nothing else:

- The **innermost** level is a **Group span**. Its grouping column stands first
  and shows the value once, beside the group's rows, with no line of its own.
- Every level **outside** it is a **Group header**: a line with the value, the
  count and the aggregates.

A grouping by one column is therefore all span, and a grouping by line and then
customer reads as lines with headers and customers beside their orders — 16 lines
for the same 13 orders. Both forms fold: a folded header hides its rows, a folded
span becomes one line carrying its aggregates in the columns, so folding
everything turns a grouped table into a summary of its groups.

A group of one row is that row: no fold, no count, no aggregate that would only
repeat its value.

**An open span carries its aggregate at its foot.** A span has no line of its
own, so its aggregates had nowhere to stand while it was open: the sum a reader
groups for appeared only once the group was folded - once its rows were gone.
The span's value stands top left, its count top right; its aggregate now stands
bottom right, on its last row, and the three frame the group without a line of
their own. One aggregate only: the first column's that says what it is by its
sign - Σ, ⌀, min, max -, because no column name stands beside it. Every other
aggregate stands in the group header, in the folded line and in the footer.

## Considered Options

**One form, the header, on every level** — the market's default. Rejected: it is
the reason grouped tables lose their overview, and it gets worse exactly where
grouping is used most, on fine keys.

**The form chosen from the data**, by the median size of a level's groups.
Rejected: the form would flip while the user filters, and a table that
rearranges itself under a search is harder to read than either form.

**The form chosen by the caller**, a prop per level. Rejected: it is a decision
every caller would have to make, and the rule by level is already the one they
would make; a knob that is always set the same way is not a feature.

**A closing line under each open span** carried every aggregate under its own
column. Rejected when seen: it made the table taller by a line per group - the
very cost the span exists to avoid. **The aggregate sitting on the boundary
between two groups** cost no height, but was squeezed between two numbers and
read as a fault. **Every aggregate at the foot of the span** overflowed the span
as soon as a group had fewer rows than aggregates.

## Consequences

A span is not built from `rowspan`: a spanning cell cannot be split by a page or
by a virtualised window. It is a cell in every row whose value shows in the
first one, stays in view while its group scrolls, and repeats on the first row
of a page that begins inside the group.

The innermost grouped column is not hidden but moved to the front; the outer
grouped columns are hidden, their value standing in the header.
