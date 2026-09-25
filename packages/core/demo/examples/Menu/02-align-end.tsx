import { Button, Menu, MenuItem, Stack, Text } from "../../../src";

export const title = "Align with the right edge";
export const lead = "For a trigger at the right of a header, `align` set to `end` lines the panel up with the trigger's right edge.";

export default function AlignEnd() {
  return (
    <Stack direction="row" justify="space-between" align="center" style={{ maxWidth: 520 }}>
      <Text weight="medium">Budget 2026 · Marketing</Text>
      <Menu align="end" trigger={<Button size="sm" variant="ghost">View</Button>}>
        <MenuItem>Show forecast</MenuItem>
        <MenuItem>Show last year</MenuItem>
        <MenuItem>Show in thousands</MenuItem>
      </Menu>
    </Stack>
  );
}
