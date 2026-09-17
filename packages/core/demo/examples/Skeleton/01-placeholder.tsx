import { Skeleton, Stack } from "../../../src";

export const title = "A placeholder in the shape of the content";

/* A placeholder holds the height the content will have. Otherwise the page
   jumps as soon as it has loaded - and a jump after the waiting is exactly the
   moment somebody clicks beside the thing.

   That is why it has the shape of what is coming: a circle for the picture, two
   lines of different length for the name and the line beneath it. */
export default function Placeholder() {
  return (
    <Stack gap={3} style={{ maxWidth: "420px" }}>
      <Stack direction="row" gap={3} align="center">
        <Skeleton circle width={32} height={32} />
        <Stack gap={2} style={{ flex: 1 }}>
          <Skeleton width="60%" />
          <Skeleton width="35%" height={10} />
        </Stack>
      </Stack>
      <Skeleton />
      <Skeleton width="80%" />
    </Stack>
  );
}
