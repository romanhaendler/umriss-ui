export default function WhyDateTimePicker() {
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
          It reports only on commit - &bdquo;Apply&ldquo;, &bdquo;Now&ldquo;,
          &bdquo;Clear&ldquo; - and not already on the click on a day. A day without a time would
          be a half-set value.
        </li>
        <li>
          The missing and the doubled hour of the clock change are recognised and named, instead of
          silently choosing one of the two possibilities.
        </li>
      </ul>
    </>
  );
}
