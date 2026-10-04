import { useId, useState } from "react";
import { DateRangePicker, Stack, Text } from "../../../src";
import type { DateRange } from "../../../src";

export const title = "With an error";
export const lead = "A `FormField` with an `error` marks the field invalid by itself. Without one, set `invalid` and tie your message to the field with `aria-describedby`.";

/* Chloe Durand covers for Noah Fischer and is away herself from 23 March. */
const AWAY_FROM = new Date(2026, 2, 23);

export default function WithAnError() {
  const [leave, setLeave] = useState<DateRange | null>({ from: new Date(2026, 2, 16), to: new Date(2026, 2, 27) });
  const messageId = useId();
  const error = leave !== null && leave.to >= AWAY_FROM ? "Chloe Durand, who covers for you, is on leave from 23 March." : undefined;

  return (
    <Stack gap={1} style={{ maxWidth: 360 }}>
      <DateRangePicker
        aria-label="Leave, Noah Fischer"
        value={leave}
        onChange={setLeave}
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
