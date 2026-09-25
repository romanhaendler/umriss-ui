import { useState } from "react";
import { Button, Drawer, ModalBody, ModalFooter, ModalHeader, Text } from "../../../src";

export const title = "A detail from the edge";
export const lead = "A `Drawer` is a `Modal` at the right edge, with the same header, body and footer and the same hold on focus.";

export default function ADetailFromTheEdge() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Show the shipment</Button>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <ModalHeader title="Shipment SH-1042" description="Harlow Bakery · out for delivery on tour T-01" />
        <ModalBody>
          <Text>Two parcels, 14 kg in all, to be delivered between 09:00 and 11:00.</Text>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </ModalFooter>
      </Drawer>
    </>
  );
}
