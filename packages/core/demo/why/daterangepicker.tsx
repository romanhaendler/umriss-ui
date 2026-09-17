export default function WhyDateRangePicker() {
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
          Both ends lie at local midnight and count inclusively.
        </li>
        <li>
          A range dragged backwards is silently turned around. There is no error state a caller
          would have to handle - and therefore none he can forget.
        </li>
      </ul>
    </>
  );
}
