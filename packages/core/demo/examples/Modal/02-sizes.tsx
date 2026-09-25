import { useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Stack, Text } from "../../../src";
import type { ModalSize } from "../../../src";

export const title = "Sizes";
export const lead = "`size` sets the width – `sm` for a short question, `md` for a form, `lg` for a table or long text; the height follows the content.";

export default function Sizes() {
  const [size, setSize] = useState<ModalSize | null>(null);

  return (
    <>
      <Stack direction="row" gap={3}>
        {(["sm", "md", "lg"] as const).map((one) => (
          <Button key={one} onClick={() => setSize(one)}>
            Open {one}
          </Button>
        ))}
      </Stack>
      <Modal open={size !== null} onClose={() => setSize(null)} size={size ?? "md"}>
        <ModalHeader title={`A ${size} window`} />
        <ModalBody>
          <Text>Sprint 15 starts on Monday 23 March with the shop's search and filters.</Text>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setSize(null)}>Close</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
