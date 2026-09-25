import { Divider, Stack, Text } from "../../../src";

export const title = "Strength and label";
export const lead = "The fine line separates rows, `strong` marks a section boundary, and a `label` makes the line a named separator.";

export default function StrengthAndLabel() {
  return (
    <Stack gap={3} style={{ maxWidth: 480 }}>
      <Text size="sm">Stop 1 · Holloway Garden Supplies · 07:25</Text>
      <Divider />
      <Text size="sm">Stop 2 · Oakridge Pharmacy · 07:48</Text>
      <Divider strong />
      <Divider label="Afternoon" />
      <Text size="sm">Stop 8 · Pellham Hardware · 12:05</Text>
    </Stack>
  );
}
