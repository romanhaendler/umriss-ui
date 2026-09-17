import { useState } from "react";
import { DatePicker, FormField, Stack, Text } from "../../../src";

export const title = "The value: local midnight";

/* The pickers' value contract stands on this page, because it is easiest to see
   here - the three others point at it.

   Every path to a value - grid, "Today", typing, clearing - hands out a `Date`
   at local midnight. There is no path that delivers a time of day with it, and
   therefore no question about what 00:00 means here.

   `onChange` runs as soon as the day is settled. `null` means: no day. */
export default function ValueContract() {
  const [effectiveDate, setEffectiveDate] = useState<Date | null>(null);

  return (
    <Stack gap={3} style={{ maxWidth: "320px" }}>
      <FormField label="Effective date" hint="Typing works too: 5.4. or 05.04.2026.">
        <DatePicker value={effectiveDate} onChange={setEffectiveDate} clearable />
      </FormField>
      <Text size="xs" tone="muted" mono>
        {effectiveDate === null ? "null" : effectiveDate.toISOString()}
      </Text>
    </Stack>
  );
}
