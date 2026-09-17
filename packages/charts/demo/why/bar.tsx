export default function WhyBar() {
  return (
    <>
      <h3>Bars sit on a numeric x axis</h3>
      <p>
        Every other chart library draws bars against a band scale over categories. This one does
        not: a bar has a position and a width in domain units, on the same axis a line uses. That
        is what lets a bar, a line and a scatter share one chart and one tooltip without
        translating between two kinds of axis - and it is what makes a Pareto possible, where the
        bars are categories and the cumulative line is not. Categories are passed as numeric
        positions with a naming <code>tickFormat</code>. See{" "}
        <code>docs/adr/0002-bars-on-a-numeric-x-axis.md</code>.
      </p>

      <h3>What it costs, said plainly</h3>
      <p>
        A band scale would place bars automatically and keep their gaps even. Here the width is a
        number the caller sets, and grouped bars divide it among themselves. The trade was made
        for the mixed chart, and the mixed chart is the case this library exists for.
      </p>
    </>
  );
}
