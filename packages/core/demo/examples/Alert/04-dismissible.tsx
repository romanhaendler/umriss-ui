import { useState } from "react";
import { Alert, Button } from "../../../src";

export const title = "Let the reader dismiss it";
export const lead = "`onDismiss` adds a close button and reports the click; whether the message ever comes back is your state.";

export default function Dismissible() {
  const [open, setOpen] = useState(true);

  return open ? (
    <Alert tone="accent" title="Tours now show their delivery windows" onDismiss={() => setOpen(false)}>
      Each stop carries the window the customer booked; late arrivals are marked in the tour list.
    </Alert>
  ) : (
    <Button size="sm" onClick={() => setOpen(true)}>
      Show the message again
    </Button>
  );
}
