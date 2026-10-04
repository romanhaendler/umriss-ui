import { useId, useState } from "react";
import { Select, Stack, Text } from "../../../src";

export const title = "With an error";
export const lead = "A `FormField` with an `error` marks the field invalid by itself. Without one, set `invalid` and tie your message to the field with `aria-describedby`.";

export default function WithAnError() {
  /* The supplier invoices from Austria, so only reverse charge is right. */
  const [rate, setRate] = useState("19");
  const messageId = useId();
  const error = rate === "0" ? undefined : "Invoices from abroad are booked with reverse charge.";

  return (
    <Stack gap={1} style={{ maxWidth: 360 }}>
      <Select
        aria-label="VAT rate, Alpenholz GmbH (Austria)"
        value={rate}
        onChange={(event) => setRate(event.target.value)}
        invalid={error !== undefined}
        aria-describedby={error ? messageId : undefined}
      >
        <option value="19">19 %</option>
        <option value="7">7 %</option>
        <option value="0">Reverse charge</option>
      </Select>
      {error && (
        <Text id={messageId} size="xs" style={{ color: "var(--u-color-danger-text)" }}>
          {error}
        </Text>
      )}
    </Stack>
  );
}
