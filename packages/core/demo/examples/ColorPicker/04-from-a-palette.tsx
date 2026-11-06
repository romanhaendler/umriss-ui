import { useState } from "react";
import { ColorPicker, FormField, Stack, Text } from "../../../src";

export const title = "Choose from a palette";
export const lead = "`swatches` hands in the colours your organisation agreed on, each with a `name` for the hover and the screen reader. The swatch that matches the colour is pressed; a click applies it like any other step. Free choice stays: the square and the hex field are still there.";

const PALETTE = [
  { name: "Ocean", value: "#2563eb" },
  { name: "Forest", value: "#059669" },
  { name: "Amber", value: "#d97706" },
  { name: "Coral", value: "#f97316" },
  { name: "Berry", value: "#be123c" },
  { name: "Violet", value: "#7c3aed" },
  { name: "Slate", value: "#475569" },
  { name: "Ink", value: "#161618" },
];

export default function FromAPalette() {
  const [colour, setColour] = useState<string | null>("#059669");

  return (
    <Stack gap={3} style={{ maxWidth: 320 }}>
      <FormField label="Task category">
        <ColorPicker value={colour} onValueChange={setColour} swatches={PALETTE} />
      </FormField>
      <Text size="xs" tone="muted" mono>
        value: {colour === null ? "null" : colour}
      </Text>
    </Stack>
  );
}
