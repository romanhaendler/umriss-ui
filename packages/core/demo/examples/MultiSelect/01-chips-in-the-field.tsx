import { useState } from "react";
import { FormField, MultiSelect, Stack, Text } from "../../../src";

export const title = "Chips in the field";
export const lead = "The chosen values stand as chips; what does not fit becomes a “+N” button that opens the chosen view.";

const PEOPLE = [
  { value: "maya", label: "Maya Lindgren" },
  { value: "arjun", label: "Arjun Mehta" },
  { value: "chloe", label: "Chloe Durand" },
  { value: "noah", label: "Noah Fischer" },
  { value: "eva", label: "Eva Novak" },
  { value: "luis", label: "Luis Moreno" },
  { value: "hana", label: "Hana Sato" },
  { value: "kofi", label: "Kofi Mensah" },
];

export default function ChipsInTheField() {
  const [team, setTeam] = useState<string[]>(["arjun", "noah", "eva", "hana"]);

  return (
    <Stack gap={3} style={{ maxWidth: 360 }}>
      <FormField label="Project team">
        <MultiSelect value={team} onChange={setTeam} placeholder="Choose people" options={PEOPLE} />
      </FormField>
      <Text size="xs" tone="muted" mono>
        value: [{team.join(", ")}]
      </Text>
    </Stack>
  );
}
