import { Skeleton, Stack } from "../../../src";

export const title = "Lines of text to come";
export const lead = "A line per line of text, the last one shorter, so the placeholder has the height the text will have.";

export default function Lines() {
  return (
    <Stack gap={2} style={{ maxWidth: 420 }}>
      <Skeleton />
      <Skeleton />
      <Skeleton width="60%" />
    </Stack>
  );
}
