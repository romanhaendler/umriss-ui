export default function WhyModal() {
  return (
    <>
      <h3>A translucent material needs a floor</h3>
      <p>
        The head and the foot of the window stand on a translucent material. In a library for plant
        screens that is not decoration but a risk: what shines through can push the contrast below
        the threshold, and then a message is no longer readable. That is why an opaque layer always
        lies beneath the material. See{" "}
        <code>docs/adr/0012-a-translucent-material-needs-a-floor.md</code>.
      </p>

      <h3>Only the body scrolls</h3>
      <p>
        The height comes from the content and is bounded above; where it does not fit, exactly it
        scrolls. Otherwise the closing button travels out of the picture - and that button is the
        reason the window is open.
      </p>

      <h3>It does not close itself</h3>
      <p>
        <code>onClose</code> reports every wish: Escape, the cross, a click on the backdrop.
        Whether the window then goes is the caller's decision. A window that closed itself would
        eventually discard a half-filled form because somebody clicked beside it.
      </p>
    </>
  );
}
