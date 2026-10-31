import { Activity, useState } from "react";
import { Button, ConfirmDialog, Modal, ModalBody, ModalFooter, ModalHeader, Stack, Text } from "../../../src";

export const title = "A question inside a window";
export const lead = "A `ConfirmDialog` rendered inside a `Modal` closes only itself, and a window whose part of the page is hidden with `Activity` closes with it and opens again when the part returns.";

export default function QuestionInside() {
  const [shown, setShown] = useState(true);
  const [open, setOpen] = useState(false);
  const [asking, setAsking] = useState(false);
  const [done, setDone] = useState("-");

  return (
    <Stack gap={3} align="flex-start">
      <Button size="sm" onClick={() => setShown((s) => !s)}>
        {shown ? "Hide this part of the page" : "Show this part of the page"}
      </Button>
      <Activity mode={shown ? "visible" : "hidden"}>
        <Stack gap={3} align="flex-start">
          <Button onClick={() => setOpen(true)}>Archive the project</Button>
          <Text size="xs" tone="muted">
            Last answer: {done}
          </Text>
          <Modal open={open} onClose={() => setOpen(false)} size="sm">
            <ModalHeader title="Archive Harbour redesign" />
            <ModalBody>
              <Text size="sm">Its tasks become read-only for everyone.</Text>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="danger" onClick={() => setAsking(true)}>
                Archive
              </Button>
            </ModalFooter>
            <ConfirmDialog
              open={asking}
              onClose={() => setAsking(false)}
              onConfirm={() => {
                setDone("archived");
                setAsking(false);
                setOpen(false);
              }}
              tone="danger"
              title="Archive for good?"
              confirmLabel="Archive for good"
              cancelLabel="Keep it"
            />
          </Modal>
        </Stack>
      </Activity>
    </Stack>
  );
}
