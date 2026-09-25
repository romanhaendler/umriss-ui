import { useState } from "react";
import { Badge, Button, Menu, MenuItem, MenuSeparator, Stack, Text } from "../../../src";

export const title = "Act on a row";
export const lead = "One menu per row keeps a list quiet; the trigger's name says which row it acts on, since every button reads the same.";

interface Incident {
  id: string;
  title: string;
  severity: "SEV1" | "SEV2" | "SEV3";
  state: "open" | "acknowledged" | "resolved";
}

const INCIDENTS: Incident[] = [
  { id: "INC-1048", title: "Checkout slow, card payments time out", severity: "SEV1", state: "acknowledged" },
  { id: "INC-1047", title: "Webhook deliveries delayed", severity: "SEV3", state: "open" },
  { id: "INC-1046", title: "Thumbnails missing for new uploads", severity: "SEV2", state: "resolved" },
];

const TONE = { SEV1: "danger", SEV2: "warning", SEV3: "neutral" } as const;

export default function PerRow() {
  const [incidents, setIncidents] = useState(INCIDENTS);
  const set = (id: string, state: Incident["state"]) =>
    setIncidents((all) => all.map((one) => (one.id === id ? { ...one, state } : one)));

  return (
    <Stack gap={2} style={{ maxWidth: 620 }}>
      {incidents.map((incident) => (
        <Stack key={incident.id} direction="row" gap={3} align="center">
          <Badge tone={TONE[incident.severity]}>{incident.severity}</Badge>
          <Text size="sm" style={{ flex: 1 }}>
            <Text as="span" size="sm" mono>
              {incident.id}
            </Text>{" "}
            {incident.title}
          </Text>
          <Text as="span" size="xs" tone="muted">
            {incident.state}
          </Text>
          <Menu
            align="end"
            trigger={
              <Button size="sm" variant="ghost" aria-label={`Actions for ${incident.id}`}>
                ⋯
              </Button>
            }
          >
            <MenuItem disabled={incident.state !== "open"} onSelect={() => set(incident.id, "acknowledged")}>
              Acknowledge
            </MenuItem>
            <MenuItem disabled={incident.state === "resolved"} onSelect={() => set(incident.id, "resolved")}>
              Resolve
            </MenuItem>
            <MenuItem>Copy the link</MenuItem>
            <MenuSeparator />
            <MenuItem tone="danger" onSelect={() => setIncidents((all) => all.filter((one) => one.id !== incident.id))}>
              Delete
            </MenuItem>
          </Menu>
        </Stack>
      ))}
    </Stack>
  );
}
