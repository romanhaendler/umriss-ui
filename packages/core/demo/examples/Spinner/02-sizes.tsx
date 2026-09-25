import { Spinner, Stack } from "../../../src";

export const title = "Sizes";
export const lead = "`size` is the edge length in pixels; match it to the text it stands beside – 12 for small print, 14 for body text.";

export default function Sizes() {
  return (
    <Stack direction="row" gap={4} align="center">
      <Spinner size={12} />
      <Spinner size={14} />
      <Spinner size={20} />
      <Spinner size={32} />
    </Stack>
  );
}
