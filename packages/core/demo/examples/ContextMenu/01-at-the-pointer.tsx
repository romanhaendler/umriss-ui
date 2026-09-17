import { useState } from "react";
import type { MouseEvent } from "react";
import { ContextMenu, MenuItem, MenuSeparator, Stack, Text } from "../../../src";

export const title = "At the pointer";

/* A context menu belongs to a point, not to a button: the right-click on a
   surface says where it opens, and the caller passes that on. It is
   controlled, like the popover beneath it - `open` and `position` come from
   the caller, `onOpenChange` reports the wish to close.

   The entries are the menu's own `MenuItem` and `MenuSeparator`, with the
   menu's keyboard: arrow keys, Home and End, Escape. On closing the focus
   goes back to where it stood when the menu opened.

   `ariaLabel` is required: a context menu has no trigger whose label could
   name it for a screen reader. */
export default function AtThePointer() {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const [last, setLast] = useState("-");

  const openHere = (event: MouseEvent) => {
    event.preventDefault();
    setAt({ x: event.clientX, y: event.clientY });
  };

  return (
    <Stack gap={3} align="flex-start">
      <div
        onContextMenu={openHere}
        style={{
          width: 320,
          height: 120,
          display: "grid",
          placeItems: "center",
          border: "1px dashed var(--u-edge-color-strong)",
          borderRadius: "var(--u-radius-md)",
        }}
      >
        <Text size="sm" tone="muted">
          Right-click anywhere in here
        </Text>
      </div>
      <ContextMenu
        open={at !== null}
        position={at ?? { x: 0, y: 0 }}
        onOpenChange={(open) => {
          if (!open) setAt(null);
        }}
        ariaLabel="Actions for the surface"
      >
        <MenuItem onSelect={() => setLast("Split")}>Split here</MenuItem>
        <MenuItem onSelect={() => setLast("Note added")}>Add a note</MenuItem>
        <MenuSeparator />
        <MenuItem tone="danger" onSelect={() => setLast("Removed")}>
          Remove
        </MenuItem>
      </ContextMenu>
      <Text size="xs" tone="muted">
        Last: {last}
      </Text>
    </Stack>
  );
}
