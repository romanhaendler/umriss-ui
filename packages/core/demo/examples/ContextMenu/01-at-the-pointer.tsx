import { useState } from "react";
import type { MouseEvent } from "react";
import { ContextMenu, MenuItem, MenuSeparator, Stack, Text } from "../../../src";

export const title = "Open it at the pointer";
export const lead = "On `contextmenu`, keep the event's point and pass it as `position`; `ariaLabel` names what the menu acts on.";

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
