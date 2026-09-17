export default function WhyPopover() {
  return (
    <>
      <h3>One seam, five users</h3>
      <p>
        <code>Menu</code>, <code>Tooltip</code>, <code>Select</code>, <code>Combobox</code>,{" "}
        <code>MultiSelect</code> and the four pickers all stand on this surface. It owns: the
        portal, the position including clamping and flipping, the outside click, Escape with focus
        return, travelling along on scroll, the stacking order and the entrance.
      </p>
      <p>
        The reason for having that in one place is not saving lines. It is that every one of those
        rules is a decision which has to come out the same everywhere: if one surface closes on an
        outside click and another does not, the user no longer has a rule but a list of
        exceptions.
      </p>

      <h3>It never opens itself</h3>
      <p>
        <code>open</code> is controlled, and <code>onOpenChange</code> reports only a wish. Only
        the caller knows whether something may be open right now - whether a form is unsaved,
        whether a dialog already stands. A surface that decided for itself would have answered that
        question for him.
      </p>

      <h3>A translucent material needs a floor</h3>
      <p>
        The surface is slightly translucent. So that this does not lead to grey text on grey
        ground, an opaque layer lies beneath the material - the floor. See{" "}
        <code>docs/adr/0012-a-translucent-material-needs-a-floor.md</code>.
      </p>
    </>
  );
}
