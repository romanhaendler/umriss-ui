export default function WhyLaneGroups() {
  return (
    <>
      <h3>A folded group keeps every bar its place</h3>
      <p>
        Folding is how a planner who works on the presses stops scrolling past the rest of the
        plant. It must not also be how they stop seeing it. So a folded group is not a closed box:
        it is a <strong>miniature</strong> - every lane in it as a thin strip, at a smaller scale,
        with its work in the tasks&apos; own colours. The real work, smaller.
      </p>
      <p>
        Everything that was true of a bar stays true of its strip. A dependency arrives at the
        strip of the machine it arrives at, not at the top of the group. An overlap is marked on
        the strip <em>and</em> on the row, because a three-pixel strip is not where an alarm can
        live alone. Hover names the stop; a click takes its whole task across the plan. And{" "}
        <code>findings()</code> returns the same list folded and unfolded, because it is computed
        from the data and folding is not data.
      </p>

      <h3>A change of scale, not an arrangement</h3>
      <p>
        This is where the component&apos;s two standing sentences would be easiest to break, and
        they are not broken. <strong>A lane is not a row</strong>: a strip is still that machine,
        and every real lane still resolves to exactly one place. <strong>An overlap is never
        packed into sub-lanes</strong>: nothing is moved to make anything fit - every bar keeps
        the time it has and the strip its lane has, smaller.
      </p>

      <h3>What it costs, said plainly</h3>
      <p>
        A strip shows what needs no room: where the work is and whose it is. It shows no
        appearance, no bar label and no progress rail, and it offers no grips - a bar three
        pixels high is not something to stretch by three pixels. That is what unfolding is for,
        and it is one click or one keystroke away.
      </p>
      <p>
        Nor is there a summary of any kind on a folded group - no band of how busy it is, no bar
        spanning its work. A summary is a claim the schedule computes, and once both are bars a
        planner cannot tell a computed claim from a drawn fact. See{" "}
        <code>docs/adr/0025-a-lane-group-is-structure-over-lanes-never-a-lane.md</code>.
      </p>
    </>
  );
}
