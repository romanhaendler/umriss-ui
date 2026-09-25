import { useState } from "react";
import { DatePicker, FormField, Stack, Text, useFormats } from "../../../src";

export const title = "Pick a day";
export const lead = "The value is a `Date` at local midnight or `null`; `onChange` runs as soon as a day is chosen.";

export default function PickADay() {
  const formats = useFormats();
  const [delivery, setDelivery] = useState<Date | null>(null);

  return (
    <Stack gap={3} style={{ maxWidth: 320 }}>
      <FormField label="Delivery date">
        <DatePicker value={delivery} onChange={setDelivery} clearable />
      </FormField>
      <Text size="xs" tone="muted" mono>
        value: {delivery === null ? "null" : formats.dateTime(delivery, true)}
      </Text>
    </Stack>
  );
}
