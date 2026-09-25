import { useState } from "react";
import { Button, Drawer, ModalBody, ModalFooter, ModalHeader, Text } from "../../../src";

export const title = "A detail from the edge";

/* The first step: a Modal that enters from the right. Everything a modal
   promises holds - the focus stays inside until it is answered, Escape and a
   click beside the sheet close it, and the focus returns to the button that
   opened it - because it is the same native dialog. Head, body and foot are
   the modal's too. */
export default function ADetailFromTheEdge() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Show the order</Button>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <ModalHeader title="Order 4711-03" description="Customer order, released yesterday at 14:20." />
        <ModalBody>
          <Text>12,000 bottles of lemonade, 0.5 l, for delivery on Friday.</Text>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </ModalFooter>
      </Drawer>
    </>
  );
}
