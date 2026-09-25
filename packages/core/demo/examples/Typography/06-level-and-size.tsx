import { Heading, Stack, Text } from "../../../src";

export const title = "Choose the level apart from the size";
export const lead = "Pick `level` for the page's outline and `size` for the eye; a small card title can still be a second-level heading.";

export default function LevelAndSize() {
  return (
    <Stack gap={3}>
      <Heading level={2} size="sm" tone="secondary">
        Open incidents
      </Heading>
      <Heading level={3} size="xl">
        INC-1048 · Checkout slow, card payments time out
      </Heading>
      <Text size="sm" tone="secondary">
        A screen reader lists "Open incidents" as the section and the incident inside it, whatever
        their sizes.
      </Text>
    </Stack>
  );
}
