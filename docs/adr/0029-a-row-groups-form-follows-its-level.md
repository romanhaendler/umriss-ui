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

- The **outermost** level is always a **Group header**: a line with the value,
  the count and every aggregate under its column.
- Below it, the **innermost** of several levels is a **Group span**. Its grouping
  column stands first and shows the value once, beside the group's rows, with
  no line of its own. A middle level of three is a group header as well.

A grouping by one column is therefore a group header over plain rows, and a
grouping by line and then customer reads as lines with headers and customers
beside their orders — 16 lines for the 13 orders that took 25. Both forms fold:
a folded header hides its rows, a folded span becomes one line carrying its
aggregates in the columns, so folding everything turns a grouped table into a
summary of its groups.

A group of one row does not fold, and has no count and no aggregate that would
only repeat its value; as a span it is simply that row.

**Aggregates stand in lines, always under their columns.** A group's sums are
in its group header, in its folded line and - for the whole - in the footer. An
open span carries none: it has no line of its own, and the place its sums
belong to is the header above it or its folded form.

**One level was all span at first.** Then a group's sums showed nowhere while
it was open - the sum a reader groups for appeared only once the rows were
gone -, and one level answered differently from several. Seen rendered, the
group header over plain rows was the better one level, and the rule became:
the outer level is always a header.

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

**Sums for an open span**, all rejected when seen rendered: a closing line under
each span (a line per group - the very cost the span exists to avoid); the sum
sitting on the boundary between two groups (squeezed between two numbers, read
as a fault); every aggregate at the foot of the span (overflowed as soon as a
group had fewer rows than aggregates); only the first at the foot (the others
missing - inconsistent with the header above); sub-totals in the group's last
row (half a line per group, and every last row taller than its siblings).

**One level as a span** - the first version of this decision. It kept fine keys
compact, but hid every sum while the group was open.

## Consequences

A span is not built from `rowspan`: a spanning cell cannot be split by a page or
by a virtualised window. It is a cell in every row whose value shows in the
first one, stays in view while its group scrolls, and repeats on the first row
of a page that begins inside the group.

With several levels the innermost grouped column is not hidden but moved to the
front; every other grouped column is hidden, its value standing in its header.
The price of one level as a header is paid on fine keys: grouped by customer
alone, a customer with a single order gets a header over a single row. Whoever
wants those compact groups them under a coarser key, where they become a span.

The share bar stands under the first column with a sum, once per header - a bar
under every sum was decoration, not a statement.
