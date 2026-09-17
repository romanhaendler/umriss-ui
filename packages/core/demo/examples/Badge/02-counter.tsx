import { Badge, Button, Stack } from "../../../src";

export const title = "A counter as a pill";

/* `pill` is the fully rounded shape for numbers. The difference is not taste:
   a number in the slightly rounded label shape reads as a word, one in the
   pill reads as a quantity. */
export default function Counter() {
  return (
    <Stack direction="row" gap={3} wrap align="center">
      <Badge pill>3</Badge>
      <Badge pill tone="accent">
        12
      </Badge>
      <Badge pill tone="danger">
        99+
      </Badge>
      <Button size="sm">
        Inbox <Badge pill tone="accent">7</Badge>
      </Button>
    </Stack>
  );
}
