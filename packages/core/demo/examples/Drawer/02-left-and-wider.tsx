import { useState } from "react";
import type { CSSProperties } from "react";
import { Button, Checkbox, Drawer, ModalBody, ModalFooter, ModalHeader, Stack, Text } from "../../../src";

export const title = "From the left, and wider";
export const lead = "`side` set to `left` puts it at the other edge; one drawer that needs more room sets `--u-drawer-width` in its own `style`.";

const TEAMS = ["Payments", "Identity", "Discovery", "Messaging", "Integrations", "Insights"];

export default function LeftAndWider() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Filter the alerts</Button>
      <Drawer open={open} onClose={() => setOpen(false)} side="left" style={{ "--u-drawer-width": "480px" } as CSSProperties}>
        <ModalHeader title="Filter" description="Which alerts the list shows." />
        <ModalBody>
          <Stack gap={3}>
            <Text size="sm" weight="medium">
              Owning team
            </Text>
            {TEAMS.map((team) => (
              <Checkbox key={team} label={team} defaultChecked={team === "Payments" || team === "Identity"} />
            ))}
            <Text size="sm" weight="medium">
              Priority
            </Text>
            <Checkbox label="High – pages the on-call engineer at any hour" defaultChecked />
            <Checkbox label="Medium – pages during working hours, otherwise waits" defaultChecked />
            <Checkbox label="Low – collected into the morning's summary" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setOpen(false)}>
            Apply
          </Button>
        </ModalFooter>
      </Drawer>
    </>
  );
}
