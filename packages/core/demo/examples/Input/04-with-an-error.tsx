import { useId, useState } from "react";
import { Input, Stack, Text } from "../../../src";

export const title = "With an error";
export const lead = "A `FormField` with an `error` marks the field invalid by itself. Without one, set `invalid` and tie your message to the field with `aria-describedby`. Five digits clear it.";

export default function WithAnError() {
  const [postcode, setPostcode] = useState("2041");
  const messageId = useId();
  const error = /^\d{5}$/.test(postcode) ? undefined : "A postcode here has five digits.";

  return (
    <Stack gap={1} style={{ maxWidth: 360 }}>
      <Input
        aria-label="Postcode"
        value={postcode}
        onChange={(event) => setPostcode(event.target.value)}
        invalid={error !== undefined}
        aria-describedby={error ? messageId : undefined}
        inputMode="numeric"
        autoComplete="postal-code"
      />
      {error && (
        <Text id={messageId} size="xs" style={{ color: "var(--u-color-danger-text)" }}>
          {error}
        </Text>
      )}
    </Stack>
  );
}
