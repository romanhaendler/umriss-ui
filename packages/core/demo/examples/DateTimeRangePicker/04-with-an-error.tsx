import { useState } from "react";
import { DateTimeRangePicker, FormField } from "../../../src";
import type { DateRange } from "../../../src";

export const title = "With an error";
export const lead = "Set `invalid` while your check fails and give its reason to the `FormField` as `error`: the field turns red and reads the reason out.";

/* Checkout is down from 03:00 to 04:00 that night; Search depends on it. */
const CHECKOUT = { from: new Date(2026, 2, 21, 3, 0), to: new Date(2026, 2, 21, 4, 0) };

export default function WithAnError() {
  const [downtime, setDowntime] = useState<DateRange | null>({
    from: new Date(2026, 2, 21, 2, 0),
    to: new Date(2026, 2, 21, 6, 0),
  });
  const overlaps = downtime !== null && downtime.from < CHECKOUT.to && downtime.to > CHECKOUT.from;
  const error = overlaps ? "Overlaps the downtime of Checkout, 03:00 to 04:00." : undefined;

  return (
    <FormField label="Planned downtime, Search" error={error} style={{ maxWidth: 420 }}>
      <DateTimeRangePicker value={downtime} onChange={setDowntime} invalid={error !== undefined} />
    </FormField>
  );
}
