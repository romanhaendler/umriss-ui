export default function WhyColumn() {
  return (
    <>
      <h3>One value, and presentation is not value</h3>
      <p>
        Every column has exactly one value – read from a field or computed from the row. Sorting,
        searching, exporting and the footer work on it and on nothing else; <code>children</code>{" "}
        says only how it looks, and nobody reads it back. A column that shows something without
        having a value does not exist: a history, too, is a value that has a presentation.
      </p>

      <h3>An absent value, and why children never sees it</h3>
      <p>
        <code>null</code>, <code>undefined</code> and <code>NaN</code> are an absent value. It
        stands the same way in every table, sorts last in either direction and counts towards no
        footer. In exchange <code>children</code> is not called for it and gets its value typed
        without <code>null</code> – no check in every cell, and no cell that forgets it.
      </p>

      <h3>Defaults per value type, decided at runtime</h3>
      <p>
        Without <code>children</code> the value decides: text on the left, numbers right-aligned
        with tabular figures, points in time as date and time, truth values as a word. At runtime
        there are no types any more, so the question is asked once more there – at the column's
        first value present. <code>numeric</code> says it differently where that does not suffice.
      </p>

      <h3>What the compiler refuses</h3>
      <p>
        <code>Column</code> is an overload: six call forms, and which one fits is decided by the
        mandatory entries. Three errors follow from that, before a single row runs. A computed value
        without an <code>id</code> does not compile, because a function has no name under which a
        link could know the column. <code>footer</code> on text does not compile, because a sum over
        names is none. And a value without a textual form – a field, an object – demands{" "}
        <code>children</code> instead of quietly rendering an empty cell. The tables above document
        the types behind the overloads: <code>FieldColumn</code> for the value out of a field,{" "}
        <code>ColumnBase</code> and <code>ValuePaths</code> for every column.
      </p>

      <h3>Filters stand on their own page</h3>
      <p>
        <code>filter</code> is a prop of this column, but what it accepts – the values that occur,
        two bounds, a filter of the application – is a subject of its own. It stands under{" "}
        <code>Filter</code>, together with the route to writing one's own and the difference from
        the pre-filter, which stands with <code>Table</code>.
      </p>

      <h3>Presets before wrappers</h3>
      <p>
        A column that fits many tables is a preset first: <code>column&lt;P&gt;()</code> bound to a
        property and spread into the <code>Column</code>. The compiler checks it at every place. A
        wrapper – a component of one's own – is the route for a column with a presentation of its
        own, and it is checked only where it receives the table as <code>of</code> with a particular
        row kind. A wrapper generic over its rows cannot be typed, and one without <code>of</code>{" "}
        is unchecked.
      </p>
    </>
  );
}
