import { Button, Divider, Stack } from "../../../src";

export const title = "Vertical in a bar";

/* Vertically it separates columns - typically groups of buttons in a bar. It
   needs a height from whatever it stands in; a `Stack` in row direction gives
   it one. */
export default function Vertical() {
  return (
    <Stack direction="row" gap={3} align="center">
      <Button size="sm" variant="ghost">
        Left
      </Button>
      <Divider orientation="vertical" />
      <Button size="sm" variant="ghost">
        Middle
      </Button>
      <Divider orientation="vertical" strong />
      <Button size="sm" variant="ghost">
        Right
      </Button>
    </Stack>
  );
}
