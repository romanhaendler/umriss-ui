import { useId, useState } from "react";
import { Checkbox, Stack, Text } from "../../../src";

export const title = "With an error";
export const lead = "A `FormField` with an `error` marks the checkbox invalid by itself. Without one, set `invalid` and tie your message to the checkbox with `aria-describedby`.";

export default function WithAnError() {
  const [accepted, setAccepted] = useState(false);
  const messageId = useId();
  const error = accepted ? undefined : "Accept the carrier terms to book the pick-up.";

  return (
    <Stack gap={1}>
      <Checkbox
        label="I accept the carrier terms"
        checked={accepted}
        onChange={(event) => setAccepted(event.target.checked)}
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
