import { useState } from "react";
import { Button, CommandPalette, Stack, Text } from "../../../src";

export const title = "Run a command";
export const lead = "Typing finds candidates by subsequence – “ack” finds “Acknowledge the alert”; `onChoose` reports the id and you decide what happens.";

const COMMANDS = [
  { id: "ack", label: "Acknowledge the alert", group: "Incident INC-1048" },
  { id: "page", label: "Page the secondary on call", group: "Incident INC-1048" },
  { id: "status", label: "Post a status update", group: "Incident INC-1048" },
  { id: "resolve", label: "Resolve the incident", group: "Incident INC-1048" },
  { id: "checkout", label: "Open Checkout", group: "Services" },
  { id: "billing", label: "Open Billing", group: "Services" },
  { id: "rota", label: "Show this week's on-call rota", group: "People" },
];

export default function Commands() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState("-");

  return (
    <Stack gap={3} align="flex-start">
      <Button onClick={() => setOpen(true)}>Open the palette</Button>
      <Text size="xs" tone="muted">
        Last run: {last}
      </Text>
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        items={COMMANDS}
        restingItems={COMMANDS}
        onChoose={(id) => {
          setOpen(false);
          setLast(COMMANDS.find((c) => c.id === id)?.label ?? id);
        }}
      />
    </Stack>
  );
}
