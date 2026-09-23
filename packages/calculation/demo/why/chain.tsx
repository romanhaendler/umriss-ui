export default function WhyChain() {
  return (
    <>
      <h3>No precedence, and a times alone</h3>
      <p>
        A chain works every line into the value before it, strictly in order - the way a costing
        sheet is read. There is no precedence, so <code>a + b × c</code> would mean{" "}
        <code>(a + b) × c</code> here and <code>a + (b × c)</code> in a reader&apos;s head. Rather
        than explain that, the chain makes it unwritable: a <code>&lt;Times&gt;</code> or{" "}
        <code>&lt;DividedBy&gt;</code> stands alone between two named values, and anything else
        fails on the first render. Nobody multiplies a number they have not seen.
      </p>

      <h3>A chain does not fold</h3>
      <p>
        A chain is the working itself - folded to its interims it would only repeat the numbers
        and hide the steps it exists to show. So a chain in view stands open, and what a reader
        should see only on request goes into one line as a tree: a <code>&lt;Sum&gt;</code> of
        contributions held by a <code>&lt;Minus&gt;</code> folds like any tree, and opens beneath
        its line. Whoever writes the chain decides, line by line, what is always in view.
      </p>

      <h3>Only an interim shows the running value</h3>
      <p>
        A line shows its own number. A running value without a name is a number nobody can quote;
        where you want to see it, set an <code>&lt;Interim&gt;</code>. See{" "}
        <code>docs/adr/0028-a-calculation-is-a-tree-or-a-chain.md</code>.
      </p>
    </>
  );
}
