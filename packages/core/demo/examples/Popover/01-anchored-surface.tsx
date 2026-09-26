import { useRef, useState } from "react";
import { Button, Popover, Stack, Text } from "../../../src";

export const title = "An anchored surface";
export const lead = "You hold `open`, the popover hangs from `anchorRef` and reports every wish to close through `onOpenChange`.";

export default function AnchoredSurface() {
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button ref={anchor} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        Sprint 14
      </Button>
      <Popover open={open} onOpenChange={setOpen} anchorRef={anchor} role="dialog" ariaLabel="Sprint 14" restoreFocus width={280}>
        <Stack gap={2} style={{ padding: "var(--u-space-4)" }}>
          <Text size="sm" weight="medium">
            Member portal sign-in and profile
          </Text>
          <Text size="sm" tone="secondary">
            9 to 20 March · 16 items · 334 hours planned
          </Text>
        </Stack>
      </Popover>
    </>
  );
}
