import { useState } from "react";
import { Combobox, FormField, Stack, Text } from "../../../src";

export const title = "Combobox";
export const lead = "Typing filters the `options`; `onChange` runs only when a row is chosen or cleared, with one value or `null`.";

const DRIVERS = [
  { value: "d1", label: "Martin Hale" },
  { value: "d2", label: "Nadia Petrova" },
  { value: "d3", label: "Owen Carter" },
  { value: "d4", label: "Lucia Romero" },
  { value: "d5", label: "Ben Adeyemi" },
  { value: "d6", label: "Hanna Berg" },
  { value: "d7", label: "Yusuf Demir" },
  { value: "d8", label: "Clara Wendt" },
];

export default function PickADriver() {
  const [driver, setDriver] = useState<string | null>(null);

  return (
    <Stack gap={3} style={{ maxWidth: 320 }}>
      <FormField label="Driver, tour T-04">
        <Combobox value={driver} onChange={setDriver} clearable options={DRIVERS} placeholder="Type a name" />
      </FormField>
      <Text size="xs" tone="muted" mono>
        value: {driver === null ? "null" : `"${driver}"`}
      </Text>
    </Stack>
  );
}
