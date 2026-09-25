import { Divider, Stack, Text } from "../../../src";

export const title = "A line";
export const lead = "Put a `Divider` between two groups; without a label it is decoration and hidden from assistive technology.";

export default function ALine() {
  return (
    <Stack gap={3} style={{ maxWidth: 480 }}>
      <Text size="sm">Tour T-01 · FP 214 K · Martin Hale</Text>
      <Divider />
      <Text size="sm" tone="secondary">
        11 stops · 86 km · back at the North depot at 13:40
      </Text>
    </Stack>
  );
}
