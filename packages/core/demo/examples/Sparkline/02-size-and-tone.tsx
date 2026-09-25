import { Sparkline, Stack } from "../../../src";

export const title = "Size and tone";
export const lead = "`width` and `height` default to a table row; the `accent` tone picks out the one line among several that matters.";

const WEEK = [18, 22, 21, 30, 27, 35, 33];

export default function SizeAndTone() {
  return (
    <Stack direction="row" gap={5} align="center" wrap>
      <Sparkline data={WEEK} />
      <Sparkline data={WEEK} width={160} height={40} />
      <Sparkline data={WEEK} width={160} height={40} tone="accent" />
    </Stack>
  );
}
