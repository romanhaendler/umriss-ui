import { useState } from "react";
import { Button, ConfirmDialog, Stack, Text } from "../../../src";

export const title = "The one question";
export const lead = "The `description` says what cannot be undone, and `confirmLabel` names the action – “Delete” says what happens, “OK” does not.";

export default function TheOneQuestion() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState("Draft invoice INV-26-0319 exists.");

  return (
    <Stack gap={3} align="flex-start">
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete the draft
      </Button>
      <Text size="xs" tone="muted">
        {state}
      </Text>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          setState("Draft invoice INV-26-0319 is deleted.");
          setOpen(false);
        }}
        tone="danger"
        title="Delete draft invoice INV-26-0319?"
        description="Its three lines and the attached delivery note go with it. This cannot be undone."
        confirmLabel="Delete"
      />
    </Stack>
  );
}
