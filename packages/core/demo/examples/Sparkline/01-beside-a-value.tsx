import { Sparkline, Stack, Text } from "../../../src";

export const title = "Beside a value";
export const lead = "Pass the values in time order as `data`; the line shows their shape and the figure beside it gives the value.";

export default function BesideAValue() {
  return (
    <Stack direction="row" gap={3} align="center">
      <Text as="span" size="sm">
        Parcels delivered per hour
      </Text>
      <Sparkline data={[42, 58, 71, 66, 80, 74, 88]} />
      <Text as="span" size="sm" mono>
        88
      </Text>
    </Stack>
  );
}
