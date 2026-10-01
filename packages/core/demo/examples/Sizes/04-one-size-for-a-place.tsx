import { useState } from "react";
import {
  Button,
  ButtonGroup,
  ControlSizeProvider,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  Stack,
} from "../../../src";

export const title = "One size for a place";
export const lead =
  "Wrap a dense place in `ControlSizeProvider size=\"sm\"`, and every control in it is small without a word - fields, buttons, groups. A control's own `size` still wins, and a dialog opened from inside keeps a dialog's controls.";

export default function OneSizeForAPlace() {
  const [day, setDay] = useState<Date | null>(new Date(2026, 2, 17));
  const [open, setOpen] = useState(false);

  return (
    <ControlSizeProvider size="sm">
      <Stack direction="row" gap={2} align="center" wrap>
        <Input aria-label="Search the log" placeholder="Search the log" />
        <Select aria-label="Line" defaultValue="all">
          <option value="all">Every line</option>
          <option value="1">Line 1</option>
          <option value="2">Line 2</option>
        </Select>
        <DatePicker aria-label="Shift day" value={day} onChange={setDay} />
        <ButtonGroup aria-label="Shift">
          <Button>Early</Button>
          <Button>Late</Button>
          <Button>Night</Button>
        </ButtonGroup>
        <Button variant="primary" onClick={() => setOpen(true)}>
          New entry
        </Button>
      </Stack>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalHeader title="New log entry" description="Opened from the small bar, it keeps a dialog's controls." />
        <ModalBody>
          <Input aria-label="What happened" placeholder="What happened" />
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setOpen(false)}>
            Save
          </Button>
        </ModalFooter>
      </Modal>
    </ControlSizeProvider>
  );
}
