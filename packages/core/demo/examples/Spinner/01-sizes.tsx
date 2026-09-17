import { Spinner, Stack, Text } from "../../../src";

export const title = "Sizes and colour";

/* The loading indicator `Button` uses itself. It takes `currentColor` - the
   colour of whatever it stands in - and therefore needs no tone property of its
   own.

   It never stands alone: a spinner without a word says only that something is
   running, and not what. */
export default function Sizes() {
  return (
    <Stack direction="row" gap={4} align="center" wrap>
      <Spinner size={12} />
      <Spinner size={14} />
      <Spinner size={20} />
      <Stack direction="row" gap={2} align="center">
        <Spinner size={14} />
        <Text size="sm" tone="secondary">
          Loading data ...
        </Text>
      </Stack>
      <Stack direction="row" gap={2} align="center" style={{ color: "var(--u-color-accent)" }}>
        <Spinner size={14} />
        <Text size="sm" tone="secondary">
          It takes the colour of its surroundings
        </Text>
      </Stack>
    </Stack>
  );
}
