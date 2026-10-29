import { useState } from "react";
import { Button, Drawer, FormField, Input, ModalBody, ModalFooter, ModalHeader, Stack } from "../../../src";

export const title = "The cursor in the field";
export const lead = "An `autoFocus` on a field inside the drawer is honoured, as in a `Modal`.";

export default function TheCursorInTheField() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit the shipment</Button>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <ModalHeader title="Edit the shipment" />
        <ModalBody>
          <Stack gap={4}>
            <FormField label="Consignee">
              <Input defaultValue="Harlow Bakery" />
            </FormField>
            <FormField label="Note">
              <Input autoFocus defaultValue="Ring twice" />
            </FormField>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </ModalFooter>
      </Drawer>
    </>
  );
}
