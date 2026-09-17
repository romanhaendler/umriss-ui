import { Badge, Stack, Text } from "../../../src";

export const title = "Status labels";

/* A badge stands at the edge of something else and never tells on its own: it
   counts, or it names a state the text beside it already carries. */
export default function Tones() {
  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2} wrap align="center">
        <Badge>Draft</Badge>
        <Badge tone="accent">New</Badge>
        <Badge tone="success">Released</Badge>
        <Badge tone="warning">Under review</Badge>
        <Badge tone="danger">Blocked</Badge>
      </Stack>
      <Text size="sm" tone="secondary">
        Batch A-2041 <Badge tone="success">Released</Badge> - the badge sits inside the sentence and
        repeats what the sentence says.
      </Text>
    </Stack>
  );
}
