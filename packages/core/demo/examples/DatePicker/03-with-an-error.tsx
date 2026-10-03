import { useState } from "react";
import { DatePicker, FormField } from "../../../src";

export const title = "With an error";
export const lead = "Set `invalid` while your check fails and give its reason to the `FormField` as `error`: the field turns red and reads the reason out.";

export default function WithAnError() {
  const [delivery, setDelivery] = useState<Date | null>(new Date(2026, 2, 16));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const error = delivery !== null && delivery < today ? "The delivery date cannot lie before today." : undefined;

  return (
    <FormField label="Delivery" error={error} style={{ maxWidth: 280 }}>
      <DatePicker value={delivery} onChange={setDelivery} invalid={error !== undefined} />
    </FormField>
  );
}
