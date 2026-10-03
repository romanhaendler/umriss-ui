import { useState } from "react";
import { DateTimePicker, FormField } from "../../../src";

export const title = "With an error";
export const lead = "Set `invalid` while your check fails and give its reason to the `FormField` as `error`: the field turns red and reads the reason out.";

/* INC-1048 was opened by the alert at 09:42. */
const OPENED = new Date(2026, 2, 17, 9, 42);

export default function WithAnError() {
  const [resolved, setResolved] = useState<Date | null>(new Date(2026, 2, 17, 9, 30));
  const error = resolved !== null && resolved < OPENED ? "Resolved lies before the incident was opened at 09:42." : undefined;

  return (
    <FormField label="Resolved" error={error} style={{ maxWidth: 320 }}>
      <DateTimePicker value={resolved} onChange={setResolved} invalid={error !== undefined} />
    </FormField>
  );
}
