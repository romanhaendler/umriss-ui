import { Stack, Text } from "../../../src";

export const title = "Tones and weights";
export const lead = "Step text back with `tone` rather than a colour of your own; `weight` has three steps, `medium` for emphasis inside a line.";

export default function TonesAndWeights() {
  return (
    <Stack gap={2}>
      <Text weight="semibold">Tour T-03 · North depot</Text>
      <Text>
        14 stops, <Text as="span" weight="medium">2 running late</Text>
      </Text>
      <Text size="sm" tone="secondary">
        Driver Martin Hale · van FP 214 K
      </Text>
      <Text size="xs" tone="muted">
        Position reported 3 minutes ago
      </Text>
    </Stack>
  );
}
