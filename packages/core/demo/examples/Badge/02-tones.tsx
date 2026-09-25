import { Badge, Stack } from "../../../src";

export const title = "Tones";
export const lead = "Give each state one `tone` and keep it across the application; the word inside always says the same as the colour.";

export default function Tones() {
  return (
    <Stack direction="row" gap={2} wrap align="center">
      <Badge>To do</Badge>
      <Badge tone="accent">In progress</Badge>
      <Badge tone="warning">In review</Badge>
      <Badge tone="success">Done</Badge>
      <Badge tone="danger">Blocked</Badge>
    </Stack>
  );
}
