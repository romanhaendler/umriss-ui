import { Button, Divider, Stack } from "../../../src";

export const title = "Upright in a bar";
export const lead = "Set `orientation` to `vertical` between groups of buttons; it takes its height from a row `Stack`.";

export default function UprightInABar() {
  return (
    <Stack direction="row" gap={3} align="center">
      <Button size="sm" variant="ghost">
        This sprint
      </Button>
      <Button size="sm" variant="ghost">
        Next sprint
      </Button>
      <Divider orientation="vertical" />
      <Button size="sm" variant="ghost">
        By person
      </Button>
      <Button size="sm" variant="ghost">
        By project
      </Button>
      <Divider orientation="vertical" strong />
      <Button size="sm" variant="ghost">
        Export
      </Button>
    </Stack>
  );
}
