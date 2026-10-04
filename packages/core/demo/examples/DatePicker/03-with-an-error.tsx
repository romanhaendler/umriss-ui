import { useId, useState } from "react";
import { DatePicker, Stack, Text } from "../../../src";

export const title = "With an error";
export const lead = "A `FormField` with an `error` marks the field invalid by itself. Without one, set `invalid` and tie your message to the field with `aria-describedby`.";

export default function WithAnError() {
  const [delivery, setDelivery] = useState<Date | null>(new Date(2026, 2, 16));
  const messageId = useId();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const error = delivery !== null && delivery < today ? "The delivery date cannot lie before today." : undefined;

  return (
    <Stack gap={1} style={{ maxWidth: 280 }}>
      <DatePicker
        aria-label="Delivery"
        value={delivery}
        onChange={setDelivery}
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
