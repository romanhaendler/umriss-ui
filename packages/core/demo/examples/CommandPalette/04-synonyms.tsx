import { useState } from "react";
import { Button, CommandPalette, Stack, Text } from "../../../src";
import type { CommandPaletteItem } from "../../../src";

export const title = "Find a command by its synonyms";
export const lead = "`keywords` lets “snooze” find “Mute the alert for an hour”: they are searched after the label and the group, as a run of three letters or more, and their finds stand last and unmarked.";

const COMMANDS: CommandPaletteItem[] = [
  { id: "mute", label: "Mute the alert for an hour", group: "Incident INC-1048", keywords: ["snooze", "silence"] },
  { id: "page", label: "Page the secondary on call", group: "Incident INC-1048", keywords: ["escalate", "notify"] },
  { id: "status", label: "Post a status update", group: "Incident INC-1048", keywords: ["announce", "broadcast"] },
  { id: "resolve", label: "Resolve the incident", group: "Incident INC-1048", keywords: ["close", "done"] },
];

export default function Synonyms() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState("-");

  return (
    <Stack gap={3} align="flex-start">
      <Button onClick={() => setOpen(true)}>Find a command</Button>
      <Text size="xs" tone="muted">
        Try “snooze”, “escalate” or “close”. Last run: {last}
      </Text>
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        items={COMMANDS}
        onChoose={(id) => {
          setOpen(false);
          setLast(COMMANDS.find((c) => c.id === id)?.label ?? id);
        }}
      />
    </Stack>
  );
}
