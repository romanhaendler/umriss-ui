import { useId, useState } from "react";
import { Stack, Text, Textarea } from "../../../src";

export const title = "With an error";
export const lead = "A `FormField` with an `error` marks the field invalid by itself. Without one, set `invalid` and tie your message to the field with `aria-describedby`.";

export default function WithAnError() {
  const [rootCause, setRootCause] = useState("Unknown");
  const messageId = useId();
  const error = rootCause.trim().length < 10 ? "Give the root cause in at least ten characters." : undefined;

  return (
    <Stack gap={1} style={{ maxWidth: 420 }}>
      <Textarea
        aria-label="Root cause"
        rows={3}
        value={rootCause}
        onChange={(event) => setRootCause(event.target.value)}
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
