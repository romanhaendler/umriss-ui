import { useState } from "react";
import { DateTimeRangePicker, FormField, Stack, Text, useFormats } from "../../../src";
import type { DateRange } from "../../../src";

export const title = "A downtime window";
export const lead = "Click two days, untick All day, type both times, then Apply; the footer counts the duration as you go.";

export default function ADowntimeWindow() {
  const formats = useFormats();
  const [downtime, setDowntime] = useState<DateRange | null>(null);

  return (
    <Stack gap={3} style={{ maxWidth: 360 }}>
      <FormField label="Planned downtime, Billing">
        <DateTimeRangePicker value={downtime} onChange={setDowntime} clearable />
      </FormField>
      <Text size="xs" tone="muted" mono>
        {downtime === null
          ? "value: null"
          : `${formats.dateTime(downtime.from, false)} to ${formats.dateTime(downtime.to, false)}`}
      </Text>
    </Stack>
  );
}
