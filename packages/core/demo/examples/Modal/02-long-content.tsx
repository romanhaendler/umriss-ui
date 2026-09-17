import { useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Stack } from "../../../src";

export const title = "Head and foot stand, the body scrolls";

/* The height comes from the content and is bounded above. Where the content
   does not fit, exactly it scrolls - not the whole window. Otherwise the
   closing button travels out of the picture, and that button is the reason the
   window is open. */
export default function LongContent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open the long modal</Button>
      <Modal open={open} onClose={() => setOpen(false)} size="lg">
        <ModalHeader
          title="Policy on project documentation"
          description="Head and foot stand fast - only this content scrolls."
        />
        <ModalBody>
          <Stack gap={4}>
            {Array.from({ length: 14 }, (_, index) => (
              <div key={index}>
                <p style={{ margin: 0, fontWeight: "var(--u-weight-semibold)" }}>
                  &sect; {index + 1} Section
                </p>
                <p style={{ margin: "var(--u-space-1) 0 0", color: "var(--u-color-text-secondary)" }}>
                  Every change to a project is documented with a date, the person responsible and a
                  short reason. References to external documents are to be given a unique
                  identifier, so that they remain findable later.
                </p>
              </div>
            ))}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
          <Button variant="primary" onClick={() => setOpen(false)}>
            Acknowledged
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
