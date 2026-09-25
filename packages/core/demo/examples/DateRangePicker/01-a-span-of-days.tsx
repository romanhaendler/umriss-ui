import { useState } from "react";
import { DateRangePicker, FormField, Stack, Text, rangeDays, useFormats } from "../../../src";
import type { DateRange } from "../../../src";

export const title = "A span of days";
export const lead = "Two clicks set both ends, in either order; the value is `{ from, to }`, both inclusive, at local midnight.";

export default function ASpanOfDays() {
  const formats = useFormats();
  const [leave, setLeave] = useState<DateRange | null>(null);

  return (
    <Stack gap={3} style={{ maxWidth: 340 }}>
      <FormField label="Leave">
        <DateRangePicker value={leave} onChange={setLeave} clearable />
      </FormField>
      <Text size="xs" tone="muted" mono>
        {leave === null
          ? "value: null"
          : `${formats.date(leave.from)} to ${formats.date(leave.to)}, ${rangeDays(leave.from, leave.to)} days`}
      </Text>
    </Stack>
  );
}
