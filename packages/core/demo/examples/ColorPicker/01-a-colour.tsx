import { useState } from "react";
import { ColorPicker, FormField, Stack, Text } from "../../../src";

export const title = "A colour";
export const lead = "The value is a lowercase `#rrggbb` string or `null`. Type or paste a hex colour in the panel (`#2563eb`, `2563EB`, `#26e`); `onValueChange` runs as soon as the text is a whole colour. Done or a click outside keeps the colour, Cancel or Escape puts the old one back.";

export default function AColour() {
  const [colour, setColour] = useState<string | null>("#2563eb");

  return (
    <Stack gap={3} style={{ maxWidth: 320 }}>
      <FormField label="Line colour">
        <ColorPicker value={colour} onValueChange={setColour} />
      </FormField>
      <Text size="xs" tone="muted" mono>
        value: {colour === null ? "null" : colour}
      </Text>
    </Stack>
  );
}
