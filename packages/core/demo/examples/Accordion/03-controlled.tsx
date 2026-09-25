import { useState } from "react";
import { Accordion, AccordionItem, Button, Stack, Text } from "../../../src";

export const title = "Controlled: open all, fold all";

/* Controlled, the open sections are the caller's list: `value` shows it,
   `onChange` reports the header's wish. That is what lets a toolbar open
   every section at once, or an address keep which ones stand open. */

const SECTIONS = [
  { value: "raw", title: "Raw materials", text: "Sugar 1,850 kg, citric acid 36 kg, lemon concentrate 960 l." },
  { value: "water", title: "Water treatment", text: "Conductivity 42 µS/cm, below the recipe's 50." },
  { value: "co2", title: "Carbonation", text: "5.8 g/l at 4 °C, inside the tolerance of 5.5 to 6.2." },
];

export default function Controlled() {
  const [open, setOpen] = useState<string[]>(["water"]);

  return (
    <Stack gap={3} style={{ maxWidth: 520 }}>
      <Stack direction="row" gap={2} align="center">
        <Button size="sm" onClick={() => setOpen(SECTIONS.map((s) => s.value))}>
          Open all
        </Button>
        <Button size="sm" onClick={() => setOpen([])}>
          Fold all
        </Button>
        <Text size="xs" tone="muted">
          {open.length} of {SECTIONS.length} open
        </Text>
      </Stack>
      <Accordion type="multiple" value={open} onChange={setOpen}>
        {SECTIONS.map((s) => (
          <AccordionItem key={s.value} value={s.value} title={s.title}>
            {s.text}
          </AccordionItem>
        ))}
      </Accordion>
    </Stack>
  );
}
