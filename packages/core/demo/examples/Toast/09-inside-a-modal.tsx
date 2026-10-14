import { useState } from "react";
import { Button, FormField, Input, Modal, ModalBody, ModalFooter, ModalHeader, Select, Text, Tooltip, useToast } from "../../../src";

export const title = "Inside a modal";
export const lead = "A toast stands above an open modal dialog and can be pressed there: the dialog's \"Save\" fails, and the toast carries \"Retry\" next to the form it belongs to.";

function Content() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const save = () =>
    toast({
      title: "Profile not saved",
      description: "The server did not answer.",
      tone: "danger",
      /* A failure stays until it is read. */
      duration: 0,
      action: { label: "Retry", onClick: save },
    });

  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit the profile</Button>
      <Modal open={open} onClose={() => setOpen(false)} size="sm">
        <ModalHeader title="Edit the profile" description="Changes are saved to the account." />
        <ModalBody>
          <FormField label="Display name">
            <Input defaultValue="Maya Lindgren" />
          </FormField>
          <FormField label="Language">
            <Select defaultValue="en">
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
            </Select>
          </FormField>
          <Tooltip content="Shows the profile as colleagues see it.">
            <Button size="sm" variant="secondary">
              Preview
            </Button>
          </Tooltip>
          <Text size="xs" tone="muted">
            Nothing is kept until it is saved.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={save}>
            Save
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default function InsideAModal() {
  return <Content />;
}
