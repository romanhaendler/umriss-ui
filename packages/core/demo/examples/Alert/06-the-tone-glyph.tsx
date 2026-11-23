import { Stack, Text, ToneGlyph } from "../../../src";

export const title = "The tone glyph";
export const lead = "`ToneGlyph` is the icon the tones use: a message of your own can say its tone by shape as well as by colour; `size` is in pixels.";

export default function TheToneGlyph() {
  return (
    <Stack gap={2}>
      <Text>
        <ToneGlyph tone="success" size={16} /> Import finished
      </Text>
      <Text>
        <ToneGlyph tone="warning" size={16} /> 3 rows were skipped
      </Text>
      <Text>
        <ToneGlyph tone="danger" size={20} /> The export failed
      </Text>
    </Stack>
  );
}
