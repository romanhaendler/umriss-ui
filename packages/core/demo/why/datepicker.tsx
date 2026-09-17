export default function WhyDatePicker() {
  return (
    <>
      <h3>The value contract of the four pickers</h3>
      <p>
        It stands here once, and the three other picker pages point at it.
      </p>
      <ul>
        <li>
          <strong>DatePicker</strong> hands out local midnight, on every path - grid,
          &bdquo;Today&ldquo;, typing, clearing. There is no path that delivers a time of day with
          it.
        </li>
        <li>
          <strong>DateTimePicker</strong> reports only on commit: &bdquo;Apply&ldquo;,
          &bdquo;Now&ldquo;, &bdquo;Clear&ldquo;. A day without a time would be a half-set value.
        </li>
        <li>
          <strong>DateRangePicker</strong> gives both ends at local midnight, both inclusive, and{" "}
          <code>from</code> never lies behind <code>to</code>.
        </li>
        <li>
          <strong>DateTimeRangePicker</strong> sets the end for &bdquo;All day&ldquo; to the end of
          the day (23:59 or 23:59:59) and not to its midnight.
        </li>
      </ul>

      <h3>There is no error state</h3>
      <p>
        A range dragged backwards is silently turned around. That is not leniency but a decision
        about where a state should live: a picker that could show &bdquo;from lies behind to&ldquo;
        would have an invalid intermediate state that every caller has to handle - and that one of
        them will eventually forget.
      </p>

      <h3>The clock change is named, not guessed</h3>
      <p>
        A missing hour and a doubled hour are two different situations, and both are real in a
        shift plan. The picker recognises them and says so, instead of silently choosing one of the
        two possibilities. For a range this holds for each end separately.
      </p>

      <h3><code>null</code> is not a date</h3>
      <p>
        No value is a state of its own and not the 1st of January 1970. That holds here as it does
        for <code>NumberInput</code>: a figure that was not taken is not a figure with a special
        value.
      </p>
    </>
  );
}
