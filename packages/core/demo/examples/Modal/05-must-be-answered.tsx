import { useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Stack, Text } from "../../../src";

export const title = "A window that must be answered";
export const lead = "`closeOnBackdrop={false}` lets a stray click beside the window pass, and `hideClose` takes the cross off the header: the footer's answers close it, and Escape still does. The same props hold for a `Drawer`.";

export default function MustBeAnswered() {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState("-");

  const answerWith = (text: string) => {
    setAnswer(text);
    setOpen(false);
  };

  return (
    <Stack gap={3} align="flex-start">
      <Button onClick={() => setOpen(true)}>End my on-call week</Button>
      <Text size="xs" tone="muted">
        Answer: {answer}
      </Text>
      <Modal open={open} onClose={() => setOpen(false)} size="sm" closeOnBackdrop={false}>
        <ModalHeader title="Hand over two open incidents?" hideClose />
        <ModalBody>
          <Text size="sm">INC-1048 and INC-1051 are still open. Luis Moreno is on call next.</Text>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => answerWith("stayed on call")}>Stay on call</Button>
          <Button variant="primary" onClick={() => answerWith("handed over to Luis Moreno")}>
            Hand over to Luis
          </Button>
        </ModalFooter>
      </Modal>
    </Stack>
  );
}
