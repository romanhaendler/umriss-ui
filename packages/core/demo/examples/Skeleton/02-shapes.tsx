import { Skeleton, Stack } from "../../../src";

export const title = "Shapes";
export const lead = "`circle`, `width` and `height` give it the shape of what comes – an avatar, a name, a line beneath it.";

export default function Shapes() {
  return (
    <Stack direction="row" gap={3} align="center" style={{ maxWidth: 420 }}>
      <Skeleton circle width={32} height={32} />
      <Stack gap={2} style={{ flex: 1 }}>
        <Skeleton width="55%" height={14} />
        <Skeleton width="35%" height={10} />
      </Stack>
    </Stack>
  );
}
