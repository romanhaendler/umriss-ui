export default function WhyChart() {
  return (
    <>
      <h3>Every scale is affine, and the draw loop relies on it</h3>
      <p>
        A scale here is a slope and an offset, never a callback the loop asks per point. At a
        million points the difference is not a micro-optimisation but the difference between a
        chart and a freeze: the loop reads two numbers and multiplies. Everything that is not
        affine - a log axis, a category scale - is therefore not a scale in this library but a
        mapping that happens earlier, in materialisation. See{" "}
        <code>docs/adr/0001-affine-scale-contract.md</code>.
      </p>

      <h3>Two layers, and a hover touches only one</h3>
      <p>
        The series lie on one canvas, crosshair and markers on a second above it. A hover
        redraws the overlay and leaves the series where they are - which is why the frame rate
        stays at sixty while the pointer travels over a million points. The benchmark page
        measures exactly that.
      </p>

      <h3>Canvas for the marks, DOM for everything that is read</h3>
      <p>
        Axes, ticks, labels, legend and tooltip are elements. They can be selected, read by a
        screen reader, styled with tokens and found by a test. Only what would be thousands of
        nodes - the marks themselves - is drawn.
      </p>
    </>
  );
}
