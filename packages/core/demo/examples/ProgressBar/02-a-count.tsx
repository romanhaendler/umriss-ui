import { ProgressBar, Stack, Text } from "../../../src";

export const title = "Count instead of a share";
export const lead = "Where a count says it better, pass it as `valueText`: a screen reader hears “5 of 12 parcels” instead of a percentage.";

export default function ACount() {
  return (
    <Stack gap={2} style={{ maxWidth: 420 }}>
      <Text size="sm">5 of 12 parcels scanned onto FP 214 K</Text>
      <ProgressBar value={5 / 12} label="Loading of tour T-01" valueText="5 of 12 parcels" />
    </Stack>
  );
}
