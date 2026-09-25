import { useRef, useState } from "react";
import { Button, Popover, Stack, Text } from "../../../src";

export const title = "Take the width of the trigger";
export const lead = "`width` set to `anchor` makes the surface as wide as its trigger, as a list under a field needs; `minWidth` keeps it readable.";

const SURFACE = {
  padding: "var(--u-space-3)",
  background: "var(--u-color-surface)",
  borderRadius: "var(--u-radius-md)",
  boxShadow: "var(--u-shadow-overlay)",
};

export default function WidthFromAnchor() {
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button ref={anchor} style={{ width: 240 }} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        Riverside depot · 2 vehicles
      </Button>
      <Popover
        open={open}
        onOpenChange={setOpen}
        anchorRef={anchor}
        role="dialog"
        ariaLabel="Vehicles at Riverside depot"
        width="anchor"
        minWidth={180}
        restoreFocus
      >
        <Stack gap={1} style={SURFACE}>
          <Text size="sm" mono>FP 402 R · van</Text>
          <Text size="sm" mono>FP 455 R · e-van</Text>
        </Stack>
      </Popover>
    </>
  );
}
