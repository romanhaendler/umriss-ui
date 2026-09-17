export default function WhyControlChart() {
  return (
    <>
      <h3>A control limit is not a specification limit</h3>
      <p>
        Two numbers on a control chart look alike and mean opposite things. A{" "}
        <strong>specification limit</strong> is chosen: what the customer assumes, what the
        drawing says. A <strong>control limit</strong> is calculated: what this process actually
        does when nothing is wrong with it. A process can sit comfortably inside the
        specification and be out of control, and that is the case the chart exists to show. See{" "}
        <code>docs/adr/0008-control-limits-are-not-specification-limits.md</code>.
      </p>

      <h3>Never computed from what happens to be visible</h3>
      <p>
        The limits come from a named <strong>reference window</strong> - a period in which the
        process demonstrably ran in control - and never from the data the chart is currently
        showing. Limits recomputed over a drifting process drift with it, and the chart then
        certifies every state as normal, most confidently at the moment it stops being so.
      </p>

      <h3>The rules fire before a point leaves the specification</h3>
      <p>
        Outlier, run, trend and two-of-three: four rules over the zones, and the point of them is
        the warning that comes early. They are exported as pure functions, so an application that
        draws something else can still ask the same question.
      </p>
    </>
  );
}
