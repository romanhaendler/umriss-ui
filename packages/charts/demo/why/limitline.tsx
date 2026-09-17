export default function WhyLimitLine() {
  return (
    <>
      <h3>The limit model lives in both packages, on purpose</h3>
      <p>
        A limit is a value, a side and a severity; a verdict is what a number <em>is</em> given
        those limits. The same model stands in <code>@umriss-ui/core</code> and here - duplicated
        deliberately, because the alternative was a dependency between two packages that are
        meant to be usable apart. What holds the two copies together is not discipline but a
        conformance test that runs both versions from one case table. See{" "}
        <code>docs/adr/0006-the-limit-model-lives-in-both-packages.md</code>.
      </p>

      <h3>A line is a landmark, a band is ground</h3>
      <p>
        The band lies below every series, the line above them. That is not a taste in layering: a
        tolerance band is the area a value should be in, and a curve has to be readable on top of
        it, while a limit is the thing a reader looks for and must not be covered by a stroke that
        happens to run along it.
      </p>

      <h3>The colour follows the severity, and nothing else</h3>
      <p>
        A limit carries <code>severity</code>, and the tone is derived from it. Handing a colour in
        instead would put the rule in the application and the presentation in the library, and the
        two would drift apart the moment a bound moves.
      </p>
    </>
  );
}
