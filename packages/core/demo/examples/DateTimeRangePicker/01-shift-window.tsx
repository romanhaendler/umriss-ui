import { useState } from "react";
import { DateTimeRangePicker, FormField, Stack, Text, useFormats } from "../../../src";
import type { DateRange } from "../../../src";

export const title = "A shift window";

/* Two clicks set the days, after which focus jumps into the first time field:
   type 0800, move on, type 1700, Enter.

   "All day" is the default with an empty value. It sets 00:00-23:59 and turns
   the whole thing back into the two-click choice - whoever needs no time should
   not have to enter one.

   It reports only on commit; if the end lies before the start, the two swap
   silently while doing so. */
export default function ShiftWindow() {
  const [shift, setShift] = useState<DateRange | null>(null);
  const formats = useFormats();

  return (
    <Stack gap={3} style={{ maxWidth: "360px" }}>
      <FormField label="Shift window" hint="Click the days, type 0800, type 1700, Enter.">
        <DateTimeRangePicker value={shift} onChange={setShift} clearable />
      </FormField>
      <Text size="xs" tone="muted" mono>
        {shift === null
          ? "null"
          : `${formats.dateTime(shift.from, true)} - ${formats.dateTime(shift.to, true)}`}
      </Text>
    </Stack>
  );
}
