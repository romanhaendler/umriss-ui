import { useState } from "react";
import { Button, ConfirmDialog, Stack, Text } from "../../../src";

export const title = "Ask before a commitment";
export const lead = "Not every irreversible step destroys something: the `primary` tone asks before closing a month, which then accepts no postings.";

export default function ACommitment() {
  const [open, setOpen] = useState(false);
  const [closed, setClosed] = useState(false);

  return (
    <Stack gap={3} align="flex-start">
      <Button variant="primary" disabled={closed} onClick={() => setOpen(true)}>
        Close February
      </Button>
      <Text size="xs" tone="muted">
        February 2026 is {closed ? "closed" : "open for postings"}.
      </Text>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          setClosed(true);
          setOpen(false);
        }}
        tone="primary"
        title="Close February 2026?"
        description="Actuals for February can no longer be posted or corrected; late invoices go to March."
        confirmLabel="Close the month"
      />
    </Stack>
  );
}
