import { useRef, useState } from "react";
import { Button, Popover, Stack, Text } from "../../../src";

export const title = "The anchored surface";

/* This is the seam under `Menu`, `Tooltip`, `Select`, `Combobox` and the
   pickers: one placement, one dismissal, one focus model. Whoever uses it
   directly gets exactly the same behaviour as the five above.

   Controlled, like the modal: the popover never opens itself. `onOpenChange`
   reports every wish - outside click, Escape, scrolling - and whether it closes
   in response is the caller's decision.

   `restoreFocus` gives focus back to the trigger on closing. Without it, focus
   stands at the beginning of the document after Escape.

   The surface brings no appearance of its own. Background, radius and shadow
   belong to the caller - `Menu` and `Combobox` hand theirs in through
   `className`, and here they stand on the content. What `Popover` owns is the
   placement and the dismissal, not the look. */
export default function AnchoredSurface() {
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <Stack direction="row" gap={3} align="center">
      <Button ref={anchor} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        Show the surface
      </Button>
      <Popover
        open={open}
        onOpenChange={setOpen}
        anchorRef={anchor}
        role="dialog"
        ariaLabel="Example surface"
        restoreFocus
        width={260}
      >
        <div
          style={{
            padding: "var(--u-space-4)",
            background: "var(--u-color-surface)",
            borderRadius: "var(--u-radius-md)",
            boxShadow: "var(--u-shadow-overlay)",
          }}
        >
          <Text size="sm">
            An outside click, Escape and scrolling all report themselves through `onOpenChange`. The
            surface clamps at the window edge and flips over when there is no room below.
          </Text>
        </div>
      </Popover>
    </Stack>
  );
}
