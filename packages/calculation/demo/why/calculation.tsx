export default function WhyCalculation() {
  return (
    <>
      <h3>The library computes what it shows</h3>
      <p>
        There is no prop for a result. Every number on a derived line is computed with the
        operator the line names, by the calculation itself - so a page cannot say
        &quot;412 ÷ 450&quot; beside a figure that was computed from something else. That is also
        why there is no formula text and no operator of your own: a written-out operation the
        library did not perform could say something the number does not.
      </p>

      <h3>Written as it is shown</h3>
      <p>
        The nesting is the fold structure and the child order is the operand order. A quantity used
        twice is defined once, where you place it, and stands everywhere else as a{" "}
        <code>&lt;Ref&gt;</code>. What TypeScript cannot check - a reference to nothing, a circle
        through references, a wrapper component the calculation cannot look into - fails on the
        first render with a message saying which. See{" "}
        <code>docs/adr/0027-a-calculation-is-written-as-it-is-shown.md</code>.
      </p>
    </>
  );
}
