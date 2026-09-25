export default function WhyAxis() {
  return (
    <>
      <h3>Working time is a mapping, not a scale</h3>
      <p>
        A working calendar takes out the hours in which nobody was there - nights, weekends.
        The obvious implementation is a scale that skips them. This one does not: every scale in
        the library stays affine, a slope and an offset the draw loop multiplies with. Instead the
        x values are mapped into working time once, during materialisation, and the scale never
        learns that a weekend existed. The drawing loop pays nothing for the calendar. See{" "}
        <code>docs/adr/0001-affine-scale-contract.md</code>.
      </p>

      <h3>Removed time is a gap, and the axis says so</h3>
      <p>
        A measurement from an hour the calendar removed has no place on the axis. It is not laid
        on the edge of the interval, where it would pile up on what really happened there; it
        becomes a gap, like every missing value in this library - never drawn, never hit. The
        seam itself is where Friday evening and Monday morning now stand side by side, and every
        removed span gets a break mark on the axis at that seam. A chart that took a weekend out
        without saying so would claim a continuity it does not have.
      </p>
    </>
  );
}
