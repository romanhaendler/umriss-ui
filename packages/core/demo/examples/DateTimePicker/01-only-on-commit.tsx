import { useState } from "react";
import { DateTimePicker, FormField, Stack, Text } from "../../../src";

export const title = "It reports only on commit";

/* Unlike `DatePicker`, this one does not report already on the click on a day:
   a day without a time would be a half-set value here, and half a value is no
   value. `onChange` runs on "Apply", "Now" and "Clear".

   On the clock change: pick 25 October and enter 02:30 - the doubled hour is
   recognised and named, instead of silently taking one of the two. */
export default function OnlyOnCommit() {
  const [appointment, setAppointment] = useState<Date | null>(null);

  return (
    <Stack gap={3} style={{ maxWidth: "320px" }}>
      <FormField label="Appointment" hint="Tip: pick 25.10.2026 and enter 02:30.">
        <DateTimePicker value={appointment} onChange={setAppointment} clearable />
      </FormField>
      <Text size="xs" tone="muted" mono>
        {appointment === null ? "null" : appointment.toISOString()}
      </Text>
    </Stack>
  );
}
