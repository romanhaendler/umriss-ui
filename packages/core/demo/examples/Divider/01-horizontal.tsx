import { Divider, Stack, Text } from "../../../src";

export const title = "Horizontal, with and without a label";

/* Without a label the line is decorative and is taken out of the accessibility
   tree; with a label it really separates something and becomes a named
   separator. `strong` is for section boundaries, the fine line for separating
   rows. */
export default function Horizontal() {
  return (
    <Stack gap={3}>
      <Text size="sm" tone="secondary">
        A fine line above, a strong one below.
      </Text>
      <Divider />
      <Text size="sm" tone="secondary">
        Between two sections.
      </Text>
      <Divider strong />
      <Divider label="Section" />
      <Text size="sm" tone="secondary">
        And on it goes.
      </Text>
    </Stack>
  );
}
