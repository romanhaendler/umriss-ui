import { useRef, useState } from "react";
import { Button, Popover, Stack, Text } from "../../../src";

export const title = "Width from the anchor, and without giving focus back";

/* `width="anchor"` takes over the width of the trigger - that is what a select
   needs, so that the list under the field is exactly as wide as the field.
   `minWidth` catches the case where the trigger is narrower than the content
   would be readable at.

   `hideOnScroll` closes on scrolling instead of travelling along - that is the
   mode the tooltip runs in. */
export default function WidthFromAnchor() {
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <Stack direction="row" gap={3} align="center">
      <Button ref={anchor} style={{ width: 220 }} onClick={() => setOpen((o) => !o)}>
        A wide trigger
      </Button>
      <Popover
        open={open}
        onOpenChange={setOpen}
        anchorRef={anchor}
        role="dialog"
        ariaLabel="As wide as the trigger"
        width="anchor"
        minWidth={180}
        hideOnScroll
      >
        <div
          style={{
            padding: "var(--u-space-3)",
            background: "var(--u-color-surface)",
            borderRadius: "var(--u-radius-md)",
            boxShadow: "var(--u-shadow-overlay)",
          }}
        >
          <Text size="sm" tone="secondary">
            As wide as the trigger.
          </Text>
        </div>
      </Popover>
    </Stack>
  );
}
