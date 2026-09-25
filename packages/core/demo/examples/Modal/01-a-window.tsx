import { useState } from "react";
import { Button, FormField, Grid, Input, Modal, ModalBody, ModalFooter, ModalHeader, Select } from "../../../src";

export const title = "A window that holds focus";
export const lead = "You hold `open`; `onClose` reports Escape, the cross and a click on the backdrop. The header's title names the dialog.";

export default function AWindow() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open the modal</Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalHeader title="Create a project" description="The name, client and lead can be changed later." />
        <ModalBody>
          <Grid minItemWidth="200px" gap={4}>
            <FormField label="Project name" required>
              <Input placeholder="e.g. Member portal" />
            </FormField>
            <FormField label="Client">
              <Input placeholder="e.g. Rowan Credit Union" />
            </FormField>
            <FormField label="Lead">
              <Select defaultValue="">
                <option value="" disabled>
                  Choose a person
                </option>
                <option value="maya">Maya Lindgren</option>
                <option value="luis">Luis Moreno</option>
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
