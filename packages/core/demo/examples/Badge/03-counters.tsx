import { Badge, Button, Stack } from "../../../src";

export const title = "Counters";
export const lead = "`pill` is the shape for numbers: a number in it reads as a quantity. Cap long counts yourself, as in “99+”.";

function capped(count: number) {
  return count > 99 ? "99+" : String(count);
}

export default function Counters() {
  return (
    <Stack direction="row" gap={3} wrap align="center">
      <Button size="sm">
        Open incidents <Badge pill tone="danger">{capped(2)}</Badge>
      </Button>
      <Button size="sm">
        Alerts <Badge pill tone="accent">{capped(7)}</Badge>
      </Button>
      <Button size="sm">
        Resolved this month <Badge pill>{capped(148)}</Badge>
      </Button>
    </Stack>
  );
}
