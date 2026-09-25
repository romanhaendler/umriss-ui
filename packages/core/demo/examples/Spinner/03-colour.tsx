import { Spinner, Stack, Text } from "../../../src";

export const title = "Colour";
export const lead = "It draws in `currentColor`, so it takes the colour of whatever it stands in and needs no tone of its own.";

export default function Colour() {
  return (
    <Stack direction="row" gap={5} align="center" wrap>
      <Stack direction="row" gap={2} align="center">
        <Spinner size={14} />
        <Text size="sm">Refreshing</Text>
      </Stack>
      <Stack direction="row" gap={2} align="center" style={{ color: "var(--u-color-accent)" }}>
        <Spinner size={14} />
        <Text as="span" size="sm" style={{ color: "inherit" }}>
          Syncing the calendar
        </Text>
      </Stack>
    </Stack>
  );
}
