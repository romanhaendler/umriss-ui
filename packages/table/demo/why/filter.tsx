export default function WhyFilter() {
  return (
    <>
      <h3>Three kinds of filter, and all of them go through the same door</h3>
      <p>
        <code>filter="list"</code> offers the values that occur, <code>filter="range"</code> two
        bounds for numbers and points in time, and <code>columnFilter(…)</code> is one an
        application writes itself: <code>matches</code> checks a value, <code>Input</code> stands in
        the panel, <code>describe</code> names the condition. The two built-in ones are built with
        the same interface – so what a filter of one's own can do is proven from the start. The
        panel with its foot, the counting, the way back and the view belong to the table, the same
        for every filter. There is no text filter: search and <code>searchable</code> are there for
        that.
      </p>

      <h3>The filter belongs to the value type, not to the Table</h3>
      <p>
        <code>columnFilter&lt;number, …&gt;</code> is accepted by the compiler at every number
        column and not at a text column – just as a preset from <code>column&lt;P&gt;()</code> is
        bound to a property and not to a row kind. The same filter therefore fits into every table
        whose column has the value. An absent value satisfies no condition of one's own, and{" "}
        <code>matches</code> never gets to see it: the check in every filter function would be a
        check that one of them forgets.
      </p>

      <h3>The pre-filter is not a column filter</h3>
      <p>
        <code>preFilter</code> on the hook decides which rows the table has at all – by permission,
        by plant. It is invisible: never a condition, never reset, never in the view, and “43 of
        1,204” counts only what it admits. A list filter offers only values that occur in its rows –
        otherwise it would give away the lines of the other plant. What the user should be able to
        see and undo is a column filter instead. Where the pre-filter admits nothing the table is
        empty, not filtered: there is nothing to reset.
      </p>

      <h3>Why the conditions stand in the table toolbar</h3>
      <p>
        A row of its own for the conditions came into being with the first and vanished with the
        last – the table slid downwards while one typed and back up when it was cleared. They
        therefore stand in the table toolbar, which is there anyway, and a table with a search or a
        column filter has one even where none stands in the JSX. Every condition is two things: a
        click on it opens its filter – the funnel may be scrolled away or its column hidden – and
        the cross lifts it. The search does not stand among them: its field shows it already.
      </p>
    </>
  );
}
