export default function WhyTooltip() {
  return (
    <>
      <h3>Every series is searched in its own axis space</h3>
      <p>
        A chart here can hold several x axes, and a series knows only its own. So the hit is not
        one search over &bdquo;the data&ldquo; but one binary search per series, over its own
        materialised x values, in the domain units of its own axis. The candidates are then
        compared in pixels - the one space all axes share. Comparing domain values across two
        axes would be comparing hours with pieces.
      </p>

      <h3>The crosshair snaps to a point</h3>
      <p>
        The crosshair stands on the data point that was hit, not under the pointer. A line between
        two samples is drawn, but nothing was measured there, and a crosshair between two points
        would invite reading off a value nobody has. In mode <code>&quot;x&quot;</code> the
        tooltip lists every series at that position; in mode <code>&quot;nearest&quot;</code> only
        the one point nearest the pointer, which is the question to ask when curves cross.
      </p>
    </>
  );
}
