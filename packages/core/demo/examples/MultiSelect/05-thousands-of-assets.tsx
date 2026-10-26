import { useState } from "react";
import { FormField, MultiSelect, Stack, Text } from "../../../src";

export const title = "Thousands of assets";
export const lead = "A list of more than 500 options draws only the checkboxes in view; All, None and Invert still act on every match of the search. Press End in the list for the last asset.";

const KINDS = ["Pump", "Valve", "Sensor", "Motor", "Gearbox"];
const ASSETS = Array.from({ length: 3000 }, (_, index) => ({
  value: `asset-${index + 1}`,
  label: `A-${String(index + 1).padStart(4, "0")} ${KINDS[index % KINDS.length]}`,
}));

export default function ThousandsOfAssets() {
  const [assets, setAssets] = useState<string[]>([]);

  return (
    <Stack gap={3} style={{ maxWidth: 320 }}>
      <FormField label="Assets">
        <MultiSelect value={assets} onChange={setAssets} options={ASSETS} clearable placeholder="Choose assets" searchPlaceholder="Search assets" />
      </FormField>
      <Text size="xs" tone="muted" mono>
        chosen: {assets.length}
      </Text>
    </Stack>
  );
}
