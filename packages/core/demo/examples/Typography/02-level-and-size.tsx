import { Heading, Stack, Text } from "../../../src";

export const title = "Level and size are independent";

/* `level` is the document's outline level, `size` the optical size. Whoever
   couples the two eventually picks the wrong level in order to get the right
   size - and the outline a screen reader depends on becomes a consequence of a
   design decision. */
export default function LevelAndSize() {
  return (
    <Stack gap={3}>
      <Heading level={2} size="sm">
        A second-level heading in small type
      </Heading>
      <Heading level={4} size="xl">
        A fourth-level heading in large type
      </Heading>
      <Text size="sm" tone="secondary">
        Both are right where they stand. Without the separation one of them would be a lie about the
        outline.
      </Text>
    </Stack>
  );
}
