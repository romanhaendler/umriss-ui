import { useState } from "react";
import {
  Button,
  FormField,
  Grid,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
} from "../../../src";

export const title = "A window that holds focus";

/* Controlled: opening is the caller's decision, and only he knows whether
   something may be open right now. `onClose` reports every wish to close -
   Escape, the cross, a click on the backdrop - and the caller decides whether
   he follows it.

   The title in the head names the window for the screen reader at the same
   time. Without it, it says only "dialog". */
export default function AWindow() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open the modal</Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalHeader
          title="Create a project"
          description="The name and the people responsible can be changed later at any time."
        />
        <ModalBody>
          <Grid minItemWidth="200px" gap={4}>
            <FormField label="Project name" required>
              <Input placeholder="e.g. Juno" />
            </FormField>
            <FormField label="Responsible">
              <Select defaultValue="">
                <option value="" disabled>
                  Choose a person
                </option>
                <option value="mw">M. Weber</option>
                <option value="jf">J. Fontaine</option>
              </Select>
            </FormField>
          </Grid>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setOpen(false)}>
            Create
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
