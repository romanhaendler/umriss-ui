import { useId, useState } from "react";
import { DateTimePicker, Stack, Text } from "../../../src";

export const title = "With an error";
export const lead = "A `FormField` with an `error` marks the field invalid by itself. Without one, set `invalid` and tie your message to the field with `aria-describedby`.";

/* INC-1048 was opened by the alert at 09:42. */
const OPENED = new Date(2026, 2, 17, 9, 42);

export default function WithAnError() {
  const [resolved, setResolved] = useState<Date | null>(new Date(2026, 2, 17, 9, 30));
  const messageId = useId();
  const error = resolved !== null && resolved < OPENED ? "Resolved lies before the incident was opened at 09:42." : undefined;

  return (
    <Stack gap={1} style={{ maxWidth: 320 }}>
      <DateTimePicker
        aria-label="Resolved"
        value={resolved}
        onChange={setResolved}
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
