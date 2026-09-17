export default function WhyDock() {
  return (
    <>
      <h3>A dock snaps, it does not follow</h3>
      <p>
        Dragging does not move the dock. The handle follows the pointer, the dock jumps to the
        edge whose zone the pointer reaches. It is always at one of the four resting places and
        never in between - and therefore cannot come to lie where it looks unintended. A corner is
        not a resting place, because a corner names no orientation: the dock would have to invent
        one. See <code>docs/adr/0013-a-dock-snaps-it-does-not-follow.md</code>.
      </p>

      <h3>The turn is not a transition</h3>
      <p>
        Between a horizontal and a vertical edge the strip changes its orientation. That is not a
        transition between two numbers but a different layout, and a CSS transition on it would
        yield an intermediate position that is no position. The turn therefore measures the
        resting position and not the previous one's intermediate frame. See{" "}
        <code>docs/adr/0014-a-turn-that-cannot-be-a-transition.md</code>.
      </p>

      <h3>It belongs to its surface</h3>
      <p>
        A dock floats above <em>one</em> surface and carries the actions for it. Two charts side by
        side have two docks. A dock that outlived its surface would lie about what it acts on. That
        is what distinguishes it from the table toolbar in <code>@umriss-ui/table</code>, which
        stands in the flow above a table and does not move - a component that did both would carry
        two anatomies.
      </p>

      <h3>The place that does not fit says so</h3>
      <p>
        On a flat surface five upright tools have no room. The left and the right zone therefore
        refuse visibly, and while doing so show the outline the dock would have there. No overflow
        menu, no shrinking - and no warning colour, because nothing has gone wrong here.
      </p>
    </>
  );
}
