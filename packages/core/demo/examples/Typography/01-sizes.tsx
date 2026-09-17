import { Heading, Stack, Text } from "../../../src";

export const title = "The scale";

/* Size, weight and tone come out of a scale and not out of numbers. The library
   prescribes no line length - the application sets that, because only it knows
   how wide its column is. */
export default function Sizes() {
  return (
    <Stack gap={3}>
      <Heading level={2} size="2xl">
        Component overview
      </Heading>
      <Heading level={3} size="xl">
        Data-dense tables
      </Heading>
      <Heading level={4} size="lg">
        Columns and sorting
      </Heading>
      <Text size="md">
        Body text at the base size. It carries what is meant to be read, and nothing further.
      </Text>
      <Text size="sm" tone="secondary">
        Small body text in the second text colour - for help texts and incidentals.
      </Text>
      <Text size="xs" tone="muted">
        The smallest step, dimmed: footnotes, timestamps, statements of origin.
      </Text>
    </Stack>
  );
}
