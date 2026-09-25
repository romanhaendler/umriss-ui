export default function WhySchedule() {
  return (
    <>
      <h3>The schedule changes nothing</h3>
      <p>
        Drag a bar and the plan does not move. The schedule draws a ghost, assesses it as if it
        were data, and when the drag ends it <strong>reports what was asked for</strong> - a
        move, a lane, a stretch, a lead-in, a lead-out, a place. The subtasks it was given are the
        subtasks it still has. See <code>docs/adr/0023-intents-not-mutations.md</code>.
      </p>
      <p>
        That is not caution, it is the only arrangement that can be true. A planning application
        has rules the schedule cannot know - a mould that fits one press, a shift that ends at
        two, an order that may not start before its material arrives - and a component that
        wrote to the plan first and asked afterwards would be wrong in exactly the cases that
        matter. Here the application is asked first, every time, and nothing is ever travelled to
        and then corrected.
      </p>

      <h3>Every intent carries values, not differences</h3>
      <p>
        A move says where the main time now starts and ends; it does not say &quot;two hours
        later&quot;. Two intents from one drop - a move and a lane - can therefore be applied in
        either order, or one of them alone, or neither. <code>applyIntent</code> is the
        arithmetic, and it is exported so an application can run it without the component.
      </p>

      <h3>What that costs, said plainly</h3>
      <p>
        Nothing happens until you write the handler. The simplest useful schedule is a
        <code> useState</code> and one <code>map</code>. In exchange you get a component that
        cannot corrupt a plan, an undo that is yours, and a cascade
        (<code>ripple</code>) you may run or refuse.
      </p>
    </>
  );
}
