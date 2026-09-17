export default function WhyOverlap() {
  return (
    <>
      <h3>An overlap is never packed into sub-lanes</h3>
      <p>
        Every calendar you have used solves an overlap by splitting the column: two appointments
        at ten o&apos;clock become two half-width boxes side by side. That is right for a
        calendar, where a column is a <em>day</em> and both things can happen. It is wrong for a
        plan, where a lane is a <strong>machine</strong> and both things cannot.
      </p>
      <p>
        Packing would make the picture tidy and the plan a lie: a planner would see two boxes that
        fit and read them as work that fits. So the bars stay where their times put them, each
        offset a few pixels below the last so that all of them can be seen and hit, and the shared
        time is marked underneath. The tidiness is given up on purpose.
      </p>

      <h3>The offset has a floor and a ceiling</h3>
      <p>
        Three levels of offset, and no more. A bar is made short enough that the deepest one still
        lies inside its lane, so an overlap never leaks into the machine below - which would be
        the same lie in a different direction.
      </p>
    </>
  );
}
