import { Badge, Button, Stack, Text } from "../../../src";

export const title = "A row";
export const lead = "Set `direction` to `row` for parts beside one another; `align` and `justify` pass straight through to flexbox.";

export default function ARow() {
  return (
    <Stack gap={4}>
      <Stack direction="row" gap={2} align="center">
        <Button size="sm" variant="primary">
          Acknowledge
        </Button>
        <Button size="sm">Assign</Button>
        <Button size="sm" variant="ghost">
          Resolve
        </Button>
      </Stack>
      <Stack direction="row" gap={3} align="center" justify="space-between">
        <Text weight="medium">Checkout</Text>
        <Badge tone="danger">SEV1 open</Badge>
      </Stack>
    </Stack>
  );
}
