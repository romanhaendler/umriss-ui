import { useState } from "react";
import { FormField, Select, Stack, Text } from "../../../src";

export const title = "Clear the choice";
export const lead = "For an optional choice set `clearable` with `onClear`; the cross appears once something is chosen.";

export default function ClearTheChoice() {
  const [owner, setOwner] = useState("helen");

  return (
    <Stack gap={3} style={{ maxWidth: 320 }}>
      <FormField label="Filter by budget owner">
        <Select clearable value={owner} onChange={(event) => setOwner(event.target.value)} onClear={() => setOwner("")}>
          <option value="" disabled>
            All owners
          </option>
          <option value="helen">Helen Marsh</option>
          <option value="rafael">Rafael Ortiz</option>
          <option value="anika">Anika Sørensen</option>
        </Select>
      </FormField>
      <Text size="xs" tone="muted" mono>
        value: "{owner}"
      </Text>
    </Stack>
  );
}
