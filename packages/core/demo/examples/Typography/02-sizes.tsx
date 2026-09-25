import { Stack, Text } from "../../../src";

export const title = "Sizes";
export const lead = "Six steps from `xs` to `2xl`; `md` is body text, `sm` and `xs` carry dense tables, hints and timestamps.";

export default function Sizes() {
  return (
    <Stack gap={2}>
      <Text size="2xl">2xl · Q1 budget review</Text>
      <Text size="xl">xl · Marketing is 12 % over plan</Text>
      <Text size="lg">lg · Cost centre CC-1200</Text>
      <Text size="md">md · Actuals are booked until the end of February.</Text>
      <Text size="sm">sm · Forecast updated by Rafael Ortiz</Text>
      <Text size="xs">xs · Last booking 17/03/2026 10:30</Text>
    </Stack>
  );
}
