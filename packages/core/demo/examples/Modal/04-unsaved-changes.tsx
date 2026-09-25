import { useState } from "react";
import {
  Button,
  ConfirmDialog,
  FormField,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  NumberInput,
  Stack,
  Text,
} from "../../../src";

export const title = "Guard unsaved changes";
export const lead = "Because `onClose` only reports the wish, a window with edits can ask first instead of throwing them away.";

export default function UnsavedChanges() {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(32);
  const [hours, setHours] = useState<number | null>(32);
  const [asking, setAsking] = useState(false);
  const dirty = hours !== saved;

  const close = () => {
    setOpen(false);
    setAsking(false);
    setHours(saved);
  };

  return (
    <Stack gap={3} align="flex-start">
      <Button
        onClick={() => {
          setHours(saved);
          setOpen(true);
        }}
      >
        Edit Maya's capacity
      </Button>
      <Text size="xs" tone="muted">
        Capacity: {saved} h a week
      </Text>
      <Modal open={open} onClose={() => (dirty ? setAsking(true) : close())} size="sm">
        <ModalHeader title="Maya Lindgren" description="Product manager · Web" />
        <ModalBody>
          <FormField label="Hours a week">
            <NumberInput value={hours} onChange={setHours} min={0} max={40} />
          </FormField>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => (dirty ? setAsking(true) : close())}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => {
              if (hours !== null) setSaved(hours);
              setOpen(false);
            }}
          >
            Save
          </Button>
        </ModalFooter>
      </Modal>
      <ConfirmDialog
        open={asking}
        onClose={() => setAsking(false)}
        onConfirm={close}
        tone="danger"
        title="Discard the change?"
        description={`The capacity stays at ${saved} h a week.`}
        confirmLabel="Discard"
        cancelLabel="Keep editing"
      />
    </Stack>
  );
}
