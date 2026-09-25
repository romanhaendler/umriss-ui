import { useState } from "react";
import type { CSSProperties } from "react";
import { Button, Checkbox, Drawer, ModalBody, ModalFooter, ModalHeader, Stack, Text } from "../../../src";

export const title = "From the left, and wider";

/* `side="left"` puts the drawer at the other edge, and it enters from there.
   The width is a token, `--u-drawer-width`: an application sets it once for
   all its drawers, and one drawer that needs more room sets it in its own
   `style` - here 480 pixels for a list of filters with long names. */
export default function LeftAndWider() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Filter the alarms</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side="left"
        style={{ "--u-drawer-width": "480px" } as CSSProperties}
      >
        <ModalHeader title="Filter" description="Which alarms the list shows." />
        <ModalBody>
          <Stack gap={3}>
            <Text size="sm" weight="medium">
              Area
            </Text>
            <Checkbox label="Syrup room and mixing stations 1 to 3" defaultChecked />
            <Checkbox label="Filling lines 1 to 4 with capper and labeller" defaultChecked />
            <Checkbox label="Palletiser and stretch wrapper in the dispatch hall" />
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
