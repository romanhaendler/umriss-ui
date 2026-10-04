import { useId, useState } from "react";
import { Stack, Switch, Text } from "../../../src";

export const title = "With an error";
export const lead = "A `FormField` with an `error` marks the switch invalid by itself. Without one, set `invalid` and tie your message to the switch with `aria-describedby`.";

export default function WithAnError() {
  const [paging, setPaging] = useState(false);
  const messageId = useId();
  const error = paging ? undefined : "A tier 1 service has to page its on-call engineer.";

  return (
    <Stack gap={1}>
      <Switch
        label="Page on-call, Checkout (tier 1)"
        checked={paging}
        onChange={(event) => setPaging(event.target.checked)}
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
