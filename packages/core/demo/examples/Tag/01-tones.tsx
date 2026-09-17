import { Stack, Tag } from "../../../src";

export const title = "Tones";

/* The tone is never the only information: beside every label stands its word.
   Whoever reads only the colour reads the same here as somebody who cannot
   distinguish it. */
export default function Tones() {
  return (
    <Stack direction="row" gap={2} wrap align="center">
      <Tag>Neutral</Tag>
      <Tag tone="accent">Accent</Tag>
      <Tag tone="success">Success</Tag>
      <Tag tone="warning">Warning</Tag>
      <Tag tone="danger">Error</Tag>
    </Stack>
  );
}
