export default function WhyGauge() {
  return (
    <>
      <h3>A needle, not a number</h3>
      <p>
        A <code>Gauge</code> is read at a glance &ndash; the needle&apos;s angle
        says <strong>more</strong> than the digits, see{" "}
        <a href="#/meter">Meter</a> and <em>the ADR</em>.
      </p>
      <ul>
        <li>One value.</li>
        <li>One limit set.</li>
      </ul>
    </>
  );
}
