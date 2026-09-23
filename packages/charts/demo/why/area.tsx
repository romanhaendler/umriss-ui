export default function WhyArea() {
  return (
    <>
      <h3>The baseline is a channel, not a second series</h3>
      <p>
        A corridor has two edges, and the obvious way to draw it is two series and a fill between
        them. This library does not do that: the lower edge is the <code>baseline</code> accessor of
        the same <code>Area</code>, materialised into a second channel beside the first. One series
        has one name, one colour, one legend entry and one gap - where either edge is missing, the
        fill has a hole, and there is no way for the two edges to disagree about where it is.
        A fill &bdquo;towards another series&ldquo; would make the order of the JSX a statement
        about geometry, and hiding one of the two would leave the other filled towards nothing.
        The kinds share one materialisation shape, and a second channel is how an area fits into
        it; see <code>docs/adr/0002-bars-on-a-numeric-x-axis.md</code>.
      </p>

      <h3>Without a baseline the foot is 0, and 0 is in the extent</h3>
      <p>
        A filled area says &bdquo;this much&ldquo;, and a quantity is read from its foot. So the
        fixed baseline 0 enters the extent of the y axis like the values do - an axis that began at
        the smallest value would cut the foot off, and a dip would read as a shutdown. A course
        that has no natural zero is a <strong>Line</strong>, not an area.
      </p>
    </>
  );
}
