import { useState } from "react";
import { Alert, Button, Stack } from "../../../src";

export const title = "With actions, and dismissible";

/* A message that has a way forward belongs together with it: `actions` stands
   under the text and not somewhere else on the page.

   `onDismiss` makes the message dismissible. It does not come back from that -
   what happens afterwards belongs to the caller. */
export default function WithActions() {
  const [open, setOpen] = useState(true);

  return (
    <Stack gap={3}>
      <Alert
        tone="warning"
        title="Two fields still need attention"
        actions={<Button size="sm">Go to the first field</Button>}
      >
        The cost centre is missing, and the period lies in the past.
      </Alert>

      {open ? (
        <Alert
          tone="danger"
          title="Import failed"
          onDismiss={() => setOpen(false)}
          actions={
            <>
              <Button size="sm" variant="primary">
                Try again
              </Button>
              <Button size="sm" variant="ghost">
                View the log
              </Button>
            </>
          }
        >
          The far end did not answer within 30 seconds. Nothing was changed.
        </Alert>
      ) : (
        <Button size="sm" onClick={() => setOpen(true)}>
          Bring the dismissed message back
        </Button>
      )}
    </Stack>
  );
}
