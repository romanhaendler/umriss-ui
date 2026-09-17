export default function WhyStat() {
  return (
    <>
      <h3>The display gets a rule, not a tone</h3>
      <p>
        A limit is a number, a side and a severity - a statement about a value and not about a
        colour. The colour is derived from it. Whoever handed over a tone instead would have the
        rule in the application and the presentation in the library, and the two would drift apart
        as soon as a bound moves.
      </p>
      <p>
        The same model stands in both packages of this workspace - deliberately, and with a reason
        that justifies it: see{" "}
        <code>docs/adr/0006-the-limit-model-lives-in-both-packages.md</code>.
      </p>

      <h3>A target is not a limit</h3>
      <p>
        A target is never violated but missed by an amount. The deviation is signed and is measured
        against it; the exceedance is always positive and is measured against the violated limit.
        Two numbers, two meanings, and the one is never filled from the other - otherwise a display
        goes red for standing above its target.
      </p>
      <p>
        And a related confusion that is more expensive than it looks: a control limit is not a
        specification limit. See{" "}
        <code>docs/adr/0008-control-limits-are-not-specification-limits.md</code>.
      </p>

      <h3>Unknown is an outcome, not an error</h3>
      <p>
        Four outcomes, ordered: in order, unknown, warning, alarm. A missing or non-finite value
        never falls back into &bdquo;in order&ldquo;, because a value nobody has is a reason to look
        and not a reason to relax.
      </p>

      <h3>Freshness is a different axis</h3>
      <p>
        A stale value keeps its verdict. On a lost connection precisely what a person then needs
        would otherwise be lost: the last picture he had. See{" "}
        <code>docs/adr/0010-a-stale-value-keeps-its-verdict.md</code>.
      </p>
      <p>
        <code>useFreshness</code> is the same hook <code>Stat</code> uses inside, and it is
        exported: out of an as-of time and a pair of ages it computes the state and gives a cadence
        along with it. Without ages there is no display - a timestamp without a rule for when it is
        too old is no information. The cadence is derived from the ages: a display that goes stale
        after five minutes need not recompute every second.
      </p>

      <h3>No trend arrow</h3>
      <p>
        A direction out of two points of a noisy signal is noise with an arrowhead - and is read as
        information. The history line shows the shape; whoever needs a direction needs a chart and
        not a figure.
      </p>
    </>
  );
}
