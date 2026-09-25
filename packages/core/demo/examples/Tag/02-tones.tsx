import { Stack, Tag } from "../../../src";

export const title = "Tones";
export const lead = "Every `tone` keeps its contrast in both themes, and the word beside the colour carries the meaning on its own.";

export default function Tones() {
  return (
    <Stack direction="row" gap={2} wrap align="center">
      <Tag>Van</Tag>
      <Tag tone="accent">E-van</Tag>
      <Tag tone="success">On time</Tag>
      <Tag tone="warning">Window at risk</Tag>
      <Tag tone="danger">Failed attempt</Tag>
    </Stack>
  );
}
