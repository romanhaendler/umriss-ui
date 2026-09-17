export default function WhyDateTimeRangePicker() {
  return (
    <>
      <h3>The value contract stands on <code>DatePicker</code></h3>
      <p>
        What a picker hands out, when it reports it, and what <code>null</code> means holds for all
        four alike and therefore stands once - under &bdquo;Why it is like this&ldquo; on the page{" "}
        <a href="#/datepicker">DatePicker</a>. Here only what this component does differently:
      </p>
      <ul>
        <li>
          It reports only on &bdquo;Apply&ldquo;, never between the two clicks.
        </li>
        <li>
          &bdquo;All day&ldquo; sets the end to the END of the day (23:59 or 23:59:59) and not to
          its midnight - otherwise an all-day range would be one day too short.
        </li>
        <li>
          The reservation about the clock change holds for each end of the range separately.
        </li>
      </ul>
    </>
  );
}
