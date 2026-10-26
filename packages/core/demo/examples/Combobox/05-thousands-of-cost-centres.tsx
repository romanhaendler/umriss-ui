import { useState } from "react";
import { Combobox, FormField, Stack, Text } from "../../../src";

export const title = "Thousands of cost centres";
export const lead = "A list of more than 500 options draws only the options in view; a shorter one is drawn whole. Press End in the open list for the last cost centre.";

const CENTRES = Array.from({ length: 5000 }, (_, index) => ({
  value: `cc-${index + 1}`,
  label: `CC-${String(index + 1).padStart(4, "0")} ${["Sales", "Marketing", "Engineering", "Design", "Support"][index % 5]}`,
}));

export default function ThousandsOfCostCentres() {
  const [centre, setCentre] = useState<string | null>(null);

  return (
    <Stack gap={3} style={{ maxWidth: 320 }}>
      <FormField label="Cost centre">
        <Combobox value={centre} onChange={setCentre} clearable options={CENTRES} placeholder="Type a number or a name" />
      </FormField>
      <Text size="xs" tone="muted" mono>
        value: {centre === null ? "null" : `"${centre}"`}
      </Text>
    </Stack>
  );
}
