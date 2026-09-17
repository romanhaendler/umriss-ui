import { useState } from "react";
import { Button, CommandPalette, Stack, Text } from "../../../src";

export const title = "Commands instead of places";

/* The same component jumps to pages in the shell of this demo (Cmd-K) and runs
   something here. That is exactly what keeps "places" and "commands" under one
   term: what happens on choosing is the caller's decision.

   It searches by subsequence instead of by substring: `cf` finds "Charge
   freigeben". The matched characters stand in the accent, so that an unexpected
   find looks justified.

   `restingItems` fills the resting state - here all seven, because seven
   commands without a term would otherwise stand there as an empty window. The
   shell does it the other way round: all pages in the resting state would be
   exactly the full list this component abolished. */

const COMMANDS = [
  { id: "create-batch", label: "Create a batch", group: "Commands" },
  { id: "release-batch", label: "Release a batch", group: "Commands" },
  { id: "close-shift", label: "Close the shift", group: "Commands" },
  { id: "line-1", label: "Line 1 - filling", group: "Plant" },
  { id: "line-3", label: "Line 3 - labelling", group: "Plant" },
  { id: "daily-report", label: "Open the daily report", group: "Reports" },
  { id: "batch-log", label: "Export the batch log", group: "Reports" },
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
