import { useState } from "react";
import { DateTimePicker, FormField, Stack, Text, useFormats } from "../../../src";

export const title = "Set an instant";
export const lead = "Choose the day, type the time, then Apply; `onChange` runs only then, never with a day that has no time.";

export default function SetAnInstant() {
  const formats = useFormats();
  const [started, setStarted] = useState<Date | null>(null);

  return (
    <Stack gap={3} style={{ maxWidth: 320 }}>
      <FormField label="Customer impact began">
        <DateTimePicker value={started} onChange={setStarted} clearable />
      </FormField>
      <Text size="xs" tone="muted" mono>
        value: {started === null ? "null" : `${formats.dateTime(started, false)} ${formats.offset(started)}`}
      </Text>
    </Stack>
  );
}
