import { useState } from "react";
import { Button, FormField, Input, Modal, ModalBody, ModalFooter, ModalHeader } from "../../../src";

export const title = "The cursor in the field";
export const lead = "An `autoFocus` on a field inside the window is honoured: the window opens with the cursor there, not on the cross.";

export default function TheCursorInTheField() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit the contact</Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalHeader title="Edit the contact" />
        <ModalBody>
          <FormField label="Name">
            <Input defaultValue="Maya Lindgren" />
          </FormField>
          <FormField label="Phone">
            <Input autoFocus defaultValue="+49 40 555 0142" />
          </FormField>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
