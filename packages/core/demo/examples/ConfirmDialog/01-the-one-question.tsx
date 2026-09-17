import { useState } from "react";
import { Button, ConfirmDialog, Stack, Text } from "../../../src";

export const title = "The one question";

/* It is for what cannot be taken back - and only for that. A question before
   every action gets clicked away after the third time, and then it no longer
   protects even the one it was there for.

   The description is the most important line: it says what exactly
   disappears. And the button is named after the action - "Delete" says what is
   about to happen, "Confirm" does not. */
export default function TheOneQuestion() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState("Batch A-2041 exists.");

  return (
    <Stack gap={3} align="flex-start">
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete the batch
      </Button>
      <Text size="xs" tone="muted">
        {state}
      </Text>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          setState("Batch A-2041 is deleted.");
          setOpen(false);
        }}
        tone="danger"
        title="Delete batch A-2041?"
        description="The batch log and the 1,204 measurements in it are deleted with it. This cannot be undone."
        confirmLabel="Delete"
      />
    </Stack>
  );
}
