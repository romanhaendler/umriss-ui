export default function WhyGrouping() {
  return (
    <>
      <h3>The form of a group follows its level</h3>
      <p>
        Every grouped table we measured ourselves against gives a group one form: a line above its
        rows with the value, a count and the aggregates. That is right for a group of forty and wrong
        for a group of two – and people group by the fine keys most: a customer with two orders, a
        machine with one stoppage. Grouped by line and customer, 13 orders needed 25 lines, and
        every second one was a header. Here the outermost level is a group header, carrying every
        aggregate under its column; the innermost of several levels is a span – the grouping column
        stands first and shows its value once, beside its rows. The same 13 orders take 16 lines.
        One level is a group header over plain rows, so that a group's sums always stand in the same
        place. The form is chosen by the level alone, never by the data: a table that rearranged
        itself while the user filters would be harder to read than either form. See <code>docs/adr/0029-a-row-groups-form-follows-its-level.md</code>.
      </p>

      <h3>A group of one row is a group like any other</h3>
      <p>
        It has its fold, its count and its aggregates. A first version left them out – a count of
        one seemed noise – and in the rendered table its header was the one without a figure in a
        column of figures. A rule without exceptions reads faster than one that is sometimes right.
      </p>

      <h3>Grouped from the column menu, not from a bar to drag onto</h3>
      <p>
        A bar above the table that takes column headers by drag is the market's way to group. It is
        found by those who already know it, and hardly at all on touch. Grouping is offered where the
        columns are arranged anyway – in the column menu, a button per column, pressed once more to
        take the level away – and the table toolbar names the grouping in one tag, “Grouped by Line
        › Customer”, because the order of the levels is what a reader has to see.
      </p>

      <h3>An aggregate is computed from rows, never from aggregates</h3>
      <p>
        A group header's average is the average over its rows, not over the averages of the groups inside
        it: an average of averages weighs a group of two as much as a group of two hundred. The
        pipeline hands every group its own rows, so that mistake cannot be written. What it cannot
        know is that a rate must be weighted – that is an aggregate of one's own, and the Aggregate
        page shows it done wrong and right.
      </p>
    </>
  );
}
