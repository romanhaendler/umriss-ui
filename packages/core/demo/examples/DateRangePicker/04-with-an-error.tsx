import { useState } from "react";
import { DateRangePicker, FormField } from "../../../src";
import type { DateRange } from "../../../src";

export const title = "With an error";
export const lead = "Set `invalid` while your check fails and give its reason to the `FormField` as `error`: the field turns red and reads the reason out.";

/* Chloe Durand covers for Noah Fischer and is away herself from 23 March. */
const AWAY_FROM = new Date(2026, 2, 23);

export default function WithAnError() {
  const [leave, setLeave] = useState<DateRange | null>({ from: new Date(2026, 2, 16), to: new Date(2026, 2, 27) });
  const error = leave !== null && leave.to >= AWAY_FROM ? "Chloe Durand, who covers for you, is on leave from 23 March." : undefined;

  return (
    <FormField label="Leave, Noah Fischer" error={error} style={{ maxWidth: 360 }}>
      <DateRangePicker value={leave} onChange={setLeave} invalid={error !== undefined} />
    </FormField>
  );
}
