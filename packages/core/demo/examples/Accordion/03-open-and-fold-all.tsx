import { useState } from "react";
import { Accordion, AccordionItem, Button, Stack, Text } from "../../../src";

export const title = "Open and fold all";
export const lead = "Control `value` with `onChange` when a toolbar opens every section at once, or an address keeps which stand open.";

const SECTIONS = [
  { value: "vehicle", title: "Vehicle", text: "FP 377 K, an e-van with 900 kg payload, charged to 92 %." },
  { value: "driver", title: "Driver", text: "Nadia Petrova, on the road since 07:30, break due at 11:45." },
  { value: "stops", title: "Stops", text: "10 stops, 6 delivered, 1 failed attempt, 3 to go." },
];

export default function OpenAndFoldAll() {
  const [open, setOpen] = useState<string[]>(["stops"]);

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
