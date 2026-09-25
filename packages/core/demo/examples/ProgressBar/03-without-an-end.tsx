import { ProgressBar, Stack, Text } from "../../../src";

export const title = "Run without a known end";
export const lead = "Leave out `value` when nobody knows how far it is; the bar runs and shows no figure.";

export default function WithoutAnEnd() {
  return (
    <Stack gap={2} style={{ maxWidth: 420 }}>
      <Text size="sm">Waiting for the payment provider to confirm …</Text>
      <ProgressBar label="Waiting for the payment provider" />
    </Stack>
  );
}
