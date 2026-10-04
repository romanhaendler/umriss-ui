import { useId, useState } from "react";
import { DateTimeRangePicker, Stack, Text } from "../../../src";
import type { DateRange } from "../../../src";

export const title = "With an error";
export const lead = "A `FormField` with an `error` marks the field invalid by itself. Without one, set `invalid` and tie your message to the field with `aria-describedby`.";

/* Checkout is down from 03:00 to 04:00 that night; Search depends on it. */
const CHECKOUT = { from: new Date(2026, 2, 21, 3, 0), to: new Date(2026, 2, 21, 4, 0) };

export default function WithAnError() {
  const [downtime, setDowntime] = useState<DateRange | null>({
    from: new Date(2026, 2, 21, 2, 0),
    to: new Date(2026, 2, 21, 6, 0),
  });
  const messageId = useId();
  const overlaps = downtime !== null && downtime.from < CHECKOUT.to && downtime.to > CHECKOUT.from;
  const error = overlaps ? "Overlaps the downtime of Checkout, 03:00 to 04:00." : undefined;

  return (
    <Stack gap={1} style={{ maxWidth: 420 }}>
      <DateTimeRangePicker
        aria-label="Planned downtime, Search"
        value={downtime}
        onChange={setDowntime}
        invalid={error !== undefined}
        aria-describedby={error ? messageId : undefined}
      />
      {error && (
        <Text id={messageId} size="xs" style={{ color: "var(--u-color-danger-text)" }}>
          {error}
        </Text>
      )}
    </Stack>
  );
}
