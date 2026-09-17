export default function WhyVerdictColumn() {
  return (
    <>
      <h3>An unknown verdict is a verdict</h3>
      <p>
        Where no measured value is there, the verdict reads “unknown” – a fourth outcome beside ok,
        warning and alarm, and not an absent value. The verdict column is therefore the one column
        whose presentation is called even without a value. A stale value keeps its verdict; whether
        it still holds is said by the freshness, not by the assessment. See{" "}
        <code>docs/adr/0010-a-stale-value-keeps-its-verdict.md</code>.
      </p>

      <h3>Sorted by how heavily the verdict weighs</h3>
      <p>
        Sorted by the value, an alarm below the lower bound would stand among the small values, far
        away from the alarm above the upper one. By verdict weight the worst stands at one end, and
        where two weigh the same the previous order stays. Both in one level would mean pressing two
        numbers into one sort value, over a range of values nobody knows –{" "}
        <code>sortBy="value"</code> is the other route, not a mixture.
      </p>

      <h3>What is exported is the value</h3>
      <p>
        The verdict is a function of value and limit set. Whoever needs it in the spreadsheet has
        the set; a second field per column would need a second header row that nobody ordered.
      </p>

      <h3>Built from the public interface alone</h3>
      <p>
        The verdict column is a <code>Column</code> out of the hook, with <code>assess</code> from
        @umriss-ui/core, the formats and the wording – nothing a caller of the package would not
        have as well. Therein lies its second purpose: it proves that a column of the trade needs
        nothing private. The limit model itself stands in both packages, and why is explained by{" "}
        <code>docs/adr/0006-the-limit-model-lives-in-both-packages.md</code>.
      </p>
    </>
  );
}
