import { useEffect, useState } from "react";
import { Button, ConfirmDialog, Stack, Text } from "../../../src";

export const title = "Stay open while it runs";
export const lead = "The dialog does not close itself on `onConfirm`; set `loading` while the request runs and close it when it is done.";

export default function WhileItRuns() {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [rejected, setRejected] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => {
      setRunning(false);
      setRejected(true);
      setOpen(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [running]);

  return (
    <Stack gap={3} align="flex-start">
      <Button variant="danger" disabled={rejected} onClick={() => setOpen(true)}>
        Reject the invoice
      </Button>
      <Text size="xs" tone="muted">
        INV-26-0317 from Kettering &amp; Shaw Events is {rejected ? "rejected" : "awaiting approval"}.
      </Text>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => setRunning(true)}
        loading={running}
        tone="danger"
        title="Reject invoice INV-26-0317?"
        description="The supplier is told by e-mail and must send a new invoice."
        confirmLabel="Reject"
      />
    </Stack>
  );
}
