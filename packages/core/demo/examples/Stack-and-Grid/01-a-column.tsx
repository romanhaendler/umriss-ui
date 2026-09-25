import { Stack, Text } from "../../../src";

export const title = "A column";
export const lead = "Stack parts below one another and set the space between them with `gap`, a step of the 4 px scale.";

export default function AColumn() {
  return (
    <Stack gap={2}>
      <Text size="xs" tone="muted">
        INC-1048 · SEV1 · opened 09:42
      </Text>
      <Text weight="medium">Checkout slow, card payments time out</Text>
      <Text size="sm" tone="secondary">
        Assigned to Jonas Keller, acknowledged at 09:46.
      </Text>
    </Stack>
  );
}
