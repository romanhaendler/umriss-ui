import { useState } from "react";
import { ContextMenu, MenuItem, MenuSeparator, Stack, Text, useContextMenuTrigger } from "../../../src";

export const title = "Open it on a row, by pointer, finger or keyboard";
export const lead = "`useContextMenuTrigger` per row: a right-click opens it at the pointer, a long press at the finger, Shift+F10 or the menu key at the focused row, so no reader is left out.";

const SHIPMENTS = [
  { id: "SH-1042", customer: "Harlow Bakery", window: "09:00–11:00" },
  { id: "SH-1043", customer: "Pine & Oak Florist", window: "10:00–12:00" },
  { id: "SH-1044", customer: "Moreau Optics", window: "11:30–13:30" },
];

/* A focusable row owes a visible focus: the library's ring, from its token. */
const STYLE = `
.shipment-row:focus-visible {
  outline: none;
  box-shadow: var(--u-focus-ring);
}
`;

function Row({ shipment, active, onOpen }: { shipment: (typeof SHIPMENTS)[number]; active: boolean; onOpen: (at: { x: number; y: number }) => void }) {
  const trigger = useContextMenuTrigger(onOpen);
  return (
    <div
      role="listitem"
      tabIndex={0}
      className="shipment-row"
      {...trigger}
      style={{
        ...trigger.style,
        display: "flex",
        gap: "var(--u-space-3)",
        padding: "var(--u-space-2) var(--u-space-3)",
        borderBottom: "1px solid var(--u-edge-color)",
        background: active ? "var(--u-color-accent-subtle)" : undefined,
      }}
    >
      <Text as="span" size="sm" mono>
        {shipment.id}
      </Text>
      <Text as="span" size="sm" style={{ flex: 1 }}>
        {shipment.customer}
      </Text>
      <Text as="span" size="sm" tone="muted" mono>
        {shipment.window}
      </Text>
    </div>
  );
}

export default function OnARow() {
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [last, setLast] = useState("-");

  const run = (what: string) => () => setLast(`${what} ${menu?.id ?? ""}`);

  return (
    <Stack gap={3} style={{ maxWidth: 480 }}>
      <style>{STYLE}</style>
      <div role="list" aria-label="Shipments">
        {SHIPMENTS.map((shipment) => (
          <Row key={shipment.id} shipment={shipment} active={menu?.id === shipment.id} onOpen={(at) => setMenu({ id: shipment.id, ...at })} />
        ))}
      </div>
      <ContextMenu
        open={menu !== null}
        position={menu ?? { x: 0, y: 0 }}
        onOpenChange={(open) => {
          if (!open) setMenu(null);
        }}
        aria-label={`Actions for shipment ${menu?.id ?? ""}`}
      >
        <MenuItem onSelect={run("Tracked")}>Track the shipment</MenuItem>
        <MenuItem onSelect={run("Rescheduled")}>Move to tomorrow</MenuItem>
        <MenuSeparator />
        <MenuItem tone="danger" onSelect={run("Returned")}>
          Return to sender
        </MenuItem>
      </ContextMenu>
      <Text size="xs" tone="muted">
        Last: {last}
      </Text>
    </Stack>
  );
}
