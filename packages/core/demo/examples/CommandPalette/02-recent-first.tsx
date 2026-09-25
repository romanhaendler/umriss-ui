import { useState } from "react";
import { Button, CommandPalette, Stack, Text } from "../../../src";
import type { CommandPaletteItem } from "../../../src";

export const title = "Show recent choices first";
export const lead = "`restingItems` fills the empty palette with the last three choices, and a `weight` ranks them higher while typing; the memory is yours.";

const PLACES: CommandPaletteItem[] = [
  { id: "CC-1100", label: "Sales", group: "Cost centres" },
  { id: "CC-1200", label: "Marketing", group: "Cost centres" },
  { id: "CC-2100", label: "Engineering", group: "Cost centres" },
  { id: "CC-3100", label: "Customer service", group: "Cost centres" },
  { id: "CC-4300", label: "IT", group: "Cost centres" },
  { id: "INV-26-0318", label: "INV-26-0318 Brandlow Office Supply", group: "Invoices" },
  { id: "INV-26-0317", label: "INV-26-0317 Kettering & Shaw Events", group: "Invoices" },
];

export default function RecentFirst() {
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>(["CC-1200", "INV-26-0317"]);

  const items = PLACES.map((place) => (recent.includes(place.id) ? { ...place, weight: 2 } : place));
  const resting = recent.map((id) => items.find((item) => item.id === id)!).map((item) => ({ ...item, group: "Recent" }));

  return (
    <Stack gap={3} align="flex-start">
      <Button onClick={() => setOpen(true)}>Go to …</Button>
      <Text size="xs" tone="muted">
        Recent: {recent.join(", ")}
      </Text>
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        items={items}
        restingItems={resting}
        onChoose={(id) => {
          setOpen(false);
          setRecent((list) => [id, ...list.filter((one) => one !== id)].slice(0, 3));
        }}
      />
    </Stack>
  );
}
