import { useState } from "react";
import { FormField, MultiSelect, Stack, Text } from "../../../src";

export const title = "Chips in the field, and the counter";

/* The trigger stays on one line and measures the room: as many chips as fit,
   the rest as "+N". The counter is not a hint but a button - it opens the panel
   directly in the "chosen" view, because that is the question it raises.

   Chips are removed by a click, backspace deletes the most recently chosen one,
   the arrow keys travel across the chips. */

const AREAS = [
  { value: "analysis", label: "Analysis" },
  { value: "backend", label: "Backend" },
  { value: "purchasing", label: "Purchasing" },
  { value: "design", label: "Design" },
  { value: "docs", label: "Documentation" },
  { value: "frontend", label: "Frontend" },
  { value: "infra", label: "Infrastructure" },
  { value: "quality", label: "Quality assurance" },
  { value: "sales", label: "Sales" },
];

export default function ChipsInTheField() {
  const [areas, setAreas] = useState<string[]>(["backend", "frontend", "design"]);

  return (
    <Stack gap={3} style={{ maxWidth: "360px" }}>
      <FormField label="Areas" hint="Remove chips by a click; +N opens the chosen view.">
        <MultiSelect
          value={areas}
          onChange={setAreas}
          placeholder="Choose areas"
          options={AREAS}
        />
      </FormField>
      <Text size="xs" tone="muted">
        Value: [{areas.join(", ")}]
      </Text>
    </Stack>
  );
}
