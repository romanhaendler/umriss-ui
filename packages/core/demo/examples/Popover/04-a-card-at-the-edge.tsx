import { useRef, useState } from "react";
import { Button, Popover, Stack, Text } from "../../../src";

export const title = "A card at the right edge";
export const lead = "A name at the end of a row opens its card `align=\"end\"`, so the card grows back into the page; `offset` sets it a little further off the row, and `hideOnScroll` closes it when the page scrolls instead of letting it travel along.";

export default function ACardAtTheEdge() {
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <Stack direction="row" justify="space-between" align="center" gap={3}>
      <Text size="sm">INC-1048 · Checkout fails for card payments</Text>
      <Button ref={anchor} size="sm" variant="ghost" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        Maya Lindgren
      </Button>
      <Popover open={open} onOpenChange={setOpen} anchorRef={anchor} align="end" offset={8} hideOnScroll role="dialog" ariaLabel="Maya Lindgren" width={260}>
        <Stack gap={1} style={{ padding: "var(--u-space-4)" }}>
          <Text size="sm" weight="medium">
            Maya Lindgren
          </Text>
          <Text size="sm" tone="secondary">
            Incident lead · Payments team
          </Text>
          <Text size="xs" tone="muted">
            On call until Friday, 18:00
          </Text>
        </Stack>
      </Popover>
    </Stack>
  );
}
