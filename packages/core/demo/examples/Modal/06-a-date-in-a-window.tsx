import { useState } from "react";
import { Button, DatePicker, FormField, Modal, ModalBody, ModalFooter, ModalHeader } from "../../../src";

export const title = "A date in a window";
export const lead = "A picker's panel and the lists inside it open within the window: a pick in the month list keeps the panel, and Escape closes the list, then the panel, then the window.";

export default function ADateInAWindow() {
  const [open, setOpen] = useState(false);
  const [due, setDue] = useState<Date | null>(null);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Set the due date</Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalHeader title="Due date" />
        <ModalBody>
          <FormField label="Due">
            <DatePicker value={due} onChange={setDue} clearable />
          </FormField>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => setOpen(false)}>
            Done
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
